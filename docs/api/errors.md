# Catálogo de errores P0

Todas las respuestas de error usan `application/problem+json`, incluyen el mismo `request_id` en cuerpo y encabezado `X-Request-Id`, y nunca exponen stack traces, consultas, rutas internas, tokens ni datos de otros usuarios.

## Formato

```json
{
  "type": "https://api.aula.test/problems/access-expired",
  "title": "Tu acceso está vencido",
  "status": 403,
  "code": "ACCESS_EXPIRED",
  "request_id": "c4afcf04-9f75-41d0-b018-f338c4b22df5"
}
```

`title` es seguro para mostrar, pero el frontend utiliza `code` para mantener mensajes y acciones consistentes. `request_id` puede mostrarse como código de soporte.

## Códigos cerrados

| Código | HTTP habitual | Comportamiento del frontend |
| --- | --- | --- |
| `AUTH_INVALID_CREDENTIALS` | 401 | Mantener login y mostrar mensaje no enumerativo. |
| `AUTH_REQUIRED` | 401 | Enviar al login. |
| `SESSION_EXPIRED` | 401 | Informar vencimiento y enviar al login. |
| `SESSION_REVOKED` | 403 | Informar cierre y enviar al login. |
| `ACCESS_EXPIRED` | 403 | Mostrar acceso vencido y contacto administrativo. |
| `ACCOUNT_SUSPENDED` | 403 | Mostrar suspensión y contacto administrativo. |
| `ACCOUNT_REVOKED` | 403 | Mostrar revocación y contacto administrativo. |
| `ADMIN_REQUIRED` | 403 | Bloquear la acción y volver a una ruta permitida. |
| `RESOURCE_NOT_FOUND` | 404 | Mostrar contenido no disponible sin confirmar su existencia. |
| `VALIDATION_FAILED` | 422 | Asociar `errors[]` a los campos del formulario. |
| `RATE_LIMITED` | 429 | Respetar `Retry-After` y evitar reintento inmediato. |
| `IDEMPOTENCY_CONFLICT` | 409 | Recargar estado antes de repetir una mutación. |
| `RESOURCE_CONFLICT` | 409 | Actualizar datos y revisar el estado actual. |
| `BUSINESS_RULE_VIOLATION` | 400 | Explicar que la acción no está permitida. |
| `VIEWER_UNAVAILABLE` | 409 | Cerrar/pausar el visor y permitir reintento. |
| `PAYLOAD_TOO_LARGE` | 413 | Pedir un archivo menor. |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | Pedir un PDF válido. |
| `INTERNAL_ERROR` | 500 | Mensaje genérico, reintento y código de soporte. |

## Reglas de `request_id`

1. La API acepta opcionalmente `X-Request-Id` únicamente si es un UUID válido; de lo contrario genera uno nuevo.
2. El mismo identificador acompaña respuesta, logs, traza y eventos de auditoría de la solicitud.
3. El worker conserva el identificador de la operación que originó el trabajo y crea uno propio por intento.
4. El valor no contiene información del usuario y no concede acceso a ningún recurso.
5. Una respuesta inesperada se convierte en `INTERNAL_ERROR`; el detalle queda solo en logs redactados.

## Campos inválidos

`VALIDATION_FAILED` añade una lista `errors` con nombres públicos de campos y códigos estables. No incluye el valor recibido cuando pueda ser secreto, especialmente en `password`, cookies o tokens.
