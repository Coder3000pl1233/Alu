# Contrato de API P0

El archivo [`openapi.yaml`](./openapi.yaml) es la fuente de verdad inicial para la API de Aula Segura.

## Convenciones congeladas en M06-01

- Prefijo de API: `/api/v1`.
- JSON usa `snake_case`; TypeScript podrá adaptarlo sin cambiar el contrato externo.
- Fechas en ISO 8601 y UTC.
- Sesión web mediante cookie opaca `__Host-aula_session`.
- Errores JSON con media type `application/problem+json` y `request_id`.
- Paginación por cursor, no por número de página.
- Operaciones mutables reintentables exigen `Idempotency-Key` con UUID.
- El catálogo solo expone documentos publicados y autorizados.
- El visor nunca expone el PDF ni una URL permanente del original.
- La página protegida se entrega con watermark horneado y `private, no-store`.

## Límites del contrato actual

Este contrato define la superficie P0; todavía no implementa endpoints. M06, punto 2, congela el catálogo de errores y M06, punto 3, generará el cliente tipado. Recuperación de contraseña, desafío de dispositivo, MFA, reglas de riesgo y tiles quedan fuera de P0.

El catálogo de errores y su comportamiento visible está documentado en [`errors.md`](./errors.md).

## Validación

Antes de cambiar el contrato se debe ejecutar el lint de OpenAPI. Todo cambio incompatible exige actualizar frontend, ejemplos y documentación en el mismo cambio.

```powershell
npm.cmd run api:lint
npm.cmd run api:generate
```

El archivo `lib/api/generated.ts` es generado y no se edita manualmente. `lib/api/client.ts` consume esos tipos y `lib/auth-gateway.ts` mantiene la misma interfaz para API y demo.

## Activación de autenticación

- `NEXT_PUBLIC_AUTH_MODE=demo`: conserva la demostración sin backend.
- `NEXT_PUBLIC_AUTH_MODE=api`: login y guard consultan la API real.
- `NEXT_PUBLIC_API_BASE_URL`: origen y prefijo de la API, por ejemplo `http://localhost:4000/api/v1`.

El modo `demo` es únicamente para desarrollo y presentaciones del frontend. Antes de aceptar usuarios reales el despliegue debe usar `api`; M07 y M08 implementarán los endpoints y cookies server-side que hoy define el contrato.
