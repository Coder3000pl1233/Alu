# P3 M00 · Protocolo de legibilidad y acceso equivalente

## Objetivo

Evaluar si el watermark continúa siendo trazable sin interferir innecesariamente con una lectura prolongada y validar la navegación propuesta para una alternativa accesible.

## Escenarios

- Desktop: 1366 × 768 y zoom de navegador al 100 %, 125 % y 200 %.
- Móvil: 390 × 844 y 412 × 915.
- Duración: recorridos de 5, 30 y 60 minutos.
- Fuente: página completa y tiles simulados.
- Perfiles: teclado, lector de pantalla, baja visión, contraste reducido y touch.

## Variantes de watermark

| Preset | Opacidad visual | Uso propuesto |
| --- | ---: | --- |
| Suave | 7 % | Evaluación comparativa; no recomendado como valor general. |
| Equilibrado | 12 % | Recomendado para lectura prolongada y contraste reducido. |
| Intenso | 20 % | Sesiones breves o documentos que requieran mayor disuasión visual. |

## Configuración inicial recomendada

- Preset equilibrado.
- Patrón diagonal repetido.
- Texto abreviado de cuenta, documento y sesión.
- La marca debe permanecer horneada en las imágenes reales.
- El laboratorio usa una capa visual únicamente para comparar presets.

## Evaluación accesible

1. Recorrer índice, encabezados, estado y controles usando solo teclado.
2. Confirmar que el foco sea visible y siga un orden lógico.
3. Cambiar de página y comprobar el anuncio de página y título.
4. Aumentar zoom hasta 200 % sin pérdida de controles.
5. Simular alternativa no disponible y verificar que exista un siguiente paso.
6. Confirmar que ningún control ofrezca descargar o utilizar contenido offline.

## Criterios de aprobación

- El watermark no tapa líneas completas ni elementos de navegación.
- El texto principal mantiene contraste y legibilidad.
- La alternativa utiliza encabezados, regiones y estado anunciado.
- El usuario puede volver al visor sin perder contexto.
- Los mismos permisos y sesión simulada se aplican a ambas presentaciones.

## Límite de esta etapa

El documento establece una propuesta frontend reproducible. La validación con estudiantes reales y la generación autorizada de contenido semántico requieren coordinación posterior y no se simulan como resultados obtenidos.
