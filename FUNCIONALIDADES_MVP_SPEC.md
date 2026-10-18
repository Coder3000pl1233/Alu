# EntreApuntes — funcionalidades del MVP

**Actualizado:** 17 de octubre de 2026  
**Alcance:** las 14 funcionalidades de este documento componen **un único MVP entregable**, definido en [MVP_SPEC.md](./MVP_SPEC.md). Podemos desarrollar y comprobar partes durante la construcción, pero ninguna parte por sí sola constituye una entrega del producto.

## Cómo usar este documento

Cada punto describe una funcionalidad o una base necesaria del mismo MVP. Las casillas **Front**, **Back** e **Integración** sirven para seguir el trabajo interno y se marcan solo cuando la parte correspondiente funciona y se ha verificado; una pantalla que hoy usa datos simulados no cuenta como terminada. «Integración» incluye conectar ambas capas, manejar errores y comprobar el recorrido real. La comprobación de cada punto valida avance, pero no autoriza una entrega parcial.

La numeración indica un orden de trabajo sugerido por dependencias: primero se crean publicaciones reales y se moderan; luego se conectan las pantallas públicas. Durante el desarrollo se pueden usar datos de prueba, pero el MVP terminado no debe requerir editar la base de datos a mano.

| Puntos del mismo MVP | Área de trabajo | Resultado esperado |
| --- | --- | --- |
| 00 | Base compartida | Modelo y contratos del marketplace. |
| 01–06 | Vendedor y moderación | Cuenta → borrador → muestra → estados → gestión → aprobación. |
| 07–12 | Experiencia pública | Catálogo → inicio → ficha → muestra → contacto → favoritos. |
| 13 | Reportes | Aviso de contenido y resolución administrativa. |

## 00 · Base de datos y contratos del marketplace

- [x] **Front:** definir tipos de publicación, muestra, usuario y errores que consumirán las pantallas; mantener un adaptador de datos reemplazable para retirar los mocks por partes.
- [x] **Back:** crear modelos y migraciones para cuentas, publicaciones, muestras, decisiones de moderación y reportes; definir consultas públicas que solo devuelvan publicaciones `publicada` y operaciones privadas con control de propietario o rol.
- [x] **Integración:** actualizar el contrato de API y el cliente tipado, eliminando las reglas heredadas de suscripción que contradicen el [MVP_SPEC.md](./MVP_SPEC.md); probar migraciones y respuestas de error comunes.

**Comprobación interna:** una publicación creada en la base se lee con el mismo identificador y los mismos campos desde el cliente; una no publicada no aparece en la consulta pública.

**Estado del punto 00:** contrato OpenAPI, cliente y pruebas de API/errores completados. Las migraciones se aplicaron en PostgreSQL 18 local y una prueba verificó el recorrido cliente → API → PostgreSQL con datos persistidos, incluyendo la exclusión pública de borradores. La conexión local está en `.env.local`, ignorado por Git.

## 01 · Cuenta del vendedor (F07 / MVP-07)

- [x] **Front:** adaptar `/login` y añadir registro, verificación de correo, recuperación de contraseña y cierre de sesión; pedir acceso solo al intentar publicar o gestionar publicaciones.
- [x] **Back:** implementar registro, correo de verificación de un uso, recuperación con plazo limitado, contraseña protegida, sesión en cookie segura y roles `vendedor`/`administrador`; evitar que las respuestas revelen si un correo existe.
- [x] **Integración:** conectar formularios y guardas al servicio real, retirar el modo demo del recorrido de vendedores y comprobar permisos tanto en UI como mediante solicitudes directas.

**Comprobación interna:** un visitante puede explorar; una cuenta sin verificar guarda un borrador pero no lo envía; una cuenta ajena no modifica publicaciones de otro vendedor. No se muestra «correo universitario verificado» por verificar un correo común.

**Estado del punto 01:** registro, inicio/cierre de sesión, verificación y recuperación funcionan con PostgreSQL local. El correo se entrega en `/dev/correos` solo en desarrollo, según la configuración local elegida; antes de desplegar se debe conectar un proveedor real. La creación y envío de borradores, junto con su comprobación completa, corresponden a los puntos 02 y 04; el formulario actual lo indica y no simula un guardado.

## 02 · Formulario y borrador persistente (F08 / MVP-08)

- [ ] **Front:** convertir `/app/publicar` en un formulario que crea y edita borradores; conservar lo escrito ante errores; usar catálogos de materia y universidad, precio en ARS y consentimiento explícito para mostrar el contacto.
- [ ] **Back:** exponer catálogos controlados de materia y universidad; guardar borradores asociados al propietario y validar título, descripción, materia, universidad, tipo, precio entero mayor que cero y WhatsApp en formato internacional; controlar concurrencia de edición y acceso por propietario.
- [ ] **Integración:** conectar guardar/editar, mostrar errores por campo y recuperar el mismo borrador al recargar; unificar los catálogos usados por formulario y filtros.

**Comprobación interna:** el vendedor guarda, sale y vuelve a editar su borrador; el servidor rechaza campos inválidos aunque se salte la validación del navegador; otra cuenta no puede abrirlo ni editarlo.

## 03 · PDF de muestra (F09 / MVP-09)

- [ ] **Front:** añadir carga con progreso y estados `sin archivo`, `cargando`, `procesando`, `lista` y `error`; permitir reemplazar o reintentar sin perder el borrador.
- [ ] **Back:** aceptar únicamente PDF legible de hasta 25 MB y al menos cinco páginas; validar el contenido real, guardar el original de muestra de forma privada y generar derivados de las primeras cinco páginas; limpiar cargas fallidas o incompletas.
- [ ] **Integración:** asociar archivo y derivados a la publicación correcta, consultar el estado del procesamiento y permitir enviar a revisión solo cuando la muestra esté `lista`.

**Comprobación interna:** un archivo no PDF, demasiado grande o de cuatro páginas se rechaza; dos publicaciones conservan muestras distintas; un fallo de procesamiento no publica contenido parcial. El apunte completo no se sube.

## 04 · Ciclo de estados (F10 / MVP-10)

- [ ] **Front:** mostrar estado y acciones disponibles en la publicación; pedir confirmación para retirar; explicar el motivo de rechazo u ocultamiento y el paso siguiente.
- [ ] **Back:** implementar transiciones autorizadas, baja lógica, registro de actor/fecha/motivo y exclusión inmediata de cualquier estado no público. Una edición de texto visible, precio, contacto o muestra vuelve a `pendiente`.
- [ ] **Integración:** refrescar vistas tras cada transición y probar que catálogo, ficha, muestra y contacto respetan el mismo estado, incluso si se abre una URL antigua.

| Estado | Público | Siguiente acción principal |
| --- | --- | --- |
| `borrador` | No | Editar y enviar a revisión. |
| `pendiente` | No | Esperar decisión o volver a borrador. |
| `publicada` | Sí | Pausar, editar para revisión o retirar. |
| `rechazada` | No | Corregir y reenviar. |
| `pausada` | No | Reanudar sin cambios o editar para revisión. |
| `oculta` | No | Solicitar nueva revisión; solo administración puede aprobar. |
| `retirada` | No | Consultar historial; estado final. |

**Comprobación interna:** `borrador → pendiente` exige cuenta verificada, datos válidos y muestra lista; `pendiente → publicada/rechazada` exige administrador; editar una publicada la retira temporalmente hasta nueva aprobación; ninguna transición prohibida funciona llamando directamente a la API.

## 05 · Mis publicaciones (F11 / MVP-11)

- [ ] **Front:** conectar `/app/mis-publicaciones` con la lista propia, filtros por estado y acciones permitidas; eliminar cifras simuladas de visitas y consultas.
- [ ] **Back:** ofrecer listado y detalle privados por propietario, paginación y operaciones de editar, enviar, pausar, reanudar y retirar según el ciclo de estados.
- [ ] **Integración:** mantener lista, formulario y estado sincronizados tras cada acción y mostrar motivos de rechazo u ocultamiento sin exponer reportantes.

**Comprobación interna:** dos vendedores ven solo sus propias publicaciones y no pueden operar sobre las del otro.

## 06 · Revisión administrativa (F12 / MVP-12)

- [ ] **Front:** reemplazar en `/admin` los controles de acceso mensual por una cola de publicaciones pendientes con ficha, muestra, decisión y motivo; mostrar también publicaciones ocultas.
- [ ] **Back:** permitir aprobar, rechazar u ocultar con rol administrativo, registrar decisión y motivo, y publicar ficha y muestra de forma consistente; impedir decisiones duplicadas sobre una versión ya revisada.
- [ ] **Integración:** al aprobar, hacer visible la publicación en consultas públicas; al rechazar u ocultar, quitar ficha, muestra y contacto; notificar el estado al vendedor en su panel.

**Comprobación interna:** una publicación pendiente no se ve públicamente, una aprobada sí, y una oculta desaparece de todas las superficies públicas sin demora.

## 07 · Catálogo, búsqueda y filtros (F02 / MVP-02)

- [ ] **Front:** conectar `/app/materias` y `/app/resultados` con búsqueda, filtros de universidad/tipo/precio, orden, paginación, total real, limpiar filtros y estado sin resultados; conservar los parámetros en la URL.
- [ ] **Back:** consultar solo publicaciones `publicada`, buscar por título/materia/descripción sin distinguir mayúsculas ni acentos y combinar filtros; validar rango de precio y devolver total y página de forma estable.
- [ ] **Integración:** usar la misma consulta para tarjetas, conteo y filtros; al cambiar consulta o filtro volver a la primera página y verificar que recargar o compartir la URL reproduce la vista.

**Comprobación interna:** buscar Anatomía no devuelve Biología; universidad y precio reducen el conjunto correcto; una publicación pausada desaparece del resultado y del total. No quedan resultados precargados que no coincidan con la búsqueda.

## 08 · Inicio conectado al catálogo (F01 / MVP-01)

- [ ] **Front:** conservar la portada actual, conectar la búsqueda y los enlaces de materias, y mostrar hasta tres publicaciones reales con un estado vacío cuando no haya contenido.
- [ ] **Back:** proporcionar materias disponibles y publicaciones destacadas tomadas de las `publicada`, con una regla de selección estable.
- [ ] **Integración:** enviar la búsqueda a resultados; una consulta vacía abre el catálogo general; aprobar, pausar u ocultar una publicación actualiza la portada.

**Comprobación interna:** Enter y el botón buscan lo mismo, las materias abren su filtro y ninguna tarjeta, cifra o testimonio ficticio se presenta como real.

## 09 · Ficha de publicación (F03 / MVP-03)

- [ ] **Front:** mostrar título, materia, universidad, tipo, descripción, precio orientativo, páginas declaradas, vendedor y fecha; mantener visibles las acciones de muestra y contacto; quitar reseñas, insignias, textos y botones sin respaldo real.
- [ ] **Back:** devolver la ficha pública solo si está `publicada`; para enlaces inexistentes, pausados, ocultos o retirados devolver no disponible sin datos privados del vendedor.
- [ ] **Integración:** usar el mismo registro que el catálogo; enlazar a la muestra y al contacto de ese identificador, y comprobar el cambio de estado mientras la ficha está abierta.

**Comprobación interna:** título, precio y vendedor coinciden entre resultado y ficha; una URL antigua de una publicación retirada no muestra precio, muestra ni contacto.

## 10 · Visor de cinco páginas (F04 / MVP-04)

- [ ] **Front:** adaptar el visor existente para mostrar página actual, total cinco, anterior/siguiente, zoom, regreso a ficha y estados de carga o error; conservar uso con teclado y tacto.
- [ ] **Back:** servir solo los cinco derivados de la muestra de la publicación `publicada`; no exponer el PDF original, páginas extra ni URLs permanentes de archivos privados.
- [ ] **Integración:** resolver la muestra mediante el ID real de la publicación, retirar el documento fijo de la demo y cancelar la lectura pública cuando la publicación cambie de estado.

**Comprobación interna:** dos publicaciones enseñan muestras diferentes; la página seis no existe; ocultar una publicación impide abrir su muestra aun con la URL conocida.

## 11 · Contacto externo (F05 / MVP-05)

- [ ] **Front:** abrir un diálogo antes de salir a WhatsApp, indicar que pago y entrega se acuerdan fuera de EntreApuntes y devolver el foco al botón al cancelar; quitar `/app/consultas` de la navegación del MVP.
- [ ] **Back:** validar y guardar el número consentido, generar el enlace para la publicación `publicada` y registrar solo el clic de salida, sin inferir conversación ni venta.
- [ ] **Integración:** construir un mensaje con el título correcto y comprobar el estado de la publicación antes de abrir el destino; no ofrecer contacto si falta un número válido.

**Comprobación interna:** el WhatsApp corresponde al vendedor de esa ficha; una publicación oculta o retirada no permite iniciar contacto desde enlaces antiguos.

## 12 · Favoritos de este navegador (F06 / MVP-06)

- [ ] **Front:** permitir guardar y quitar publicaciones en las tarjetas y la ficha; indicar en `/app/favoritos` que la lista es local y ofrecer estados vacío y sin coincidencias.
- [ ] **Back:** ofrecer consulta pública por lista de identificadores que devuelva únicamente publicaciones `publicada`, sin crear almacenamiento de favoritos en servidor para el MVP.
- [ ] **Integración:** resolver los IDs guardados contra el catálogo real al abrir favoritos y retirar de la lista visible los que ya no están públicos.

**Comprobación interna:** un favorito persiste al recargar en el mismo navegador, no aparece en uno nuevo y deja de ofrecer contacto si la publicación se retira.

## 13 · Reportes de contenido (F13 / MVP-12)

- [ ] **Front:** añadir «Reportar» funcional en la ficha, con motivo y descripción opcional; confirmar recepción. En `/admin`, listar reportes y permitir resolverlos u ocultar la publicación.
- [ ] **Back:** persistir motivo, publicación, estado, fecha y resolución; limitar envíos repetidos y proteger datos del reportante. Un reporte por sí solo no cambia el estado de la publicación.
- [ ] **Integración:** reflejar el reporte en la cola administrativa y, si se decide ocultar, aplicar de inmediato las reglas de visibilidad de los puntos 04, 09, 10 y 11.

**Comprobación interna:** el reporte se recibe y resuelve con actor y motivo; el vendedor no ve la identidad del reportante; la publicación sigue pública hasta que administración tome una decisión.

## Condición de entrega del MVP completo

- Las 14 funcionalidades tienen sus casillas de front, back e integración completadas y verificadas. No hay una entrega independiente por punto.
- Los recorridos funcionan con datos persistidos, sin mocks que simulen el resultado de una función.
- Se cubren carga, vacío, error y falta de permiso cuando correspondan; el recorrido funciona en móvil y con teclado.
- Las pruebas proporcionales verifican la regla principal y al menos un caso de error o permiso. El cambio pasa lint, pruebas relevantes y build.
- Ninguna función muestra reseñas, verificaciones, visitas, conversaciones o datos de suscripción ficticios como si fueran reales.

**Prueba final del MVP:** un vendedor se registra y verifica correo, crea un borrador, sube una muestra, lo envía y recibe aprobación; un visitante lo encuentra, ve exactamente cinco páginas, lo guarda y abre el contacto correcto; al pausar u ocultar la publicación desaparecen búsqueda, ficha pública, muestra y contacto. Se comprueban además PDF inválido, rechazo, edición para nueva revisión, reporte e intento de modificar una publicación ajena.
