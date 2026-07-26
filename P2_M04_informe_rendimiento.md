# P2 M04 · Informe reproducible de rendimiento del visor

## Alcance

Escenario frontend para comprobar que el visor no acumula páginas, tiles, listeners o timers durante una lectura prolongada. No mide todavía infraestructura, red privada ni generación real de tiles.

## Configuración de referencia

- Perfil: móvil de gama media, viewport aproximado de 390 × 844 px.
- Documento: `anatomia-general`.
- Recorrido: abrir página 1, avanzar 30 páginas, alternar zoom cinco veces, cambiar entre página completa y tiles y volver 15 páginas.
- Duración objetivo: 10 minutos.

## Umbrales iniciales

| Señal | Página completa | Tiles simulados |
| --- | ---: | ---: |
| Ventana de páginas | 3 | 3 |
| Recursos activos máximos | 3 | 12 |
| Heartbeat activo | 1 | 1 |
| Crecimiento continuo de recursos | No permitido | No permitido |
| Tiempo orientativo de cambio de página | menor a 1.000 ms | menor a 1.500 ms |

## Instrumentación incorporada

- La barra del visor muestra el límite de recursos del modo activo.
- La barra registra el último tiempo de cambio de página en milisegundos.
- El modo tiles reutiliza la misma navegación, zoom, telemetría y estados.
- La precarga conserva únicamente página anterior y siguiente.
- Heartbeat, listeners y temporizadores cuentan con limpieza al desmontarse.
- Las métricas no incluyen imágenes, texto educativo, correo, credenciales ni tokens.

## Verificación automatizada

- `resolveViewerSource` impide activar tiles en documentos sin feature flag.
- `activeResourceLimit` fija 3 recursos para página completa y 12 para tiles.
- Lint y TypeScript detectan efectos o contratos incorrectos.
- El build valida ambos modos dentro del mismo componente.

## Verificación manual

1. Abrir `/app/material/anatomia-general/visor?source=tiles`.
2. Confirmar el indicador “Tiles activos” y “12 recursos máx.”.
3. Avanzar y retroceder con botones y flechas del teclado.
4. Alternar a página completa y confirmar “3 recursos máx.”.
5. Repetir el recorrido en viewport móvil.
6. Registrar cualquier cambio de página que supere el umbral.

## Resultado esperado

El número de recursos permanece acotado por modo, solo existe un heartbeat activo y el cambio de fuente no altera la página actual ni las funciones accesibles del visor.
