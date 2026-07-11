# Backend

Servicio backend de checkout, construido con NestJS siguiendo una arquitectura hexagonal (domain / application / infrastructure / modules). Expone el catálogo de productos, procesa transacciones de pago contra el sandbox de un gateway de pagos, y recibe sus webhooks de confirmación.

## Arquitectura

```
src/
  domain/          entidades, value objects y contratos de repositorio (sin dependencias externas)
  application/      casos de uso, DTOs y mappers (orquestan el dominio, no conocen Nest ni Prisma)
  infrastructure/    adaptadores concretos: Prisma (Postgres) y el cliente del gateway de pagos
  modules/           módulos de Nest: wiring de controllers, providers y bindings de puertos -> adaptadores
  common/            filtro global de excepciones e interceptor de logging
  config/            configuración tipada y validación de variables de entorno (Joi)
```

Los casos de uso se definen como clases abstractas (puertos) y se enlazan a su implementación concreta vía `{ provide: X, useClass: Y }` en cada módulo. Esto mantiene `application/` desacoplado de Nest/Prisma y facilita testear cada capa de forma aislada.

### Flujo de transacciones

1. El frontend tokeniza la tarjeta directamente contra el gateway de pagos (la tarjeta nunca llega a este backend).
2. `POST /transactions` crea la transacción localmente y la envía al gateway con el token.
3. Si el gateway responde `PENDING`, el estado se resuelve por dos vías redundantes:
   - **Polling**: el frontend consulta `GET /transactions/:id` con backoff.
   - **Webhook**: `POST /transactions/webhook` recibe el evento `transaction.updated`, valida la firma (checksum SHA-256) y actualiza el estado.

Ambas vías conviven porque el backend se despliega en un host público (Railway): el webhook es la fuente de verdad más rápida y confiable en producción, mientras que el polling da resiliencia si el webhook no llega o durante desarrollo local sin URL pública.

## Variables de entorno

Copia `.env.example` a `.env` y completa los valores (nunca commitear `.env`):

| Variable | Descripción |
|---|---|
| `NODE_ENV` | `development` \| `test` \| `production` |
| `PORT` | Puerto HTTP del servicio |
| `DATABASE_URL` | Cadena de conexión Postgres |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` / `POSTGRES_PORT` | Usados solo por `docker-compose.yml` para levantar Postgres |
| `PAYMENT_GATEWAY_BASE_URL` | URL base del sandbox del gateway de pagos |
| `PAYMENT_GATEWAY_PUBLIC_KEY` / `PAYMENT_GATEWAY_PRIVATE_KEY` | Llaves del gateway (sandbox) |
| `PAYMENT_GATEWAY_EVENTS_KEY` | Llave usada para validar la firma de los webhooks |

Todas se validan al arrancar con Joi (`src/config/env.validation.ts`); el proceso falla rápido si falta alguna.

## Instalación y ejecución

### Local (sin Docker)

```sh
npm install
npx prisma migrate deploy   # aplica las migraciones sobre tu Postgres local
npx prisma db seed          # (opcional) carga productos de ejemplo
npm run start:dev
```

Requiere un Postgres accesible en `DATABASE_URL` (puedes levantar solo ese servicio con `docker compose up postgres -d`).

### Con Docker Compose (backend + Postgres)

```sh
docker compose --env-file .env up -d --build
```

El contenedor del backend corre `prisma migrate deploy` automáticamente antes de arrancar, así que una base de datos nueva queda lista sin pasos manuales. `docker-compose.yml` no contiene secretos: todas las llaves del gateway se inyectan desde tu `.env` local.

## Pruebas

```sh
npm test              # suite completa
npm run test:cov      # con reporte de cobertura
```

Cobertura actual: **100%** (statements/branches/functions/lines) sobre el código con lógica de negocio. El `collectCoverageFrom` excluye deliberadamente `main.ts`, `*.module.ts` (wiring de Nest sin lógica) y `*.dto.ts` (formas de datos sin comportamiento); se exige un mínimo de 80% vía `coverageThreshold` en `package.json`.

## Decisiones técnicas relevantes

- **Arquitectura hexagonal con puertos como clases abstractas**: permite testear casos de uso con mocks planos, sin levantar Nest ni Prisma en los tests unitarios.
- **Webhook + polling híbrido**: ver "Flujo de transacciones" arriba.
- **Verificación de firma del webhook**: `PaymentGatewayWebhookVerifier` recalcula el checksum SHA-256 (propiedades firmadas + timestamp + `PAYMENT_GATEWAY_EVENTS_KEY`) y rechaza cualquier evento que no coincida.
- **Prisma 7 config-based (`prisma.config.ts`)**: el datasource se resuelve por código (`env('DATABASE_URL')`) en vez de estar hardcodeado en `schema.prisma`. Por eso la imagen de Docker usa un `prisma.config.production.js` plano en CJS: el runtime de producción no incluye `ts-node`/TypeScript, y el archivo `.ts` transpilado con `tsc` (que usa el patrón de interop de ESM) no es aceptado por el parser de configuración de Prisma.
- **`tsconfig-paths` y `prisma` como dependencias de producción** (no dev): `main.ts` resuelve los alias (`@domain/*`, etc.) en runtime con `tsconfig-paths`, y el contenedor corre `prisma migrate deploy` al arrancar, por lo que ambos paquetes deben sobrevivir a `npm prune --omit=dev`.
