# mobileTestApp

Aplicación de checkout de extremo a extremo: catálogo de productos, captura de datos de cliente, tokenización de tarjeta y procesamiento de pago contra el sandbox de un gateway de pagos.

Monorepo con dos proyectos independientes:

- [`frontend/`](frontend/README.md) — aplicación React Native (Android/iOS): navegación, formularios, estado global con Redux y persistencia cifrada.
- [`backend/`](backend/README.md) — servicio NestJS con arquitectura hexagonal: catálogo, transacciones e integración con el gateway de pagos (API + webhook firmado).

Cada carpeta tiene su propio `package.json`, dependencias y `.gitignore`. Consulta el README de cada una para instrucciones específicas de instalación, ejecución, pruebas, variables de entorno y decisiones técnicas.

## Arranque rápido de punta a punta

```sh
# 1. Backend + Postgres (aplica migraciones automáticamente)
cd backend
cp .env.example .env   # completa las llaves del gateway de pagos
docker compose --env-file .env up -d --build

# 2. Frontend
cd ../frontend
cp .env.example .env   # apunta API_BASE_URL al backend anterior
npm install
npm start
# en otra terminal:
npm run android
```

## Estado del proyecto

- Backend: 100% de cobertura de pruebas sobre código con lógica de negocio.
- Frontend: ~98% de cobertura de pruebas.
- Docker: build multi-stage verificado de extremo a extremo (migraciones automáticas incluidas).
- Android: build de release (`assembleRelease`) verificado; ver notas de compilación en Windows en el README del frontend.
