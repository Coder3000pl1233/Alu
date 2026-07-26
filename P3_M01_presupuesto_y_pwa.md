# P3 M01 · Presupuesto de rutas y política PWA

## Presupuesto inicial de JavaScript

| Ruta | Límite inicial |
| --- | ---: |
| `/app` | 120 KB |
| `/admin` | 160 KB |
| `/app/material/[id]/visor` | 160 KB |

El comando `npm run budget` analiza los chunks iniciales referenciados por cada ruta después del build y falla si una ruta supera su límite.

Los paneles de métricas y seguridad administrativa se cargan dinámicamente porque no son necesarios para mostrar la parte superior del panel.

## Política PWA

La PWA permite instalar el shell de Aula Segura, pero no habilita lectura offline.

### Recursos permitidos en cache

- Pantalla offline.
- Login visual.
- Iconos de instalación.
- Chunks estáticos del shell.

### Recursos siempre excluidos

- `/app/material/*`
- `/app/material/*/visor`
- `/demo-content/*`
- Imágenes de páginas y tiles.

Las navegaciones protegidas utilizan red y, si no existe conexión, muestran una pantalla segura sin contenido educativo.

## Verificación

1. Ejecutar `npm run build`.
2. Ejecutar `npm run budget`.
3. Servir la compilación en modo producción.
4. Confirmar que `/manifest.webmanifest` y `/sw.js` responden correctamente.
5. Instalar la aplicación desde un navegador compatible.
6. Activar modo offline y confirmar que un material no puede abrirse.
