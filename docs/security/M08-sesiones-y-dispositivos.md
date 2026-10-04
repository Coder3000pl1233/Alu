# M08 · Sesiones y dispositivos

## Diseño aplicado

El navegador recibe un token aleatorio de 256 bits en la cookie `__Host-aula_session`. PostgreSQL guarda solamente su HMAC-SHA-256. El token no se devuelve en JSON, no se guarda en `localStorage` y no puede reconstruirse desde la base.

La cookie usa siempre:

- `__Host-` y `Path=/` sin atributo `Domain`.
- `HttpOnly`.
- `Secure`.
- `SameSite=Lax`.

Por exigir `Secure`, la API real debe ejecutarse detrás de HTTPS incluso durante una prueba integrada. El modo frontend `demo` puede seguir usando HTTP local porque no crea una cookie real.

## Expiraciones y rotación

- Inactividad inicial: 30 minutos.
- Duración absoluta inicial: 7 días.
- Cada solicitud válida renueva solo la inactividad, sin superar el vencimiento absoluto.
- Una sesión vencida se revoca y nunca se reactiva.
- Un nuevo login bloquea la fila del usuario y revoca todas sus sesiones interactivas anteriores dentro de la misma transacción.
- Varias pestañas funcionan porque comparten la misma cookie y sesión.
- Cambiar la contraseña incrementa `session_version`, revoca el token actual y entrega uno nuevo ligado al mismo dispositivo.

Los tiempos se inyectan en `SessionService` y pueden configurarse por ambiente.

## Dispositivos

El frontend crea un UUID aleatorio. El backend persiste únicamente un HMAC compuesto por usuario e identificador. El nombre visible se limita a 100 caracteres. IP y fingerprint no forman parte de la identidad del dispositivo; se reservan como señales auxiliares de riesgo.

## Persistencia y concurrencia

- `devices_user_identifier_unique` evita duplicar el mismo dispositivo por usuario.
- `sessions_token_hash_unique` evita colisiones de tokens persistidos.
- La creación de sesión bloquea el usuario antes de revocar la anterior y crear la nueva.
- La resolución bloquea la sesión antes de comprobar revocación, expiraciones, dispositivo y `session_version`.
- Login, logout y creación de sesión generan eventos de auditoría sin guardar tokens.

## Archivos principales

- `lib/sessions/session-service.ts`: reglas y criptografía.
- `lib/sessions/postgres-session-store.ts`: transacciones PostgreSQL.
- `server/app.ts`: cookie y rutas `/auth/login`, `/auth/session`, `/auth/logout` y `/auth/password`.
- `drizzle/0002_bent_rattler.sql`: tablas e índices.
