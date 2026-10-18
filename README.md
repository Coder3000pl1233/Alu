# EntreApuntes

Marketplace de apuntes entre estudiantes. La persona que busca puede explorar publicaciones, revisar una muestra de cinco páginas y contactar al vendedor por WhatsApp. El pago y la entrega del material completo se acuerdan fuera de la plataforma.

El alcance del producto y los criterios para lanzar están en [MVP_SPEC.md](./MVP_SPEC.md). El comportamiento y los criterios de aceptación de cada función están en [FUNCIONALIDADES_MVP_SPEC.md](./FUNCIONALIDADES_MVP_SPEC.md). Estos documentos reemplazan los planes P0–P3 de la antigua plataforma por suscripción.

## Estado actual

La cuenta del vendedor ya funciona con PostgreSQL local: registro, sesión, verificación y recuperación. Catálogo, resultados, fichas, consultas, métricas y gran parte de la administración todavía usan datos simulados. El formulario de publicación aún no guarda borradores. No debe usarse con usuarios reales hasta completar el ciclo descrito en el spec y configurar envío real de correos.

`docs/api` y `docs/database` ya contienen la base del marketplace. Las notas de `docs/security` y algunas rutas de autenticación heredadas siguen describiendo la antigua suscripción y se adaptarán en los puntos siguientes.

## Desarrollo local

Requisitos: Node.js 22 y npm 10 o superior.

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000/app`; para crear una cuenta de vendedor, abrir `/registro`. La conexión y los secretos locales están en `.env.local` (ignorado por Git). Los enlaces de verificación y recuperación aparecen en `/dev/correos` durante el desarrollo. En PowerShell con ejecución de scripts restringida se puede usar `npm.cmd` en lugar de `npm`.

## Verificación

```bash
npm run lint
npm run test
npm run build
```
