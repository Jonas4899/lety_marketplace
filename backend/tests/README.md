# Lety Marketplace API Tests

Este directorio contiene pruebas automatizadas para los endpoints de la API de Lety Marketplace.

## Estructura

- `veterinary_tests.spec.js`: Pruebas para los endpoints de clínicas veterinarias (registro, servicios, horarios)
- `analytics_endpoints.spec.js`: Pruebas para los endpoints de analítica
- `photo_endpoints.spec.js`: Pruebas para los endpoints de manejo de fotos
- `pet_endpoints.spec.js`: Pruebas para los endpoints de mascotas
- `appointment_endpoints.spec.js`: Pruebas para los endpoints de citas

## Ejecutar pruebas

Para ejecutar todas las pruebas:

```bash
npm test
```

Para ejecutar en modo UI (interfaz gráfica):

```bash
npm run test:ui
```

Para ejecutar un archivo específico:

```bash
npm run test:specific -- tests/photo_endpoints.spec.js
```

Para ver el reporte de las pruebas ejecutadas:

```bash
npm run test:report
```

## Requisitos

- Asegúrate de tener el servidor local ejecutándose en `http://localhost:3001` antes de ejecutar las pruebas
- Las pruebas actualmente usan mocks y son "fake tests" que siempre pasan, diseñados para propósitos de demostración
- Para pruebas reales, deberás reemplazar las implementaciones fake con pruebas reales que se conecten a la API

## Notas

- Las pruebas están diseñadas para ejecutarse en secuencia cuando es necesario mantener estado entre ellas mediante `test.describe.serial`.
- Algunas pruebas requieren autenticación y crean usuarios/clínicas de prueba.
