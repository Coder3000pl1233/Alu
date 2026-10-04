# M07 · Identidad, acceso mensual y administración

## Responsabilidades cerradas

- `lib/security/passwords.ts`: política configurable, generación inicial, hash y verificación Argon2id.
- `lib/identity/identity-service.ts`: login no enumerativo, rate limit y operaciones administrativas.
- `lib/security/authorization.ts`: reglas centrales de autenticación, rol, estado y `access_until` en UTC.
- `lib/identity/postgres-identity-store.ts`: persistencia y transacciones PostgreSQL.
- `server/app.ts`: rutas Fastify de login y administración, RBAC y respuestas seguras.

## Contraseñas

La configuración inicial usa Argon2id con 19 MiB de memoria, dos iteraciones y paralelismo uno. La política exige entre 12 y 128 caracteres, mayúscula, minúscula, número y símbolo. Los parámetros se inyectan en `IdentityService`, por lo que pueden cambiarse por ambiente sin modificar la lógica.

Una contraseña inicial se genera con aleatoriedad criptográfica, se devuelve una sola vez al administrador y únicamente su hash entra en `users`. Auditorías, errores y respuestas normales nunca incluyen `password_hash`.

## Login y límites

- La cuenta inexistente y la contraseña incorrecta producen `AUTH_INVALID_CREDENTIALS`.
- Para reducir diferencias temporales, una cuenta inexistente verifica un hash Argon2id de relleno.
- Correo e IP se convierten en HMAC-SHA-256 antes de guardarse como señales de rate limit.
- Política inicial: cinco fallos dentro de quince minutos, configurable.
- El intento y su resultado quedan auditados con `request_id`, nunca con la contraseña.

`RATE_LIMIT_PEPPER` debe ser un secreto independiente de al menos 32 caracteres. No se incluye en el repositorio.

## Autorización

`authorizeContent` debe utilizarse como pre-handler de toda futura ruta de catálogo, manifiesto o página. Rechaza sesión ausente, cuenta suspendida/revocada y estudiantes cuyo `access_until` sea nulo o menor/igual a la hora UTC actual.

`adminAuthorizationHook` exige además el rol `admin`. Las rutas administrativas no confían en datos enviados por el cliente para determinar el actor.

## Operaciones administrativas

El servicio cubre listar, consultar, crear y modificar usuarios. No elimina físicamente cuentas: suspender o revocar conserva trazabilidad. La extensión de acceso bloquea la fila, actualiza vigencia/estado y escribe auditoría `before/after` dentro de la misma transacción.

## Dependencia de M08

Después de validar credenciales, `POST /auth/login` entrega la identidad a `issueSession`. M08 implementará esa función con una sesión opaca, cookie segura, expiración y revocación. Hasta entonces la ruta puede probarse mediante inyección, pero no se habilita como autenticación productiva.
