# Aula Segura

Frontend de una plataforma educativa por suscripción con biblioteca por materias, visor de páginas rasterizadas y panel administrativo.

## Estado

- P0 frontend: completado.
- P1 frontend: completado.
- P2 frontend: completado.
- P3 frontend: en desarrollo.
- Backend y autenticación real: fuera del alcance actual.

Los usuarios, sesiones, accesos y métricas actuales son datos simulados.

## Desarrollo local

Requisitos:

- Node.js 22.
- npm 10 o superior.

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Verificación

```bash
npm run lint
npm run test
npm run build
npm run budget
```

## Despliegue en Netlify desde GitHub

1. Subir este repositorio a GitHub.
2. En Netlify, seleccionar **Add new project → Import an existing project**.
3. Conectar GitHub y elegir el repositorio `DanielWallsCode/Alu`.
4. Netlify leerá automáticamente `netlify.toml`.
5. Confirmar:

   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node.js: `22`

6. Seleccionar **Deploy**.

No se necesitan variables de entorno para la demo frontend actual.

## Política offline

La PWA solo almacena el shell público. El service worker excluye deliberadamente:

- `/app/material/*`
- `/demo-content/*`
- Visor, páginas e imágenes educativas.

Los materiales protegidos no quedan disponibles sin conexión.

## Aviso de seguridad

Las protecciones del navegador son medidas de fricción y demostración. Autenticación, autorización, sesiones, watermark real, procesamiento privado y auditoría deben implementarse en backend antes de un uso productivo.
