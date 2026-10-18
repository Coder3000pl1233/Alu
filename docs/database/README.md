# Base de datos de EntreApuntes

El esquema se define en `lib/db/schema.ts` y las migraciones versionadas están en `drizzle/`. La migración `0004` añade el marketplace; `0005` añade la verificación de correo y los tokens de un solo uso para recuperación. Las tablas de biblioteca por suscripción permanecen temporalmente mientras se reemplazan las pantallas heredadas.

```powershell
npm.cmd run db:generate
npm.cmd run db:check
npm.cmd run db:migrate
```

Revisar la migración generada antes de aplicarla. En el entorno local, PostgreSQL 18 escucha en `localhost:5432` y la base `aula_segura` pertenece al usuario `aula`; la URL está en `.env.local` (ignorado por Git). Para ejecutar `db:migrate` en otra sesión de PowerShell, definir `DATABASE_URL` en esa sesión o usar el valor predeterminado de `drizzle.config.ts`. No ejecutar migraciones contra producción sin copia de seguridad y plan de recuperación.

La prueba `lib/marketplace/postgres-integration.test.ts` comprueba la lectura persistida y el filtro público cuando `DATABASE_URL` está definida. Crea datos temporales y los elimina al terminar.

La prueba `lib/identity/seller-account-integration.test.ts` comprueba registro, verificación, sesión, recuperación y revocación de sesiones anteriores. En desarrollo, los enlaces de correo se guardan en `.local-mailbox.jsonl` y se leen desde `http://localhost:3000/dev/correos`; ambos quedan fuera de Git. Esta bandeja no se habilita en producción.
