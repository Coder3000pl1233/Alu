# PLAN DE TAREAS DEL MVP

Plataforma educativa por suscripción con visor protegido

Roadmap por módulos y prioridades P0 - P3

Versión inicial · 25 de julio de 2026

> **Criterio de ejecución:** primero se construye y valida el frontend completo con datos simulados. Una vez aprobados los recorridos, estados y componentes, se congelan los contratos de API y se reemplazan los mocks por lógica real de forma incremental. La seguridad crítica se aplica en backend y no se delega al navegador.

## Estado del documento

Backlog de planificación inicial. Las estimaciones, responsables y fechas se agregan después de aprobar alcance y tecnología. Las decisiones aún abiertas aparecen como tareas y parámetros configurables; no bloquean el diseño base.

## 1. Cómo leer las prioridades

| Prioridad | Interpretación | Tareas |
| --- | --- | --- |
| P0 | Imprescindible para validar, integrar y operar el MVP con seguridad básica. | 63 |
| P1 | Completa el MVP productivo y reduce riesgos operativos o de abuso. | 32 |
| P2 | Endurecimiento, optimización y mejoras basadas en métricas reales. | 16 |
| P3 | Evolución, alto costo o capacidad que no debe bloquear el lanzamiento. | 14 |

### Regla de corte del MVP

El MVP funcional requiere todos los P0. Para un lanzamiento productivo recomendado deben cerrarse también los P1 marcados como seguridad, operación o recuperación. P2 y P3 no deben introducirse antes de medir uso, costo y riesgo residual.

## 2. Orden de construcción

| Fase | Foco | Módulos | Trabajo principal | Salida |
| --- | --- | --- | --- | --- |
| F0 | Alineación y UX | M00 | Decisiones mínimas, flujos, estados y diseño base. | Prototipo aprobado |
| F1 | Frontend estudiante | M01-M04 | Aplicación, autenticación visual, catálogo y visor con mocks. | Demo navegable |
| F2 | Frontend administrador | M05 | Operación manual completa con datos simulados. | Demo operativa |
| F3 | Contrato e integración base | M06-M08 | OpenAPI, identidad, acceso, sesiones y dispositivos. | Login real y autorización |
| F4 | Contenido protegido | M09-M10 | Procesamiento, entrega por página y watermark. | Visor end-to-end |
| F5 | Producción MVP | M11-M12 | Auditoría, reglas, hardening, pruebas y operación. | Go-live controlado |
| F6 | Evolución | P2-P3 | Tiles, forense, accesibilidad avanzada, DRM o nativa. | Según métricas |

### Hitos de aprobación

- H1 · Frontend estudiante aprobado: login, estados de acceso, catálogo y visor pueden recorrerse con mocks.

- H2 · Frontend administrador aprobado: alta, extensión, suspensión, carga y revocación están representadas.

- H3 · Contratos congelados: el frontend y backend comparten modelos, errores y ejemplos.

- H4 · Camino seguro end-to-end: el navegador recibe imágenes marcadas, nunca el PDF.

- H5 · Go-live: pruebas de expiración, revocación, scraping y recuperación aprobadas.

## 3. Backlog por módulo

## M00 · Definición funcional y UX

Capa: Frontend primero

Objetivo: Cerrar el recorrido del producto y las reglas visibles antes de implementar lógica.

| Prioridad | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| P0 | M00-01 | Mapa de navegación del estudiante: ingreso, cambio de clave, catálogo, visor, dispositivo nuevo y acceso vencido. | Prototipo navegable cubre todos los estados principales. |
| P0 | M00-02 | Mapa de navegación del administrador: usuarios, acceso mensual, documentos, sesiones, dispositivos y eventos. | Prototipo permite recorrer todas las operaciones del MVP. |
| P0 | M00-03 | Definir estados de interfaz: carga, vacío, error, sin permiso, suspendido, vencido y revocado. | Cada pantalla tiene un estado y mensaje accionable. |
| P0 | M00-04 | Definir diseño visual base, componentes, breakpoints y tokens de accesibilidad. | Existe una guía mínima reutilizable por todo el frontend. |
| P1 | M00-05 | Definir textos de seguridad y privacidad sin prometer protección absoluta. | Los textos explican límites y uso de marcas de agua. |
| P1 | M00-06 | Resolver política inicial asumida: dos dispositivos registrados y una sesión activa. | La regla queda visible y configurable, sin quedar hardcodeada. |
| P2 | M00-07 | Probar watermark, contraste y legibilidad con estudiantes. | Se documenta una configuración aprobada para uso prolongado. |
| P3 | M00-08 | Diseñar alternativa accesible para materiales rasterizados. | Existe una propuesta validada de acceso equivalente. |

## M01 · Fundación del frontend

Capa: Frontend primero

Objetivo: Crear una aplicación navegable, responsive y desacoplada de la API.

| Prioridad | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| P0 | M01-01 | Inicializar aplicación web, TypeScript, rutas, layouts y manejo central de errores. | Build reproducible y rutas base funcionando. |
| P0 | M01-02 | Implementar sistema de diseño: botones, inputs, tablas, modales, alertas, badges y skeletons. | Componentes documentados y usados por las pantallas. |
| P0 | M01-03 | Crear repositorio de datos simulados y adaptadores reemplazables por API. | Todas las pantallas funcionan sin backend real. |
| P0 | M01-04 | Implementar navegación responsive para estudiante y administrador. | Funciona en desktop y viewport móvil objetivo. |
| P1 | M01-05 | Agregar manejo de sesión visual y guards de rutas simulados. | Rutas muestran correctamente autenticado/no autenticado. |
| P1 | M01-06 | Configurar pruebas unitarias y de componentes críticas. | Pipeline ejecuta pruebas en cada cambio. |
| P2 | M01-07 | Optimizar carga por rutas y presupuesto de bundle. | Se cumplen umbrales de rendimiento acordados. |
| P3 | M01-08 | Preparar modo instalable PWA sin cachear materiales. | La instalación no habilita contenido offline. |

## M02 · Autenticación y onboarding visual

Capa: Frontend primero

Objetivo: Validar la experiencia de ingreso, cambio obligatorio y verificación de dispositivo.

| Prioridad | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| P0 | M02-01 | Pantalla de login con validación, errores genéricos y estados de espera. | No revela si una cuenta existe y evita dobles envíos. |
| P0 | M02-02 | Flujo de cambio obligatorio de contraseña inicial. | No permite continuar al catálogo hasta finalizar. |
| P0 | M02-03 | Pantalla de acceso vencido, suspendido o revocado. | Cada causa muestra el próximo paso correcto. |
| P1 | M02-04 | Flujo de dispositivo nuevo con código de verificación. | Cubre envío, reenvío, expiración y bloqueo temporal. |
| P1 | M02-05 | Diálogo para cerrar la sesión anterior. | El usuario entiende qué sesión será invalidada. |
| P1 | M02-06 | Recuperación de contraseña con respuesta no enumerativa. | La interfaz no confirma la existencia del correo. |
| P2 | M02-07 | Historial de dispositivos y cierre remoto por el estudiante. | Permite reconocer y revocar equipos propios. |
| P3 | M02-08 | Preparar UI para passkeys o TOTP. | La extensión no exige rediseñar onboarding. |

## M03 · Catálogo y experiencia del estudiante

Capa: Frontend primero

Objetivo: Permitir encontrar y abrir material con una experiencia clara y rápida.

| Prioridad | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| P0 | M03-01 | Pantalla de inicio y catálogo con tarjetas/listado de documentos. | Muestra título, categoría, estado y acción disponible. |
| P0 | M03-02 | Búsqueda, filtros y estados vacíos con datos simulados. | Los filtros funcionan sin recargar la aplicación. |
| P0 | M03-03 | Ficha del material y acción Abrir visor. | Solo ofrece acciones permitidas por el estado simulado. |
| P1 | M03-04 | Paginación o carga incremental del catálogo. | No descarga todo el catálogo de una vez. |
| P1 | M03-05 | Vista de actividad reciente y continuar lectura. | Retoma documento y página guardados. |
| P2 | M03-06 | Favoritos y organización personal. | No interfiere con controles de acceso. |
| P3 | M03-07 | Recomendaciones y colecciones personalizadas. | Se basa en datos con consentimiento y minimización. |

## M04 · Visor protegido - interfaz

Capa: Frontend primero

Objetivo: Construir el componente crítico sin recibir un PDF ni depender inicialmente del backend.

| Prioridad | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| P0 | M04-01 | Visor propio de imágenes por página, sin PDF.js ni text layer. | El bundle no carga PDF completo ni librería de render PDF. |
| P0 | M04-02 | Navegación anterior/siguiente, salto a página y contador. | Funciona por teclado, mouse y touch. |
| P0 | M04-03 | Lazy loading de página actual y vecinas con descarte de lejanas. | Mantiene una ventana pequeña de recursos en memoria. |
| P0 | M04-04 | Zoom controlado, ajuste a ancho y rotación visual si se requiere. | No solicita resolución alta hasta necesitarla. |
| P0 | M04-05 | Estados: token vencido, acceso revocado, error de red y reproceso. | Renueva o cierra de forma segura según el caso. |
| P0 | M04-06 | Representar watermark como parte de la imagen simulada, no overlay removible. | Eliminar DOM auxiliar no elimina la marca mostrada. |
| P1 | M04-07 | Heartbeat de lectura y cierre explícito de viewer session. | El frontend reporta actividad sin exceso de requests. |
| P1 | M04-08 | Fricciones secundarias: impresión oculta, drag y atajos, sin romper teclado. | Las medidas están documentadas como disuasión. |
| P1 | M04-09 | Telemetría de páginas solicitadas y errores sin datos sensibles. | Los eventos no incluyen tokens ni contenido. |
| P2 | M04-10 | Adaptador de tiles compatible con la misma interfaz del visor. | Puede activarse por documento mediante feature flag. |
| P2 | M04-11 | Pruebas de memoria y rendimiento en móviles de gama media. | Sesiones prolongadas no muestran crecimiento continuo. |
| P3 | M04-12 | Modo accesible controlado o integración con alternativa equivalente. | Cumple la política de accesibilidad definida. |

## M05 · Panel administrativo - interfaz

Capa: Frontend primero

Objetivo: Validar la operación manual del negocio antes de conectar datos reales.

| Prioridad | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| P0 | M05-01 | Listado y búsqueda de usuarios con estado y vencimiento. | Permite localizar rápidamente una cuenta. |
| P0 | M05-02 | Formulario de alta con contraseña temporal generada/mostrada una sola vez. | La interfaz advierte que no podrá recuperarse. |
| P0 | M05-03 | Acción para fijar o extender access_until. | Muestra fecha anterior, nueva y confirmación. |
| P0 | M05-04 | Suspender/reactivar cuenta con motivo obligatorio. | Las acciones críticas requieren confirmación. |
| P0 | M05-05 | Listado de documentos y formulario de carga con progreso. | Cubre validación, cuarentena, proceso, error y listo. |
| P1 | M05-06 | Detalle de sesiones y revocación individual o total. | Muestra efecto esperado antes de confirmar. |
| P1 | M05-07 | Detalle de dispositivos y revocación. | Distingue activo, pendiente y revocado. |
| P1 | M05-08 | Consulta de accesos recientes y eventos sospechosos. | Permite filtrar por usuario, fecha, documento y severidad. |
| P2 | M05-09 | Vista de métricas de procesamiento y consumo. | Ayuda a estimar costo y detectar abuso. |
| P3 | M05-10 | Gestión avanzada de reglas y umbrales desde UI. | Los cambios quedan versionados y auditados. |

## M06 · Contratos de API e integración

Capa: Puente frontend-lógica

Objetivo: Congelar contratos a partir del frontend aprobado y reemplazar mocks gradualmente.

| Prioridad | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| P0 | M06-01 | Definir OpenAPI para autenticación, catálogo, visor y administración. | Incluye errores, paginación, idempotencia y ejemplos. |
| P0 | M06-02 | Definir esquema común de errores y request_id. | El frontend interpreta todos los errores previstos. |
| P0 | M06-03 | Generar cliente tipado o adaptador validado contra contrato. | Los mocks y la API real comparten interfaces. |
| P0 | M06-04 | Integrar primero login, sesión y estado de acceso. | Los guards dejan de depender de datos simulados. |
| P1 | M06-05 | Integrar catálogo y viewer session. | El visor conserva el comportamiento aprobado. |
| P1 | M06-06 | Integrar operaciones administrativas críticas. | Alta, extensión, suspensión y carga funcionan end-to-end. |
| P2 | M06-07 | Contract tests entre frontend y backend. | Los cambios incompatibles fallan en CI. |
| P3 | M06-08 | Versionado público de API si aparecen terceros. | No se agrega antes de existir esa necesidad. |

## M07 · Identidad, acceso mensual y administración

Capa: Backend y lógica

Objetivo: Implementar las reglas centrales de cuentas y suscripción manual.

| Prioridad | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| P0 | M07-01 | Modelo users con status, access_until, password_hash y must_change_password. | No existe contraseña en claro ni campo temporary_password. |
| P0 | M07-02 | Hash Argon2id y política de contraseña inicial. | Parámetros configurables y verificados por prueba. |
| P0 | M07-03 | Login con mensajes no enumerativos y rate limit. | Los intentos quedan auditados sin secretos. |
| P0 | M07-04 | Middleware central de autorización y validación de access_until en UTC. | Se ejecuta en cada request de contenido. |
| P0 | M07-05 | CRUD administrativo de usuario con RBAC. | Solo administradores autorizados modifican acceso. |
| P0 | M07-06 | Extensión manual de acceso con auditoría before/after. | La operación es transaccional y trazable. |
| P1 | M07-07 | Recuperación de contraseña con token único y corto. | No inicia sesión automáticamente ni reutiliza token. |
| P1 | M07-08 | MFA obligatorio para administradores. | Las rutas administrativas lo exigen. |
| P2 | M07-09 | Políticas configurables por plan o colección. | No duplica reglas en endpoints. |
| P3 | M07-10 | Integración futura con pagos mediante eventos idempotentes. | No altera el modelo de autorización existente. |

## M08 · Sesiones y dispositivos

Capa: Backend y lógica

Objetivo: Reducir cuentas compartidas sin bloquear por cambios normales de red.

| Prioridad | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| P0 | M08-01 | Sesiones opacas server-side con cookie __Host-, HttpOnly, Secure y SameSite. | No se guardan credenciales en localStorage. |
| P0 | M08-02 | Expiración por inactividad y absoluta; rotación al autenticar y cambiar clave. | La sesión anterior no sobrevive a cambios sensibles. |
| P0 | M08-03 | Una sesión interactiva activa por cuenta con cierre de la anterior. | Múltiples pestañas de la misma sesión siguen funcionando. |
| P0 | M08-04 | Registro de dispositivo mediante identificador aleatorio hasheado. | Fingerprint e IP son solo señales auxiliares. |
| P1 | M08-05 | Hasta dos dispositivos registrados, configurable. | El límite no está embebido en código. |
| P1 | M08-06 | Challenge de dispositivo nuevo y límites de reenvío. | El código expira, es de un uso y se almacena hasheado. |
| P1 | M08-07 | Revocación por sesión, dispositivo, usuario y session_version. | La revocación impacta la siguiente request. |
| P1 | M08-08 | Detección de sesiones simultáneas y cambios frecuentes. | Genera score/evento antes de sancionar. |
| P2 | M08-09 | Autoservicio seguro de dispositivos y recuperación. | Los cambios sensibles requieren reautenticación. |
| P3 | M08-10 | Passkeys/TOTP y políticas de riesgo adaptativas. | Se habilitan por feature flag. |

## M09 · Carga y procesamiento de documentos

Capa: Backend y procesamiento

Objetivo: Transformar originales privados en derivados seguros y operables.

| Prioridad | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| P0 | M09-01 | Bucket privado de originales sin ACL pública ni URL permanente. | Pruebas externas no pueden leer ningún original. |
| P0 | M09-02 | Carga administrativa a cuarentena con límites y magic bytes. | Extensiones falsas y tamaños excesivos se rechazan. |
| P0 | M09-03 | Cola de procesamiento idempotente y estados del documento. | Reintentos no duplican derivados ni publican parciales. |
| P0 | M09-04 | Worker aislado, sin red y con límites de CPU, memoria y tiempo. | Un PDF hostil no afecta la API principal. |
| P0 | M09-05 | Rasterizar cada página a imagen maestra privada. | El navegador nunca participa de la conversión. |
| P0 | M09-06 | Generar variantes normal/alta y hashes de integridad. | Cantidad de páginas y derivados queda validada. |
| P0 | M09-07 | Publicar solo al completar todo el procesamiento. | Estados failed/rejected nunca aparecen en catálogo. |
| P1 | M09-08 | Antivirus, sanitización de metadatos y límites anti-bomba. | Los rechazos incluyen motivo administrable. |
| P2 | M09-09 | Generar pirámide de tiles para documentos seleccionados. | Se activa por feature flag/documento. |
| P2 | M09-10 | Reprocesamiento versionado sin cortar lecturas activas abruptamente. | La transición entre versiones es consistente. |
| P3 | M09-11 | Pipeline multirregión o procesamiento elástico avanzado. | Solo se adopta con volumen comprobado. |

## M10 · Entrega protegida y watermark

Capa: Backend y seguridad

Objetivo: Entregar únicamente píxeles autorizados, marcados y de vida corta.

| Prioridad | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| P0 | M10-01 | Crear viewer_session ligada a usuario, documento, sesión y dispositivo. | No puede trasladarse a otra sesión. |
| P0 | M10-02 | Token de página con user, document, page, session, device, audience, jti y exp. | Alterar cualquier claim invalida la solicitud. |
| P0 | M10-03 | Validar cuenta, access_until, sesión, dispositivo y revocación en cada página. | No depende del login inicial. |
| P0 | M10-04 | Compositor server-side de watermark visible dentro de los píxeles. | El cliente nunca recibe una variante limpia. |
| P0 | M10-05 | Patrón repetido con cuenta, correo oculto, documento, sesión y timestamp. | Una captura puede asociarse a una cuenta. |
| P0 | M10-06 | Entrega WebP/AVIF/JPEG con private, no-store y CORP same-origin. | No hay cache compartida ni hotlink funcional. |
| P0 | M10-07 | Rate limit por cuenta, sesión, dispositivo, IP y documento. | El scraping rápido es bloqueado y auditado. |
| P1 | M10-08 | Watermark_epoch renovado cada 5-15 minutos. | Nuevas páginas reflejan el epoch vigente. |
| P1 | M10-09 | Uso único de jti en perfiles/documentos de mayor riesgo. | La política se activa sin afectar todo el catálogo. |
| P2 | M10-10 | Entrega por tiles y resolución adaptativa por riesgo. | Conserva validación y watermark en cada fragmento. |
| P3 | M10-11 | Marca forense invisible con corrección de errores y peritaje. | Se valida contra captura, escala, recorte y compresión. |
| P3 | M10-12 | Evaluación de DRM comercial. | Incluye prueba técnica, accesibilidad, lock-in y costo total. |

## M11 · Seguridad, auditoría y detección

Capa: Transversal

Objetivo: Prevenir abuso automatizado, responder rápido y conservar evidencia útil.

| Prioridad | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| P0 | M11-01 | CSP estricta, HSTS gradual, XFO DENY, nosniff, no-referrer y CORP. | Pruebas automatizadas verifican encabezados. |
| P0 | M11-02 | Protección CSRF en operaciones mutables y CORS cerrado. | Una web externa no ejecuta acciones autenticadas. |
| P0 | M11-03 | Auditoría de login, acceso, administración y revocación. | Incluye actor, acción, objeto, resultado y request_id. |
| P0 | M11-04 | Redacción de cookies, passwords y tokens en logs. | Escaneo de logs no encuentra secretos completos. |
| P1 | M11-05 | Motor inicial de reglas: velocidad, secuencia, concurrencia, dispositivos y tokens. | Cada alerta explica qué señales la produjeron. |
| P1 | M11-06 | Respuesta escalonada: observar, limitar, reautenticar, revocar y suspender. | Una señal aislada no bloquea injustamente. |
| P1 | M11-07 | Panel de eventos y alertas operativas. | El administrador puede investigar y dejar resolución. |
| P2 | M11-08 | Score de riesgo configurable y análisis cruzado entre cuentas. | Los cambios de umbral están auditados. |
| P2 | M11-09 | Pruebas de seguridad recurrentes y gestión de vulnerabilidades. | Hallazgos tienen severidad, dueño y fecha objetivo. |
| P3 | M11-10 | SIEM/SOC y retención reforzada de evidencias. | Solo con necesidad operativa o regulatoria. |

## M12 · Infraestructura, calidad y operación

Capa: Transversal

Objetivo: Poner el MVP en producción de forma reproducible, observable y recuperable.

| Prioridad | ID | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| P0 | M12-01 | Entornos separados, configuración por ambiente y secretos gestionados. | No hay secretos en repositorio ni frontend. |
| P0 | M12-02 | CI con build, lint, pruebas y escaneo de dependencias. | No se despliega un build fallido. |
| P0 | M12-03 | Migraciones de base y seeds de desarrollo seguros. | Rollback y restauración se prueban. |
| P0 | M12-04 | Observabilidad: logs, métricas, trazas y alertas básicas. | Cada request crítica puede seguirse por request_id. |
| P0 | M12-05 | Backups cifrados de base y almacenamiento; prueba de restauración. | RPO/RTO iniciales quedan medidos. |
| P0 | M12-06 | Pruebas end-to-end del camino crítico. | Login, catálogo, visor, vencimiento y revocación pasan. |
| P1 | M12-07 | Pruebas de carga del visor y procesamiento. | Se conoce capacidad y cuello de botella. |
| P1 | M12-08 | Runbooks de incidentes, revocación masiva y worker atascado. | Una persona operadora puede actuar sin improvisar. |
| P1 | M12-09 | Monitoreo de costos de CPU, storage, egreso y logs. | Hay presupuesto y alertas por desviación. |
| P2 | M12-10 | SLO 99,5%, pruebas de resiliencia y despliegue gradual. | Errores se contienen y revierten rápidamente. |
| P3 | M12-11 | Alta disponibilidad multirregión y recuperación avanzada. | Se justifica con escala y criticidad. |

## 4. Dependencias y reglas de secuencia

- No empezar la API de una pantalla hasta aprobar sus estados y contrato visual.

- No integrar el visor real hasta que M04 funcione con recursos simulados y manejo de expiración.

- M07 y M08 deben estar operativos antes de habilitar cualquier entrega real de M10.

- M09 nunca publica derivados parciales; M10 solo lee documentos en estado ready.

- M11 y M12 son transversales: sus P0 se implementan junto con la primera integración, no al final.

## 5. Definición global de terminado

- La tarea está implementada y revisada contra su criterio de aceptación.

- Tiene estados de error, carga, vacío y permiso cuando corresponda.

- Incluye pruebas proporcionales al riesgo y no rompe el camino crítico.

- No registra contraseñas, cookies, tokens completos ni contenido protegido.

- La documentación y el contrato se actualizan en el mismo cambio.

- Funciona en desktop y móvil para el viewport objetivo.

- Las decisiones sensibles y acciones administrativas quedan auditadas.

## 6. Supuestos de planificación que quedan configurables

- Una sesión interactiva activa por cuenta.

- Hasta dos dispositivos registrados, con un solo dispositivo activo a la vez.

- Verificación inicial de dispositivo nuevo por correo.

- Imágenes completas por página en el MVP; tiles como P2 selectivo.

- Watermark visible horneado en servidor; marca forense como P3.

- Web responsive; PWA sin offline de material como P3 y app nativa fuera del MVP.

Estos supuestos no se tratan como decisiones irreversibles. Se implementan como configuración o política para poder ajustarlos cuando se definan las reglas comerciales finales.

## 7. Próximo paso recomendado

Convertir M00 a M05 en el primer tablero de trabajo del frontend. Para cada tarea se agregan responsable, estimación y dependencia inmediata. Al completar H1 y H2 se redacta OpenAPI desde los adaptadores de mocks aprobados y comienza la integración incremental.
