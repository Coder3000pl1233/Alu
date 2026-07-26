# P1 · Plan de evolución del frontend

Plataforma educativa por suscripción con visor protegido.

> Este documento continúa el P0 frontend cerrado. Contiene únicamente trabajo de frontend con datos simulados y adaptadores locales. La autenticación real, sesiones server-side, base de datos, procesamiento privado y controles de backend se definirán en un backlog separado.

**Estado:** Completado  
**Progreso actual:** 12 de 12 tareas completadas.

## Objetivo de P1

Completar la experiencia operativa del frontend, mejorar la continuidad de lectura, preparar adaptadores para telemetría y representar visualmente sesiones, dispositivos y eventos sospechosos sin implementar todavía su lógica real.

## Punto de partida

El P0 frontend ya entrega:

- Biblioteca organizada por materias.
- Búsqueda y filtros de materiales.
- Ficha individual de cada material.
- Visor de 60 páginas rasterizadas.
- Navegación, zoom, ajuste al ancho y pantalla completa.
- Watermark incorporado en los píxeles de la demo.
- Estados generales y estados del visor.
- Panel administrativo con estudiantes, acceso mensual y documentos.
- Sistema de diseño documentado.

## Reglas de ejecución

- Mantener datos simulados y adaptadores reemplazables.
- No implementar autenticación, cookies, sesiones reales ni persistencia.
- No convertir las fricciones del navegador en garantías de antipiratería.
- No registrar datos sensibles ni contenido de las páginas en la telemetría simulada.
- Cada tarea debe funcionar en desktop y móvil.
- Cada tarea completada se marcará en este documento.

## Fases

| Fase | Foco | Módulos | Resultado |
| --- | --- | --- | --- |
| P1-F1 | Políticas y navegación | M00, M01 | Mensajes de seguridad, política visible y guards simulados |
| P1-F2 | Catálogo y continuidad | M03 | Carga incremental y reanudación de lectura |
| P1-F3 | Visor operativo | M04 | Heartbeat, fricciones secundarias y telemetría simulada |
| P1-F4 | Administración avanzada | M05 | Sesiones, dispositivos y eventos sospechosos |
| P1-F5 | Cierre | Todos | Recorridos verificados y documentación actualizada |

## Cola de trabajo recomendada

1. [x] **M00-05 · Textos de seguridad y privacidad.**
2. [x] **M00-06 · Política visible de dispositivos y sesión activa.**
3. [x] **M03-05 · Continuar lectura:** guardar y recuperar documento/página en un adaptador local.
4. [x] **M03-04 · Carga incremental:** evitar renderizar todo el catálogo de una vez.
5. [x] **M04-07 · Heartbeat visual:** iniciar, pausar y cerrar una sesión de lectura simulada.
6. [x] **M04-09 · Telemetría segura:** registrar eventos permitidos sin contenido ni secretos.
7. [x] **M04-08 · Fricciones secundarias:** impresión, drag y atajos como disuasión.
8. [x] **M05-06 · Sesiones:** detalle y revocación simulada.
9. [x] **M05-07 · Dispositivos:** detalle, estados y revocación simulada.
10. [x] **M05-08 · Eventos:** filtros e investigación administrativa.
11. [x] **M01-05 · Guards de rutas simulados.**
12. [x] **M01-06 · Pruebas unitarias y de componentes críticos.**

## Backlog P1 por módulo

### M00 · Definición funcional y UX

**Objetivo:** explicar correctamente los límites de protección y las políticas visibles del producto.

| Estado | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| ✅ | M00-05 | Definir textos de seguridad y privacidad sin prometer protección absoluta. | Los textos explican los límites del navegador y el uso de marcas de agua. |
| ✅ | M00-06 | Representar la política inicial de dos dispositivos registrados y una sesión activa. | La regla es visible, comprensible y configurable desde los mocks. |

### M01 · Fundación del frontend

**Objetivo:** preparar navegación condicionada y una base de pruebas estable.

| Estado | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| ✅ | M01-05 | Agregar manejo de sesión visual y guards de rutas simulados. | Las rutas representan correctamente sesión disponible, ausente o revocada sin autenticación real. |
| ✅ | M01-06 | Configurar pruebas unitarias y de componentes críticos. | Los filtros, estados, visor y operaciones administrativas críticas tienen pruebas automatizadas. |

### M03 · Catálogo y experiencia del estudiante

**Objetivo:** mejorar rendimiento percibido y continuidad entre sesiones de estudio.

| Estado | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| ✅ | M03-04 | Implementar paginación o carga incremental del catálogo. | La interfaz agrega materiales por bloques y no renderiza todo el catálogo inicialmente. |
| ✅ | M03-05 | Implementar actividad reciente y continuar lectura. | El frontend retoma el documento y la página guardados mediante un adaptador local. |

### M04 · Visor protegido - interfaz

**Objetivo:** representar el ciclo operativo del visor y generar telemetría segura para la futura integración.

| Estado | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| ✅ | M04-07 | Implementar heartbeat y cierre explícito de viewer session simulada. | El visor reporta actividad con una frecuencia limitada, pausa en segundo plano y permite cerrar la sesión. |
| ✅ | M04-08 | Agregar fricciones secundarias de impresión, guardado y drag sin romper accesibilidad. | Las medidas se documentan como disuasión y la navegación por teclado continúa funcionando. |
| ✅ | M04-09 | Implementar telemetría de páginas y errores sin datos sensibles. | Los eventos no incluyen imágenes, texto del material, credenciales ni tokens. |

### M05 · Panel administrativo - interfaz

**Objetivo:** representar las herramientas necesarias para investigar y revocar accesos.

| Estado | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| ✅ | M05-06 | Crear detalle de sesiones y revocación individual o total simulada. | Se muestra el efecto esperado y se solicita confirmación antes de revocar. |
| ✅ | M05-07 | Crear detalle de dispositivos y revocación simulada. | La interfaz distingue dispositivo activo, pendiente y revocado. |
| ✅ | M05-08 | Crear consulta de accesos recientes y eventos sospechosos. | Permite filtrar por usuario, fecha, documento y severidad, y registrar una resolución simulada. |

## Tareas trasladadas a la etapa de backend

No forman parte de las 12 tareas del P1 frontend:

- [ ] **M02-01 · Login:** validaciones, errores genéricos y estado de espera.
- [ ] **M02-02 · Cambio obligatorio de contraseña inicial.**
- [ ] **M02-03 · Acceso vencido, suspendido o revocado desde autenticación.**
- [ ] **M02-04 · Verificación de dispositivo nuevo.**
- [ ] **M02-05 · Cierre de la sesión anterior durante el ingreso.**
- [ ] **M02-06 · Recuperación de contraseña no enumerativa.**

> Estas pantallas se implementarán cuando existan contratos reales para autenticación, recuperación, sesiones y dispositivos.

## Gates de aceptación

### Gate A · Continuidad del estudiante

- [x] El catálogo usa carga incremental.
- [x] “Continuar estudiando” abre el documento y la página correctos.
- [x] El estado reciente puede reemplazarse luego por datos de API sin cambiar las pantallas.

### Gate B · Visor operativo

- [x] Heartbeat y cierre de sesión se pueden inspeccionar en la demo.
- [x] La telemetría no contiene información sensible ni contenido educativo.
- [x] Impresión, drag y atajos están tratados como fricción secundaria.
- [x] Teclado, touch, zoom y navegación siguen funcionando.

### Gate C · Administración avanzada

- [x] El administrador consulta y revoca sesiones simuladas.
- [x] El administrador consulta y revoca dispositivos simulados.
- [x] Los eventos se filtran y pueden marcarse como investigados o resueltos.
- [x] Toda acción destructiva solicita confirmación.

### Gate D · Calidad

- [x] Las funciones críticas tienen pruebas automatizadas.
- [x] Lint, TypeScript y build finalizan sin errores.
- [ ] Los recorridos principales fueron verificados en desktop y móvil.

## Fuera de alcance

- Login y autenticación real.
- Base de datos.
- Cookies y sesiones server-side.
- Procesamiento privado de PDF.
- Tokens firmados de página.
- Rate limiting.
- Motor real de detección de abuso.
- Auditoría persistente.
- Infraestructura y despliegue productivo.
- Tiles, marca forense invisible y DRM comercial.

Estas capacidades tendrán documentos separados de backend, infraestructura o etapas posteriores.
