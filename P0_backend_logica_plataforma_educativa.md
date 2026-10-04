# P0 · Lógica y backend del MVP

**Estado:** Pendiente  
**Progreso:** 18/41 tareas completadas  
**Punto actual:** M09 · punto 1 (validación con R2 y Docker pendiente)  
**Alcance:** API, base de datos, autenticación real, autorización, sesiones, procesamiento privado de documentos, entrega protegida, seguridad y operación básica.

> Este documento continúa el frontend ya terminado. A partir de ahora se reemplazarán gradualmente los datos simulados por servicios reales, sin cambiar los recorridos visuales aprobados.

## 1. Objetivo de P0

Conseguir un camino real y seguro de extremo a extremo:

1. El administrador crea una cuenta y define su acceso.
2. El estudiante inicia sesión y, si corresponde, cambia su contraseña inicial.
3. El backend comprueba el estado de la cuenta y la fecha de acceso en UTC.
4. El administrador carga un PDF privado.
5. Un worker convierte el PDF en imágenes protegidas y publica el material únicamente cuando termina.
6. El estudiante abre el material y recibe solo páginas autorizadas con watermark incrustado.
7. Las operaciones críticas quedan auditadas, observables y cubiertas por pruebas.

## 2. Stack tecnológico elegido

### Aplicación y lenguaje

| Capa | Tecnología | Motivo |
| --- | --- | --- |
| Frontend | Next.js + React + TypeScript | Ya está implementado y desplegable en Netlify. |
| API | Node.js + TypeScript + Fastify | Comparte tipos con el frontend, tiene poco overhead y buen soporte de OpenAPI. |
| Validación/contrato | TypeBox + Fastify Swagger + OpenAPI | Un mismo esquema valida en runtime y documenta la API. |
| Cliente frontend | `openapi-typescript` | Genera tipos desde el contrato y reduce incompatibilidades. |
| Acceso a datos | Drizzle ORM | Ligero, tipado y con migraciones SQL revisables. |
| Base de datos | PostgreSQL en Neon | Escala a cero y ofrece un nivel gratuito apropiado para desarrollo/MVP. |
| Sesiones | PostgreSQL | Evita pagar Redis en P0 y permite revocación server-side. |
| Cola inicial | `pg-boss` sobre PostgreSQL | Cola persistente e idempotente sin contratar otro servicio. |
| Objetos privados | Cloudflare R2 Standard | API S3, almacenamiento económico y sin cargo de egreso desde R2. |
| Procesamiento PDF | Worker Node.js en contenedor + Poppler + Sharp | Rasterización aislada y watermark server-side sin enviar el PDF al navegador. |
| Hash de claves | Argon2id | Cumple el requisito de almacenamiento seguro de contraseñas. |
| Pruebas | Vitest + Fastify inject + Playwright | Unitarias, integración de API y camino crítico end-to-end. |
| Monorepo | npm workspaces | Aprovecha npm ya instalado y permite compartir contratos sin otra herramienta. |

### Despliegue recomendado

| Componente | Servicio inicial | Política de costo |
| --- | --- | --- |
| Frontend | Netlify Free | Mantener el límite gratuito y desactivar recargas automáticas. |
| API | Railway Hobby, una instancia pequeña | Presupuesto inicial de USD 5/mes y alerta antes de excederlo. |
| Worker | Mismo proyecto Railway, proceso separado y escalado mínimo | Medir una semana; apagarlo cuando no haya cargas si el proveedor no escala a cero. |
| PostgreSQL | Neon Free | Límite inicial de 0,5 GB y compute con scale-to-zero. |
| Archivos | Cloudflare R2 Standard | Primeros 10 GB-mes y cuotas iniciales dentro del nivel gratuito. |
| Dominio | Proveedor de dominio + DNS Cloudflare Free | Único costo anual fijo fuera del cómputo. |

La API y el worker tendrán imágenes Docker separadas, aunque compartan repositorio. Esto conserva el aislamiento del procesamiento. Si mantener el worker activo incrementa demasiado Railway, se moverá a un **Cloud Run Job bajo demanda**, que cobra por ejecución y dispone de nivel gratuito; no se hará esa separación antes de medir uso real.

### Estructura prevista del repositorio

```text
apps/
  web/       # Next.js existente
  api/       # Fastify y endpoints
  worker/    # procesamiento de PDF
packages/
  contracts/ # esquemas, OpenAPI y tipos compartidos
  database/  # esquema Drizzle y migraciones
  config/    # configuración tipada y utilidades comunes
```

La reorganización se hará de manera incremental al comenzar M06; no es necesario mover todo el frontend de una sola vez.

### Presupuesto inicial

- Objetivo durante desarrollo: **USD 0/mes**, ejecutando API, PostgreSQL y worker localmente.
- Objetivo durante demo privada: **USD 5-10/mes**, más el dominio si se compra.
- Objetivo del MVP con usuarios reales: comenzar en **USD 5-20/mes** y ajustar con métricas.
- Configurar alertas de gasto en Railway, Cloudflare, Neon y Netlify.
- No activar recarga automática, almacenamiento público, réplicas, Redis, antivirus administrado ni servicios premium durante P0 sin una medición que lo justifique.

Los valores son objetivos, no una garantía: el costo real dependerá de usuarios, páginas vistas, peso de imágenes y PDFs procesados.

### Por qué no usaremos otras opciones en P0

- **Firebase:** el modelo documental complica relaciones, auditoría y transacciones del acceso mensual.
- **Supabase completo:** es válido, pero su plan Pro comienza más alto y usaríamos servicios que no necesitamos; Neon + backend propio deja menor costo base.
- **AWS tradicional:** ofrece máxima flexibilidad, pero añade complejidad operativa y riesgo de costos para este MVP.
- **Redis administrado:** no es necesario todavía; PostgreSQL cubre sesiones, rate limits moderados y cola inicial.
- **Conversión PDF en funciones de Netlify:** los límites y el aislamiento de una función web no son adecuados para documentos pesados.

## 3. Decisiones obligatorias

- [x] Definir stack de API, base de datos, cola, almacenamiento privado y worker.
- [x] Definir ambientes local, pruebas y producción.
- [ ] Definir duración de sesión por inactividad y duración absoluta.
- [ ] Definir duración de acceso inicial y reglas de extensión manual.
- [ ] Definir tamaño máximo de PDF, páginas máximas y formatos derivados.
- [ ] Definir RPO y RTO iniciales para recuperación.

Estas decisiones son de configuración y arquitectura; no se cuentan dentro de las 41 tareas del backlog.

## 4. Orden de implementación

| Etapa | Módulos | Resultado verificable |
| --- | --- | --- |
| B0 | M06 | Contrato OpenAPI, errores y adaptadores congelados. |
| B1 | M07 + M02 | Usuarios, login real, cambio de contraseña y estados de acceso. |
| B2 | M08 | Sesiones server-side y registro de dispositivo. |
| B3 | M09 | Carga privada y conversión segura de PDFs. |
| B4 | M10 | Viewer session, tokens de página, watermark y rate limits. |
| B5 | M11 + M12 | Hardening, auditoría, observabilidad, backups y pruebas E2E. |

## 5. Backlog P0

### M02 · Autenticación y estados de acceso

Objetivo: conectar las pantallas reservadas del frontend con estados y respuestas reales.

| Estado | Punto | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| [ ] | 1 | Conectar el login real con validación, errores genéricos y estado de espera. | No enumera cuentas, evita dobles envíos y crea una sesión válida. |
| [ ] | 2 | Implementar el cambio obligatorio de contraseña inicial. | `must_change_password` impide acceder al catálogo hasta completar el cambio. |
| [ ] | 3 | Conectar los estados vencido, suspendido y revocado. | La causa real dirige a la pantalla y siguiente paso correctos. |

### M06 · Contratos de API e integración

Objetivo: sustituir mocks progresivamente sin romper el frontend aprobado.

| Estado | Punto | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| [x] | 1 | Definir OpenAPI para autenticación, catálogo, visor y administración. | Incluye errores, paginación, idempotencia y ejemplos. |
| [x] | 2 | Definir esquema común de errores y `request_id`. | El frontend interpreta todos los errores previstos. |
| [x] | 3 | Generar cliente tipado o adaptador validado contra contrato. | Mocks y API real comparten interfaces. |
| [x] | 4 | Integrar primero login, sesión y estado de acceso. | Los guards dejan de depender de datos simulados. |

### M07 · Identidad, acceso mensual y administración

Objetivo: implementar las reglas centrales de cuentas y acceso manual.

| Estado | Punto | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| [x] | 1 | Crear `users` con `status`, `access_until`, `password_hash` y `must_change_password`. | No existe contraseña en claro ni campo `temporary_password`. |
| [x] | 2 | Implementar hash Argon2id y política de contraseña inicial. | Parámetros configurables y verificados mediante pruebas. |
| [x] | 3 | Implementar login no enumerativo y rate limit. | Los intentos quedan auditados sin registrar secretos. |
| [x] | 4 | Crear middleware central de autorización y validar `access_until` en UTC. | Se ejecuta en cada solicitud de contenido. |
| [x] | 5 | Implementar CRUD administrativo de usuarios con RBAC. | Solo administradores autorizados modifican el acceso. |
| [x] | 6 | Implementar extensión manual con auditoría before/after. | La operación es transaccional y trazable. |

### M08 · Sesiones y dispositivos

Objetivo: controlar sesiones compartidas sin depender de IP o fingerprint como identidad.

| Estado | Punto | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| [x] | 1 | Crear sesiones opacas server-side con cookie `__Host-`, HttpOnly, Secure y SameSite. | No se guardan credenciales ni tokens de sesión en `localStorage`. |
| [x] | 2 | Aplicar expiración por inactividad y absoluta; rotar al autenticar y cambiar clave. | Una sesión anterior no sobrevive a cambios sensibles. |
| [x] | 3 | Permitir una sesión interactiva activa por cuenta y cerrar la anterior. | Varias pestañas de la misma sesión siguen funcionando. |
| [x] | 4 | Registrar dispositivo mediante identificador aleatorio hasheado. | Fingerprint e IP se usan únicamente como señales auxiliares. |

### M09 · Carga y procesamiento de documentos

Objetivo: convertir originales privados en derivados seguros y operables.

| Estado | Punto | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| [ ] | 1 | Configurar almacenamiento privado de originales sin ACL pública ni URL permanente. | Una prueba externa no puede leer ningún original. |
| [x] | 2 | Implementar carga administrativa a cuarentena con límites y magic bytes. | Extensiones falsas y archivos excesivos son rechazados. |
| [x] | 3 | Crear cola idempotente y estados de procesamiento del documento. | Los reintentos no duplican derivados ni publican parciales. |
| [ ] | 4 | Ejecutar el worker aislado, sin red y con límites de CPU, memoria y tiempo. | Un PDF hostil no afecta la API principal. |
| [ ] | 5 | Rasterizar cada página a una imagen maestra privada. | El navegador nunca recibe ni convierte el PDF. |
| [x] | 6 | Generar variantes normal/alta y hashes de integridad. | Se validan la cantidad de páginas y todos los derivados. |
| [x] | 7 | Publicar únicamente después de completar todo el procesamiento. | Documentos `failed` o `rejected` nunca aparecen en catálogo. |

> **Pendiente para cerrar M09:** instalar Docker Desktop, conectar R2 y ejecutar el PDF de ejemplo en el sandbox. El código de los puntos 1, 4 y 5 está preparado, pero sus criterios requieren verificación real de infraestructura.

Estados mínimos del documento: `quarantined`, `queued`, `processing`, `ready`, `failed`, `rejected` y `archived`.

### M10 · Entrega protegida y watermark

Objetivo: entregar solo píxeles autorizados, marcados y de corta duración.

| Estado | Punto | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| [ ] | 1 | Crear `viewer_session` ligada a usuario, documento, sesión y dispositivo. | No puede trasladarse a otra sesión. |
| [ ] | 2 | Crear token de página con user, document, page, session, device, audience, `jti` y `exp`. | Alterar cualquier claim invalida la solicitud. |
| [ ] | 3 | Revalidar cuenta, acceso, sesión, dispositivo y revocación en cada página. | La autorización no depende solamente del login inicial. |
| [ ] | 4 | Crear compositor server-side de watermark visible dentro de los píxeles. | El cliente nunca recibe una variante limpia. |
| [ ] | 5 | Repetir cuenta, correo oculto, documento, sesión y timestamp en la marca. | Una captura puede asociarse a una cuenta. |
| [ ] | 6 | Entregar WebP/AVIF/JPEG con `private`, `no-store` y CORP `same-origin`. | No existe caché compartida ni hotlink funcional. |
| [ ] | 7 | Aplicar rate limit por cuenta, sesión, dispositivo, IP y documento. | El scraping rápido se bloquea y queda auditado. |

### M11 · Seguridad, auditoría y detección

Objetivo: aplicar controles transversales desde la primera integración.

| Estado | Punto | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| [ ] | 1 | Aplicar CSP estricta, HSTS gradual, XFO DENY, `nosniff`, `no-referrer` y CORP. | Pruebas automatizadas verifican los encabezados. |
| [ ] | 2 | Proteger operaciones mutables contra CSRF y cerrar CORS. | Un sitio externo no puede ejecutar acciones autenticadas. |
| [ ] | 3 | Auditar login, acceso, administración y revocación. | Cada evento incluye actor, acción, objeto, resultado y `request_id`. |
| [ ] | 4 | Redactar cookies, contraseñas y tokens en logs. | El escaneo de logs no encuentra secretos completos. |

### M12 · Infraestructura, calidad y operación

Objetivo: desplegar el MVP de forma reproducible, observable y recuperable.

| Estado | Punto | Tarea | Definición de terminado |
| --- | --- | --- | --- |
| [ ] | 1 | Separar ambientes, configuración y gestión de secretos. | No hay secretos en el repositorio ni en el bundle frontend. |
| [ ] | 2 | Configurar CI con build, lint, pruebas y escaneo de dependencias. | Un build fallido no puede desplegarse. |
| [ ] | 3 | Crear migraciones de base y seeds seguros para desarrollo. | Se prueban rollback y restauración. |
| [ ] | 4 | Añadir logs, métricas, trazas y alertas básicas. | Cada request crítica puede seguirse mediante `request_id`. |
| [ ] | 5 | Crear backups cifrados de base y almacenamiento y probar restauración. | Los RPO/RTO iniciales quedan medidos. |
| [ ] | 6 | Automatizar pruebas E2E del camino crítico. | Login, catálogo, visor, vencimiento y revocación pasan. |

## 6. Modelo de datos mínimo

- `users`: identidad, rol, estado, vigencia de acceso y credenciales hasheadas.
- `sessions`: sesión opaca, expiraciones, revocación, usuario y dispositivo.
- `devices`: identificador hasheado, nombre visible, señales y estado.
- `documents`: materia, metadatos, estado, versión y número de páginas.
- `document_pages`: página, variante, ubicación privada, dimensiones y hash.
- `processing_jobs`: intento, estado, error seguro y marcas de tiempo.
- `viewer_sessions`: usuario, sesión, dispositivo, documento y expiración.
- `audit_events`: actor, acción, objeto, resultado, cambios y `request_id`.
- `rate_limit_events`: dimensión limitada, resultado y ventana temporal.

Las materias iniciales serán **Anatomía**, **Biología** e **Histología**. Cada documento pertenece a una materia y sus materiales se consultan dentro de ella.

## 7. Superficie inicial de API

Los nombres definitivos se congelaron en M06, punto 1, pero P0 debe cubrir como mínimo:

- Autenticación: login, logout, sesión actual y cambio obligatorio de contraseña.
- Administración de usuarios: listar, crear, editar estado y extender acceso.
- Catálogo: listar materias, materiales y detalle autorizado.
- Administración de documentos: cargar, consultar procesamiento, publicar o archivar.
- Visor: crear/cerrar viewer session, obtener manifiesto y solicitar una página.
- Operación: health/readiness sin datos sensibles.

## 8. Reglas de seguridad no negociables

- El PDF original nunca llega al navegador.
- Cada solicitud de página vuelve a validar autorización y revocación.
- Ningún secreto, contraseña, cookie o token completo entra en logs.
- Las fechas de acceso se almacenan y comparan en UTC.
- Las acciones administrativas usan RBAC y quedan auditadas.
- El almacenamiento es privado por defecto; no se usan URLs permanentes.
- Los errores externos son genéricos y los detalles internos se correlacionan por `request_id`.
- Fingerprint e IP no sustituyen un identificador de sesión o dispositivo.
- Los trabajos y operaciones reintentables son idempotentes.

## 9. Puertas de aprobación

- [ ] **G0 · Contrato:** OpenAPI, errores y adaptadores aprobados.
- [ ] **G1 · Identidad:** login, cambio inicial, estado y vigencia funcionan con base real.
- [ ] **G2 · Sesión:** cookies seguras, rotación, expiración y sesión única verificadas.
- [ ] **G3 · Procesamiento:** un PDF de prueba pasa de cuarentena a `ready` sin exposición pública.
- [ ] **G4 · Visor:** el navegador recibe solo imágenes autorizadas con watermark incrustado.
- [ ] **G5 · Seguridad:** CSRF, headers, rate limits, redacción y auditoría pasan pruebas.
- [ ] **G6 · Operación:** CI, observabilidad, backups/restauración y E2E aprobados.

## 10. Fuera de P0

Quedan para prioridades posteriores: recuperación de contraseña, MFA administrativo, desafío de dispositivo nuevo, dos dispositivos configurables, revocación avanzada, antivirus, tiles, watermark rotativo o forense, motor de riesgo, panel de alertas, pruebas de carga, runbooks avanzados, pagos y alta disponibilidad multirregión.

## 11. Registro de avance

| Fecha | Tarea | Resultado |
| --- | --- | --- |
| 2026-07-30 | M06 · punto 1 | Contrato OpenAPI 3.1 creado y validado para autenticación, catálogo, visor y administración. |
| 2026-07-30 | M06 · punto 2 | Catálogo cerrado de 18 errores, reglas de request_id e intérprete frontend con pruebas. |
| 2026-07-30 | M06 · punto 3 | Tipos generados desde OpenAPI, cliente HTTP y gateway compartido entre API y demo. |
| 2026-07-30 | M06 · punto 4 | Login y guard conectados al gateway real mediante configuración; activación E2E dependiente de M07/M08. |
| 2026-07-30 | M07 · punto 1 | Modelo users, configuración Drizzle y migración PostgreSQL inicial creados y verificados. |
| 2026-08-02 | M07 · punto 2 | Política configurable, generación inicial y hash/verificación Argon2id implementados. |
| 2026-08-02 | M07 · punto 3 | Login no enumerativo, rate limit HMAC y auditoría sin secretos implementados. |
| 2026-08-02 | M07 · punto 4 | Autorización central por sesión, estado, rol y vencimiento UTC preparada para rutas de contenido. |
| 2026-08-02 | M07 · punto 5 | CRUD administrativo con RBAC implementado en servicio, persistencia y rutas Fastify. |
| 2026-08-02 | M07 · punto 6 | Extensión de acceso transaccional con bloqueo y auditoría before/after implementada. |
| 2026-08-02 | M08 · punto 1 | Token opaco hasheado y cookie `__Host-`, HttpOnly, Secure y SameSite implementados. |
| 2026-08-02 | M08 · punto 2 | Expiraciones de inactividad/absoluta y rotación al login/cambio de clave implementadas. |
| 2026-08-02 | M08 · punto 3 | Sesión interactiva única transaccional y uso compartido entre pestañas verificados. |
| 2026-08-02 | M08 · punto 4 | Registro de dispositivo mediante UUID aleatorio hasheado, sin depender de IP/fingerprint. |
| 2026-08-02 | M09 · punto 2 | Carga multipart a cuarentena con límite, magic bytes, claves privadas y SHA-256 verificada. |
| 2026-08-02 | M09 · punto 3 | Estados PostgreSQL, idempotencia y cola pg-boss implementados con reintentos seguros. |
| 2026-08-02 | M09 · punto 6 | Variantes master/normal/high y hashes/dimensiones validados por página. |
| 2026-08-02 | M09 · punto 7 | Publicación atómica y limpieza de parciales implementadas y probadas. |

Al completar una tarea se debe cambiar `[ ]` por `[x]`, actualizar el contador superior y añadir una entrada a este registro.
