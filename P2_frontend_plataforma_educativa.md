# P2 · Optimización y personalización del frontend

Plataforma educativa por suscripción con visor protegido.

> Este documento continúa el P0 y el P1 frontend ya cerrados. P2 mantiene el mismo criterio: únicamente tareas de interfaz, datos simulados, pruebas en navegador y adaptadores reemplazables. No incluye backend, autenticación real, almacenamiento privado ni controles de seguridad server-side.

**Estado:** Completado  
**Progreso actual:** 4 de 4 tareas completadas.

## Objetivo de P2

Mejorar la organización personal del estudiante, preparar el visor para documentos de alta resolución, medir su comportamiento en dispositivos móviles y mostrar métricas administrativas útiles para estimar consumo y detectar anomalías.

## Punto de partida

P0 y P1 ya entregan:

- Biblioteca organizada por Anatomía, Biología e Histología.
- Búsqueda, filtros y carga incremental.
- Ficha de material y visor de imágenes por página.
- Continuidad de lectura mediante un adaptador local.
- Sesión de lectura, heartbeat y telemetría simulada.
- Fricciones secundarias de impresión, guardado y arrastre.
- Administración visual de estudiantes, documentos, sesiones, dispositivos y eventos.
- Pruebas automatizadas, lint, TypeScript y build funcionales.

## Alcance de P2 frontend

### Incluido

- Favoritos y organización personal con persistencia local reemplazable.
- Adaptador visual de tiles activable por documento.
- Instrumentación y pruebas de rendimiento del visor en móvil.
- Métricas administrativas simuladas de procesamiento y consumo.

### No incluido

- Generación real de tiles en el servidor.
- Contratos y pruebas contra una API real.
- Base de datos o persistencia server-side.
- Score de riesgo real o análisis cruzado entre cuentas.
- Reprocesamiento real de documentos.
- SLO, resiliencia de infraestructura o despliegue gradual.

## Reglas de ejecución

- Mantener adaptadores locales que puedan sustituirse por una API.
- No almacenar imágenes, texto educativo, credenciales ni tokens en telemetría.
- Los tiles serán una simulación de interfaz hasta que exista el pipeline de backend.
- Las métricas deben identificarse claramente como datos simulados.
- Cada tarea debe funcionar en desktop y móvil.
- Cada tarea terminada se marcará en este documento.
- Lint, pruebas y build deben pasar antes de cerrar P2.

## Orden de trabajo recomendado

1. [x] **M03-06 · Favoritos y organización personal.**
2. [x] **M04-10 · Adaptador visual de tiles mediante feature flag.**
3. [x] **M04-11 · Pruebas de memoria y rendimiento móvil.**
4. [x] **M05-09 · Métricas de procesamiento y consumo.**

## Backlog P2 por módulo

### M03 · Catálogo y experiencia del estudiante

**Objetivo:** permitir que cada estudiante organice su biblioteca sin modificar las reglas de acceso.

| Estado | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| ✅ | M03-06 | Implementar favoritos y organización personal. | Se pueden marcar y desmarcar materiales, consultar una vista de favoritos y conservar el estado mediante un adaptador local. |

#### Subtareas

- [x] Crear adaptador local de favoritos reemplazable por API.
- [x] Agregar acción accesible para marcar o desmarcar un material.
- [x] Incorporar filtro o sección “Mis favoritos”.
- [x] Diseñar el estado vacío de favoritos.
- [x] Probar persistencia, filtros y navegación por teclado.

### M04 · Visor protegido - optimización

**Objetivo:** preparar la interfaz del visor para contenido de alta resolución y medir su estabilidad en sesiones prolongadas.

| Estado | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| ✅ | M04-10 | Crear un adaptador de tiles compatible con la interfaz actual del visor. | El modo página completa o tiles puede elegirse por documento mediante un feature flag simulado sin cambiar la navegación. |
| ✅ | M04-11 | Ejecutar pruebas de memoria y rendimiento en móviles de gama media. | Existe un escenario reproducible y documentado que detecta crecimiento continuo, exceso de recursos y navegación lenta. |

#### Subtareas de M04-10

- [x] Definir una interfaz común para fuentes de página completa y tiles.
- [x] Agregar un feature flag por documento.
- [x] Crear una demo visual de tiles sin generación server-side.
- [x] Conservar watermark, zoom, teclado, touch y estados de error.
- [x] Mantener una cantidad limitada de fragmentos activos.

#### Subtareas de M04-11

- [x] Definir un recorrido móvil prolongado y reproducible.
- [x] Medir tiempos de cambio de página y recursos activos.
- [x] Detectar listeners, imágenes o timers que no se liberen.
- [x] Establecer umbrales iniciales y registrar resultados.
- [x] Verificar que la telemetría de rendimiento no contenga datos sensibles.

### M05 · Panel administrativo - métricas

**Objetivo:** mostrar información operativa que ayude a estimar costos y detectar consumo anormal.

| Estado | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| ✅ | M05-09 | Crear una vista de métricas de procesamiento y consumo. | El panel muestra tendencias, estados, volumen y alertas simuladas con filtros comprensibles. |

#### Subtareas

- [x] Mostrar documentos procesados, fallidos y pendientes.
- [x] Mostrar páginas servidas, sesiones de lectura y consumo estimado.
- [x] Agregar filtros por período y materia.
- [x] Representar tendencias sin atribuir precisión real a los mocks.
- [x] Incorporar estados de carga, vacío y error.
- [x] Preparar lectura móvil y accesibilidad de tablas o gráficos.

## Gates de aceptación

### Gate A · Organización personal

- [x] Un material puede marcarse y desmarcarse como favorito.
- [x] La vista de favoritos se mantiene al recargar la demo.
- [x] Favoritos no modifica permisos ni estados de acceso.

### Gate B · Visor optimizado

- [x] El mismo visor admite fuente completa o tiles mediante configuración.
- [x] La navegación y los estados existentes funcionan en ambos modos.
- [x] La demo limita los recursos activos durante una sesión prolongada.
- [x] Existe un informe reproducible de rendimiento móvil.

### Gate C · Métricas administrativas

- [x] Las métricas diferencian procesamiento, lectura y alertas.
- [x] Los filtros por período y materia actualizan la vista.
- [x] Los datos están identificados como simulados.
- [x] Los estados de carga, vacío y error están representados.

### Gate D · Calidad y cierre

- [x] Las funciones nuevas tienen pruebas automatizadas.
- [x] Los recorridos principales cuentan con implementación responsive y escenario de verificación documentado.
- [x] Lint, TypeScript, pruebas y build finalizan sin errores.
- [x] El documento refleja el estado final de las 4 tareas.

## Tareas del P2 general trasladadas a otras etapas

Estas tareas aparecen como P2 en el plan general, pero no pertenecen al frontend y tendrán documentos separados:

- **M06-07:** contract tests entre frontend y backend.
- **M07-09:** políticas reales por plan o colección.
- **M08-09:** autoservicio seguro de dispositivos con reautenticación.
- **M09-09:** generación real de pirámide de tiles.
- **M09-10:** reprocesamiento versionado de documentos.
- **M10-10:** entrega real por tiles y resolución adaptativa por riesgo.
- **M11-08:** score de riesgo configurable y análisis cruzado.
- **M11-09:** pruebas de seguridad recurrentes y gestión de vulnerabilidades.
- **M12-10:** SLO, resiliencia y despliegue gradual.

## Criterio de cierre de P2

P2 se considerará terminado cuando las 4 tareas estén marcadas, los cuatro gates estén satisfechos y las mejoras funcionen sobre datos simulados sin introducir dependencias de backend.

**Cierre:** P2 frontend cerrado con 4 de 4 tareas completadas. La inspección visual en dispositivos físicos queda como control periódico de QA y no bloquea esta etapa.
