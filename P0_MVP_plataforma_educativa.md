# P0 · Plan de programación del frontend

Plataforma educativa por suscripción con visor protegido.

> Este documento contiene únicamente el alcance P0 del frontend. Todo funciona con datos simulados y adaptadores locales. La API, base de datos, autenticación real, procesamiento privado y controles de backend se planificarán en un documento separado.

**Estado:** ✅ Cerrado  
**Resultado:** 22 de 22 tareas del alcance frontend completadas.  
**Fecha de cierre:** 25 de julio de 2026.

## Objetivo de P0

Entregar una webapp responsive y navegable que permita validar la experiencia completa del estudiante, el visor por imágenes y la operación administrativa antes de conectar lógica real.

## Reglas de ejecución

- Trabajar exclusivamente con datos simulados y adaptadores reemplazables.
- No implementar todavía autenticación, base de datos, sesiones ni reglas reales de acceso.
- No usar PDF.js ni cargar el PDF original en el visor.
- Para la demo, usar páginas rasterizadas con watermark incorporado en sus píxeles.
- Cada pantalla debe contemplar carga, contenido, vacío y error cuando corresponda.
- Cada tarea se considera terminada solo cuando cumple su criterio, compila y funciona en desktop y móvil.

## Fases y gates

| Fase | Foco | Módulos | Resultado | Gate para avanzar |
| --- | --- | --- | --- | --- |
| P0-F1 | Definición y base visual | M00, M01 | Flujos, estados, diseño y aplicación navegable con mocks. | Frontend base aprobado |
| P0-F2 | Experiencia estudiante | M03, M04 | Catálogo, materiales y visor protegido simulado. | Demo estudiante aprobada |
| P0-F3 | Operación administrativa | M05 | Usuarios, acceso mensual y carga simulada. | Demo administrador aprobada |

## Checklist de inicio

- [x] Confirmar stack de frontend.
- [x] Crear el proyecto frontend.
- [x] Definir comportamiento responsive y viewport móvil.
- [x] Mantener seguimiento mediante los IDs de este documento.
- [x] Mantener backend y lógica real fuera de este backlog.

## Backlog P0 por módulo

**Progreso final:** 22 de 22 tareas frontend completadas.

## Próximas tareas activas

Estas son las tareas que debemos completar ahora, en este orden:

1. [x] **M04-05 · Estados del visor:** carga, error de imagen, sesión vencida, acceso revocado y reproceso.
2. [x] **M00-03 · Estados generales:** carga, vacío, error, sin permiso, suspendido, vencido y revocado.
3. [x] **M00-01 · Recorrido del estudiante:** verificar que materias, materiales, ficha, visor y estados estén conectados.
4. [x] **M00-02 · Recorrido administrativo:** verificar estudiantes, acceso mensual, documentos y eventos simulados.
5. [x] **M01-02 · Sistema de diseño:** normalizar y documentar botones, inputs, tablas, modales, alertas, badges y skeletons.

Las cinco tareas activas están terminadas. El frontend P0 queda formalmente cerrado.

## Tareas trasladadas a la etapa de backend

Estas tareas fueron retiradas del alcance y no se cuentan dentro de las 22 tareas del P0 frontend:

- [ ] **M02-01 · Login:** validaciones, errores genéricos y estado de espera.
- [ ] **M02-02 · Cambio obligatorio de contraseña inicial.**
- [ ] **M02-03 · Acceso vencido, suspendido o revocado desde autenticación.**

> M02 se retomará junto con la autenticación, las sesiones y las respuestas reales del backend. Las pantallas podrán implementarse entonces sobre contratos y estados definitivos.

### M00 · Definición funcional y UX

**Capa:** Frontend primero

**Objetivo:** Cerrar el recorrido del producto y las reglas visibles antes de implementar lógica.

| Estado | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| ✅ | M00-01 | Recorrido del estudiante sin autenticación: materias, materiales, ficha, visor, regreso y estados simulados. | El recorrido fue verificado de principio a fin sin pantallas sin salida. |
| ✅ | M00-02 | Recorrido administrativo frontend: estudiantes, acceso mensual, documentos y eventos simulados. | El recorrido fue verificado de principio a fin; sesiones y dispositivos quedan fuera de este alcance. |
| ✅ | M00-03 | Definir estados de interfaz: carga, vacío, error, sin permiso, suspendido, vencido y revocado. | Cada pantalla tiene un estado y mensaje accionable. |
| ✅ | M00-04 | Definir diseño visual base, componentes, breakpoints y tokens de accesibilidad. | Existe una guía mínima reutilizable por todo el frontend. |

### M01 · Fundación del frontend

**Capa:** Frontend primero

**Objetivo:** Crear una aplicación navegable, responsive y desacoplada de la API.

| Estado | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| ✅ | M01-01 | Inicializar aplicación web, TypeScript, rutas, layouts y manejo central de errores. | Build reproducible y rutas base funcionando. |
| ✅ | M01-02 | Implementar sistema de diseño: botones, inputs, tablas, modales, alertas, badges y skeletons. | Componentes documentados y usados por las pantallas. |
| ✅ | M01-03 | Crear repositorio de datos simulados y adaptadores reemplazables por API. | Todas las pantallas funcionan sin backend real. |
| ✅ | M01-04 | Implementar navegación responsive para estudiante y administrador. | Funciona en desktop y viewport móvil objetivo. |

### M03 · Catálogo y experiencia del estudiante

**Capa:** Frontend primero

**Objetivo:** Permitir encontrar y abrir material con una experiencia clara y rápida.

| Estado | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| ✅ | M03-01 | Pantalla de inicio y catálogo con tarjetas/listado de documentos. | Muestra título, categoría, estado y acción disponible. |
| ✅ | M03-02 | Búsqueda, filtros y estados vacíos con datos simulados. | Los filtros funcionan sin recargar la aplicación. |
| ✅ | M03-03 | Ficha del material y acción Abrir visor. | Solo ofrece acciones permitidas por el estado simulado. |

### M04 · Visor protegido - interfaz

**Capa:** Frontend primero

**Objetivo:** Construir el componente crítico sin recibir un PDF ni depender inicialmente del backend.

| Estado | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| ✅ | M04-01 | Visor propio de imágenes por página, sin PDF.js ni text layer. | El bundle no carga PDF completo ni librería de render PDF. |
| ✅ | M04-02 | Navegación anterior/siguiente, salto a página y contador. | Funciona por teclado, mouse y touch. |
| ✅ | M04-03 | Lazy loading de página actual y vecinas con descarte de lejanas. | Mantiene una ventana pequeña de recursos en memoria. |
| ✅ | M04-04 | Zoom controlado, ajuste a ancho y rotación visual si se requiere. | No solicita resolución alta hasta necesitarla. |
| ✅ | M04-05 | Estados: token vencido, acceso revocado, error de red y reproceso. | Renueva o cierra de forma segura según el caso. |
| ✅ | M04-06 | Representar watermark como parte de la imagen simulada, no overlay removible. | Eliminar DOM auxiliar no elimina la marca mostrada. |

### M05 · Panel administrativo - interfaz

**Capa:** Frontend primero

**Objetivo:** Validar la operación manual del negocio antes de conectar datos reales.

| Estado | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| ✅ | M05-01 | Listado y búsqueda de usuarios con estado y vencimiento. | Permite localizar rápidamente una cuenta. |
| ✅ | M05-02 | Formulario de alta con contraseña temporal generada/mostrada una sola vez. | La interfaz advierte que no podrá recuperarse. |
| ✅ | M05-03 | Acción para fijar o extender access_until. | Muestra fecha anterior, nueva y confirmación. |
| ✅ | M05-04 | Suspender/reactivar cuenta con motivo obligatorio. | Las acciones críticas requieren confirmación. |
| ✅ | M05-05 | Listado de documentos y formulario de carga con progreso. | Cubre validación, cuarentena, proceso, error y listo. |

## Gates de aceptación

### Gate A · Frontend estudiante

- [x] Catálogo, búsqueda, ficha y apertura del visor funcionan en desktop y móvil.
- [x] El visor simula carga diferida, expiración, revocación y watermark horneado.

### Gate B · Frontend administrador

- [x] Puede simularse alta, extensión de acceso, suspensión y carga de documentos.
- [x] Todas las acciones críticas tienen confirmación y estados de error.

### Gate C · Visor frontend

- [x] El visor navega las páginas rasterizadas sin recibir el PDF original.
- [x] Zoom, ajuste al ancho y navegación funcionan con mouse, teclado y touch.
- [x] Los estados simulados de carga, error, vencimiento y revocación son verificables.
- [x] La marca visible permanece al eliminar elementos auxiliares del DOM.

## Orden sugerido para comenzar

1. Ejecutar M00-01 a M00-04.
2. Implementar M01-01 a M01-04.
3. Completar M03 y M04 usando exclusivamente mocks.
4. Completar M05 y validar Gate B.
5. Cerrar M04-05 y los estados pendientes de M00.
6. Completar M01-02 con los componentes que ya utiliza la aplicación.
7. Trasladar M02 al backlog que acompañará la implementación del backend.
8. Cerrar formalmente el P0 frontend.

## Fuera de alcance durante P0

- Tiles globales.
- Marca forense invisible.
- DRM comercial.
- Aplicaciones nativas.
- PWA con contenido offline.
- Recomendaciones personalizadas.
- API y contratos OpenAPI.
- Base de datos y migraciones.
- Login y sesiones reales.
- Procesamiento privado de documentos.
- Tokens de página y autorización.
- Rate limits, auditoría y detección backend.
- Infraestructura, backups y despliegue productivo.

Estas capacidades se definirán en un backlog de backend separado y no cuentan en el progreso del frontend.
