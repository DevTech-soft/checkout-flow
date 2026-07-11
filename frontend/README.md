# Frontend

Aplicación React Native (CLI, sin Expo) de checkout: catálogo de productos, captura de datos de envío, tokenización de tarjeta y confirmación de pago contra el backend y el sandbox de un gateway de pagos.

## Arquitectura

```
src/
  app/              punto de entrada de la app (providers globales: Redux, Toast, navegación)
  navigation/        stack de navegación y tipos de rutas
  features/          una carpeta por pantalla (Splash, Home, ProductDetail, Checkout, CardForm, PaymentSummary, TransactionResult)
  components/        componentes presentacionales reutilizables (Button, TextField, Toast, ErrorBanner, ...)
  services/          clientes HTTP: backend propio (products, transactions) y gateway de pagos (tokenización)
  redux/              slices de Redux Toolkit + middleware de persistencia cifrada
  storage/            adaptador de AsyncStorage + capa de cifrado (secureStorage)
  hooks/ · utils/ · theme/   utilidades transversales
```

### Flujo de pago

1. **CardForm**: la tarjeta se tokeniza **directamente contra el gateway de pagos** desde el cliente (`services/gateway/wompiClient.ts`), usando la llave pública. El número de tarjeta/CVV nunca se envía al backend propio — solo el token resultante. Esto reduce el alcance PCI de este proyecto al mínimo posible.
2. **PaymentSummary**: dispara `submitTransaction`, que llama al backend con el token de tarjeta y los datos del pedido.
3. Si la transacción queda `PENDING`, el servicio hace **polling con backoff exponencial** (`pollTransactionStatus`) hasta resolver el estado o agotar los intentos.
4. Cualquier error (tokenización, red, pago rechazado, timeout de polling) se muestra con un **Toast** global y no bloquea la navegación: `TransactionResult` siempre se muestra al final y refleja el estado real.

### Persistencia

El pedido, los datos de contacto y el resultado de la transacción se persisten cifrados (AES, `crypto-js`) en `AsyncStorage` para sobrevivir a un cierre de la app, y se rehidratan en `SplashScreen` al arrancar.

## Variables de entorno

Copia `.env.example` a `.env` (nunca commitear `.env`):

| Variable | Descripción |
|---|---|
| `API_BASE_URL` | URL base del backend propio |
| `WOMPI_BASE_URL` | URL base del sandbox del gateway de pagos (tokenización de tarjeta) |
| `WOMPI_PUBLIC_KEY` | Llave pública del gateway, usada solo para tokenizar desde el cliente |
| `REDUX_PERSIST_KEY` | Llave de cifrado AES para el estado persistido en disco |

## Instalación y ejecución

```sh
npm install
npm start          # Metro
npm run android     # en otra terminal, con un emulador/dispositivo conectado
```

> **iOS**: requiere `bundle install && bundle exec pod install` antes de `npm run ios` (ver guía oficial de React Native).

## Pruebas

```sh
npm test              # suite completa
npm test -- --coverage
```

Cobertura actual: **~98%** (statements/branches/functions/lines), con un mínimo de 80% exigido vía `coverageThreshold` en `jest.config.js`.

## Generar el APK de release (Android)

```sh
cd android
./gradlew assembleRelease
```

El APK queda en `android/app/build/outputs/apk/release/app-release.apk` (firmado con el keystore de debug incluido — suficiente para instalar y probar, no para publicar en Play Store).

> **Nota Windows**: si el proyecto vive en una ruta larga (p. ej. `C:\Users\...\algún-directorio-largo\...`), el codegen C++ de New Architecture (`react-native-gesture-handler`) puede fallar con *"Filename longer than 260 characters"* incluso con `LongPathsEnabled` activado en el registro, porque `ninja.exe` no respeta esa política. La solución confiable es compilar desde una ruta corta (p. ej. copiar el proyecto a `C:\rn\` o similar) — `subst` **no** funciona porque Windows resuelve la unidad virtual a la ruta real. En Linux/macOS este problema no existe.

## Decisiones técnicas relevantes

- **Tokenización de tarjeta desde el cliente**: la app llama al gateway de pagos directamente con la llave pública; el backend nunca ve el número de tarjeta ni el CVV.
- **Polling + Toast en vez de bloquear la UI**: un pago `PENDING` o un error de red no traban la navegación; el usuario siempre llega a la pantalla de resultado con feedback claro.
- **Persistencia cifrada**: se guarda el mínimo necesario para retomar un pedido interrumpido (pedido, contacto, resultado de transacción), no el token de tarjeta.
