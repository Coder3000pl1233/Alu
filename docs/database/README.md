# Base de datos P0

El esquema se define en `lib/db/schema.ts` y las migraciones versionadas se guardan en `drizzle/`.

## Comandos

```powershell
npm.cmd run db:generate
npm.cmd run db:check
npm.cmd run db:migrate
```

- `db:generate` crea una migración al cambiar el esquema.
- `db:check` valida el historial de migraciones sin conectarse a una base.
- `db:migrate` aplica migraciones usando `DATABASE_URL`; no debe ejecutarse contra producción sin revisar antes el SQL generado y contar con backup.

La migración inicial crea `users`. Solo persiste `password_hash`: una contraseña inicial podrá generarse y mostrarse una vez, pero nunca se guardará como texto ni en un campo temporal.
