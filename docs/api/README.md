# API de EntreApuntes

[`openapi.yaml`](./openapi.yaml) es el contrato activo del marketplace. Define lecturas de publicaciones y, desde el punto 01, registro, sesión, verificación y recuperación del vendedor. Los puntos siguientes añadirán escritura de publicaciones, muestras, moderación y búsqueda avanzada.

El contrato antiguo de biblioteca por suscripción fue reemplazado. Algunas rutas y pantallas heredadas aún existen como demo durante la transición; no forman parte del MVP. Los clientes tipados están en `lib/marketplace/gateway.ts` y `lib/api/client.ts`.

## Convenciones

- Prefijo `/api/v1` y JSON en `snake_case`.
- Errores con `application/problem+json`, código estable y `request_id`.
- Lecturas públicas sin sesión. Lecturas propias con sesión activa; lectura administrativa con rol `admin`.
- Solo el estado `published` se consulta públicamente. Los datos de contacto no se incluyen en la ficha pública base.
- Fechas en ISO 8601 y UTC. El tamaño de página inicial está limitado a 50; paginación y filtros completos se añaden en F02.

## Validación

```powershell
npm.cmd run api:lint
npm.cmd run api:generate
npm.cmd run db:check
```

`lib/api/generated.ts` se genera desde OpenAPI y no se edita manualmente. Los códigos de error visibles se describen en [errors.md](./errors.md).
