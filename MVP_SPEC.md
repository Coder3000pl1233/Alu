# EntreApuntes — especificación del MVP

**Actualizado:** 17 de octubre de 2026  
**Estado:** alcance propuesto para construir y validar  
**Fuente de verdad del producto:** este documento. Los contratos técnicos existentes deben revisarse antes de reutilizarlos porque pertenecen al concepto anterior de biblioteca por suscripción.

El comportamiento detallado y los criterios de aceptación de cada función están en [FUNCIONALIDADES_MVP_SPEC.md](./FUNCIONALIDADES_MVP_SPEC.md). Ante una diferencia de alcance, prevalece este documento.

## 1. Qué estamos construyendo

EntreApuntes será un marketplace web donde estudiantes encuentran apuntes de otros estudiantes, revisan una muestra y contactan al vendedor. La plataforma ayuda a descubrir y evaluar el material; el acuerdo de pago y la entrega del apunte completo ocurren directamente entre las personas, fuera de EntreApuntes.

El MVP debe permitir completar un ciclo real: un vendedor crea una publicación, una persona administradora la revisa, un comprador la encuentra, ve cinco páginas de muestra y abre el contacto con el vendedor. Ningún paso de ese ciclo puede depender de datos simulados.

## 2. Personas y recorridos

| Persona | Necesidad | Recorrido principal |
| --- | --- | --- |
| Comprador | Encontrar material útil antes de contactar a alguien. | Buscar o explorar materia → filtrar → abrir ficha → leer muestra → contactar por WhatsApp. |
| Vendedor | Publicar y mantener sus apuntes. | Crear cuenta → cargar ficha y PDF de muestra → enviar a revisión → ver estado → editar, pausar o retirar. |
| Administrador | Evitar contenido engañoso o indebido. | Revisar publicaciones y reportes → aprobar, rechazar u ocultar con motivo. |

Explorar, buscar, abrir fichas y ver muestras será posible sin iniciar sesión. Publicar y administrar publicaciones requerirá una cuenta. Los favoritos podrán guardarse localmente en el navegador durante el MVP.

## 3. Alcance funcional

### Descubrimiento

- **MVP-01 · Inicio:** propuesta de valor, búsqueda principal, acceso a materias y una selección de publicaciones reales. Sin cifras, reseñas ni sellos inventados.
- **MVP-02 · Catálogo:** búsqueda por título, materia y palabras de la descripción; filtros funcionales por universidad, tipo y rango de precio. El resultado y su cantidad deben corresponder a los filtros aplicados.
- **MVP-03 · Ficha:** título, descripción, materia, universidad, tipo, precio orientativo, cantidad de páginas declarada, vendedor, fecha de actualización y estado de la publicación. La información debe coincidir con la búsqueda y la muestra.
- **MVP-04 · Muestra:** mostrar hasta cinco páginas del PDF de muestra, con navegación usable en móvil y escritorio. La plataforma no recibe ni entrega el apunte completo.
- **MVP-05 · Contacto:** abrir WhatsApp con un mensaje que identifique la publicación, después de avisar que pago y entrega se acuerdan fuera de EntreApuntes. El vendedor debe consentir que se use ese número como contacto.
- **MVP-06 · Favoritos:** guardar y quitar publicaciones en este navegador; las publicaciones retiradas no deben ofrecer una ficha comprable. No se promete sincronización entre dispositivos.

### Publicación y moderación

- **MVP-07 · Cuenta de vendedor:** registro, inicio y cierre de sesión, recuperación de acceso y verificación del correo antes de publicar. Solo mostrar una insignia de correo verificado cuando exista una verificación real; verificar el correo no certifica la calidad del contenido.
- **MVP-08 · Formulario:** título, materia, universidad, tipo, descripción, precio orientativo en ARS y contacto. Validación tanto en cliente como en servidor, con errores claros por campo.
- **MVP-09 · Muestra obligatoria:** aceptar un PDF legible de hasta 25 MB y al menos cinco páginas. Guardar el archivo de forma privada, generar las cinco páginas visibles y rechazar archivos inválidos. El vendedor declara que tiene derecho a compartir la muestra. El apunte completo no se sube.
- **MVP-10 · Ciclo de publicación:** estados `borrador`, `pendiente`, `publicada`, `rechazada`, `pausada`, `oculta` y `retirada`. Solo `publicada` aparece en búsqueda. Una edición sustancial de texto, precio, contacto o muestra vuelve a revisión. El vendedor ve el estado y el motivo de rechazo.
- **MVP-11 · Mis publicaciones:** listar publicaciones propias, editar un borrador, enviar a revisión, pausar o retirar una publicada. No mostrar visitas o consultas si no se miden realmente.
- **MVP-12 · Moderación y reportes:** una persona administradora puede aprobar, rechazar u ocultar publicaciones, registrar un motivo y revisar reportes de contenido. Un comprador puede reportar una ficha. El contacto deja de estar disponible cuando se oculta o retira la publicación.

## 4. Reglas del producto

1. Los datos de búsqueda, ficha, precio, muestra y vendedor provienen de la misma publicación persistida. No se mezclan ejemplos de distintas materias.
2. El precio es orientativo. EntreApuntes no cobra, retiene fondos, garantiza la entrega ni gestiona disputas de pago en este MVP.
3. Las muestras son públicas para lectura, pero sus originales se almacenan de forma privada. Se sirven únicamente los derivados necesarios para las cinco páginas visibles.
4. El catálogo solo muestra publicaciones aprobadas y activas. Una publicación retirada no puede contactar al vendedor desde su enlace anterior.
5. Las cuentas solo pueden modificar sus propias publicaciones. Las acciones de moderación requieren rol administrativo y quedan registradas.
6. El número de contacto se usa únicamente con autorización del vendedor y se elimina de la vista pública cuando la publicación deja de estar activa.
7. Estados vacíos, errores de carga y archivos rechazados deben indicar qué puede hacer la persona a continuación.

## 5. Calidad mínima para lanzar

- Interfaz adaptable a móvil y escritorio, navegación completa con teclado, foco visible, controles etiquetados y texto legible.
- Búsqueda, publicación, moderación, muestra y contacto probados de extremo a extremo con datos reales de prueba.
- Sesiones seguras, permisos comprobados en servidor, validación de entradas, límites de carga y protección básica contra abuso. Sin secretos ni contraseñas en el frontend o los registros.
- Almacenamiento y base de datos con copias de seguridad y una restauración ensayada antes de admitir usuarios reales.
- Eventos mínimos para medir búsquedas, fichas abiertas, muestras vistas, contactos iniciados y publicaciones aprobadas, sin registrar contenido del PDF ni mensajes privados.
- Compilación, lint y pruebas relevantes pasan antes de desplegar. No se publica la demo con autenticación simulada como si fuera un servicio real.

## 6. Fuera del MVP

Pagos dentro de la plataforma, entrega del apunte completo, suscripciones, chat interno, calificaciones y reseñas, recomendaciones personalizadas, métricas de vendedor no medidas, DRM, watermark forense, control de dispositivos, aplicación nativa y lectura offline de muestras. Las pantallas heredadas de esas funciones deben ocultarse o ajustarse antes del lanzamiento si generan expectativas falsas.

## 7. Estado actual del repositorio

| Área | Hoy | Necesario para el MVP |
| --- | --- | --- |
| Inicio y navegación | Interfaz navegable y responsive. | Conectar selección y materias al catálogo real. |
| Resultados y fichas | Datos fijos; algunas fichas, filtros y resultados no coinciden entre sí. | Un único origen de datos, búsqueda y filtros funcionales. |
| Vista previa | Visor de demostración con cinco páginas. | Generar y servir la muestra de cada publicación real. |
| Publicación | Formulario visual que inspecciona el PDF en el navegador. | Guardado, validación en servidor, estados y moderación. |
| Cuenta, favoritos y consultas | Autenticación de demo, favoritos locales y conversaciones simuladas. | Cuenta real para vendedores; mantener favoritos locales y retirar las consultas ficticias. |
| Administración y API | Hay piezas técnicas de la antigua plataforma por suscripción. | Adaptar modelo de datos, permisos, endpoints y panel a publicaciones y reportes. |

## 8. Orden de construcción y aceptación

1. **Datos y contratos:** definir cuentas, publicaciones, muestras, estados y reportes; alinear API y base de datos con este producto.
2. **Catálogo real:** búsqueda, filtros y ficha usando las mismas publicaciones; eliminar datos y acciones ficticias.
3. **Vendedor:** registro, formulario persistente, carga de muestra y gestión de estados.
4. **Moderación:** cola de revisión, aprobación o rechazo, reportes y ocultamiento.
5. **Cierre del recorrido:** visor de la muestra real, contacto externo, pruebas completas y despliegue controlado.

El MVP se considera listo cuando una publicación nueva recorre esos cinco pasos en un entorno de prueba sin editar datos a mano; una publicación rechazada o pausada deja de aparecer; las fichas y filtros muestran información coherente; y el recorrido puede completarse desde un teléfono.

## 9. Decisiones a validar antes de abrir al público

- Universidades y países iniciales; el formulario actual usa ARS y WhatsApp de Argentina.
- Quién modera, en cuánto tiempo y con qué criterios se rechaza una muestra.
- Política de contenido permitido, retiro por derechos de autor y tratamiento de reportes.
- Plazo de conservación de muestras, datos de contacto y registros de moderación.

Estas decisiones no impiden construir el ciclo principal, pero deben cerrarse antes de admitir publicaciones reales.
