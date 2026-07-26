# P3 · Evolución avanzada del frontend

Plataforma educativa por suscripción con visor protegido.

> Este documento continúa P0, P1 y P2 frontend ya cerrados. P3 reúne capacidades avanzadas que no bloquean el MVP: accesibilidad equivalente, instalación PWA segura, recomendaciones transparentes y configuración administrativa avanzada. Se mantiene el uso de datos simulados y adaptadores reemplazables.

**Estado:** Pendiente  
**Progreso actual:** 4 de 7 tareas completadas.

## Objetivo de P3

Convertir la demo frontend en una experiencia más accesible, instalable, personalizable y configurable, sin implementar todavía autenticación real, procesamiento server-side, pagos, DRM ni infraestructura avanzada.

## Punto de partida

P0, P1 y P2 ya entregan:

- Biblioteca por materias con búsqueda, filtros, favoritos y continuidad de lectura.
- Visor protegido de página completa y modo tiles simulado.
- Telemetría local segura, heartbeat y límites visibles de recursos.
- Panel administrativo de estudiantes, documentos, sesiones, dispositivos, eventos y métricas.
- Estados responsive, pruebas automatizadas y adaptadores locales.

## Nota sobre tareas trasladadas

El plan general contiene dos tareas P2 frontend que no fueron incluidas en el alcance cerrado de P2. Para evitar perderlas, se incorporan al inicio de P3:

- **M00-07:** validación de watermark, contraste y legibilidad.
- **M01-07:** optimización por rutas y presupuesto de bundle.

El cierre de P2 no se modifica; estas tareas pasan formalmente al alcance de evolución P3.

## Alcance de P3 frontend

### Incluido

- Evaluación visual del watermark y la lectura prolongada.
- Presupuesto y optimización del bundle por rutas.
- Diseño e implementación de una alternativa accesible para materiales rasterizados.
- Preparación de una PWA sin acceso offline a materiales protegidos.
- Recomendaciones y colecciones con consentimiento y minimización.
- Gestión visual versionada de reglas y umbrales administrativos.

### No incluido

- Login, passkeys o TOTP reales.
- Sincronización de recomendaciones con una API.
- Acceso offline a páginas de materiales.
- Generación server-side de contenido accesible.
- Cambios reales de políticas o umbrales en backend.
- Pagos, SIEM/SOC, DRM, marca forense invisible o infraestructura multirregión.

## Reglas de ejecución

- No cachear imágenes ni materiales protegidos para uso offline.
- Las recomendaciones deben poder desactivarse y explicar por qué aparecen.
- No usar contenido educativo, credenciales o tokens en analítica local.
- La alternativa accesible debe respetar los mismos permisos que el visor.
- Las reglas administrativas seguirán siendo simuladas y versionadas localmente.
- Cada tarea debe funcionar en desktop y móvil.
- Cada tarea terminada se marcará en este documento.
- Lint, pruebas, TypeScript y build deben pasar antes del cierre.

## Orden de trabajo recomendado

1. [x] **M00-07 · Validar watermark, contraste y legibilidad.**
2. [x] **M01-07 · Optimizar carga por rutas y presupuesto de bundle.**
3. [x] **M00-08 · Diseñar alternativa accesible para materiales rasterizados.**
4. [ ] **M04-12 · Implementar modo accesible controlado.**
5. [x] **M01-08 · Preparar modo instalable PWA sin materiales offline.**
6. [ ] **M03-07 · Recomendaciones y colecciones personalizadas.**
7. [ ] **M05-10 · Gestión avanzada de reglas y umbrales.**

## Backlog P3 por módulo

### M00 · Investigación visual y accesibilidad

**Objetivo:** definir una experiencia de lectura prolongada que mantenga seguridad, contraste y acceso equivalente.

| Estado | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| ✅ | M00-07 | Probar watermark, contraste y legibilidad con estudiantes. | Existe una configuración documentada para lectura prolongada y un protocolo reproducible de evaluación. |
| ✅ | M00-08 | Diseñar una alternativa accesible para materiales rasterizados. | Existe una propuesta navegable que conserva permisos y ofrece acceso equivalente sin exponer el PDF. |

#### Subtareas de M00-07

- [x] Definir escenarios de lectura, tamaños de pantalla y duración.
- [x] Comparar intensidad, repetición y contraste del watermark.
- [x] Verificar legibilidad con zoom y modo tiles.
- [x] Documentar hallazgos, límites y configuración recomendada.

#### Subtareas de M00-08

- [x] Definir necesidades de teclado, lector de pantalla y baja visión.
- [x] Diseñar navegación semántica por página y secciones.
- [x] Definir mensajes cuando una alternativa todavía no está disponible.
- [x] Validar que la propuesta no habilite descargas ni acceso offline.

### M01 · Rendimiento e instalación

**Objetivo:** reducir el costo inicial de navegación y preparar una instalación segura de la aplicación.

| Estado | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| ✅ | M01-07 | Optimizar carga por rutas y establecer presupuesto de bundle. | Las rutas críticas cumplen umbrales documentados y los componentes pesados se cargan solo cuando se necesitan. |
| ✅ | M01-08 | Preparar modo instalable PWA sin cachear materiales. | La aplicación puede instalarse y su service worker excluye visor, páginas e imágenes protegidas. |

#### Subtareas de M01-07

- [x] Registrar tamaño inicial de las rutas principales.
- [x] Definir presupuesto por ruta y alertas de regresión.
- [x] Aplicar carga diferida en paneles o herramientas no críticas.
- [x] Documentar comparación antes/después.

#### Subtareas de M01-08

- [x] Crear manifest, iconos y metadatos de instalación.
- [x] Definir estrategia de cache únicamente para shell público.
- [x] Excluir rutas y recursos protegidos del cache offline.
- [x] Mostrar estado offline seguro sin contenido educativo.
- [x] Preparar el escenario de instalación y actualización de la PWA.

### M03 · Recomendaciones y colecciones

**Objetivo:** ayudar a descubrir materiales sin crear perfiles invasivos ni alterar permisos.

| Estado | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| ☐ | M03-07 | Implementar recomendaciones y colecciones personalizadas. | Las sugerencias usan datos mínimos, explican su motivo y pueden desactivarse. |

#### Subtareas

- [ ] Crear adaptador local de preferencias y consentimiento.
- [ ] Mostrar colecciones editoriales por materia.
- [ ] Generar recomendaciones transparentes desde favoritos y lecturas recientes.
- [ ] Incorporar acción “No recomendar” y desactivación completa.
- [ ] Diseñar estados vacío, sin consentimiento y error.
- [ ] Confirmar que una recomendación nunca evita controles de acceso.

### M04 · Modo accesible del visor

**Objetivo:** implementar la propuesta accesible aprobada sobre el visor existente.

| Estado | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| ☐ | M04-12 | Implementar modo accesible controlado o alternativa equivalente. | La navegación por teclado, estructura semántica, foco, zoom y mensajes cumplen la política definida. |

#### Subtareas

- [ ] Incorporar selector de modo accesible mediante feature flag.
- [ ] Agregar índice semántico de páginas y navegación por regiones.
- [ ] Gestionar foco y anuncios al cambiar de página o estado.
- [ ] Mantener watermark, sesión y controles de acceso simulados.
- [ ] Crear pruebas de componentes y recorrido accesible.

### M05 · Reglas y umbrales administrativos

**Objetivo:** validar la experiencia para modificar políticas avanzadas antes de conectarlas al backend.

| Estado | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| ☐ | M05-10 | Crear gestión avanzada de reglas y umbrales desde UI. | Las modificaciones simuladas generan una versión, muestran diferencias y requieren confirmación. |

#### Subtareas

- [ ] Crear listado de reglas, estado, severidad y última versión.
- [ ] Diseñar edición de límites de velocidad, concurrencia y dispositivos.
- [ ] Mostrar comparación antes/después.
- [ ] Solicitar motivo y confirmación antes de publicar una versión.
- [ ] Incorporar historial, restauración simulada y auditoría local.
- [ ] Añadir estados de carga, vacío, error y conflicto de versión.

## Gates de aceptación

### Gate A · Lectura y accesibilidad

- [x] Existe una configuración documentada de watermark y contraste.
- [ ] El modo accesible funciona con teclado y foco visible.
- [ ] Los estados del visor tienen mensajes semánticos.
- [x] La alternativa mantiene los mismos permisos del material.

### Gate B · Rendimiento y PWA

- [x] Existe un presupuesto de bundle por ruta.
- [x] Las funciones no críticas se cargan de forma diferida.
- [x] La aplicación cuenta con manifest y service worker instalables.
- [x] Ningún material protegido queda disponible offline.

### Gate C · Personalización responsable

- [ ] Las recomendaciones requieren una preferencia explícita.
- [ ] Cada recomendación explica su motivo.
- [ ] El estudiante puede desactivar recomendaciones.
- [ ] Las colecciones no alteran controles de acceso.

### Gate D · Administración avanzada

- [ ] Las reglas muestran estado, versión y cambios propuestos.
- [ ] Publicar o restaurar requiere confirmación y motivo.
- [ ] El historial simulado permite comprender quién cambió qué.
- [ ] Conflictos y errores muestran recuperación accionable.

### Gate E · Calidad y cierre

- [ ] Las funciones nuevas tienen pruebas automatizadas.
- [ ] Los recorridos principales están preparados para desktop y móvil.
- [ ] Lint, TypeScript, pruebas y build finalizan sin errores.
- [ ] El documento refleja el estado final de las 7 tareas.

## Tareas P3 del plan general trasladadas a otras etapas

Estas capacidades no pertenecen al frontend actual y tendrán documentos independientes:

- **M02-08:** passkeys o TOTP; se retomará junto con autenticación real.
- **M06-08:** versionado público de API para terceros.
- **M07-10:** integración futura con pagos mediante eventos idempotentes.
- **M08-10:** passkeys/TOTP y políticas de riesgo adaptativas reales.
- **M09-11:** procesamiento elástico o multirregión.
- **M10-11:** marca forense invisible y peritaje.
- **M10-12:** evaluación de DRM comercial.
- **M11-10:** SIEM/SOC y retención reforzada.
- **M12-11:** alta disponibilidad multirregión y recuperación avanzada.

## Criterio de cierre de P3

P3 se considerará terminado cuando las 7 tareas estén marcadas, los gates estén satisfechos y ninguna función frontend dependa de garantías que solo puede ofrecer el backend.
