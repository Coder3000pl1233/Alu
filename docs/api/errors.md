# Errores de la API del marketplace

Las rutas del marketplace y la cuenta responden con `application/problem+json` ante errores. Cada respuesta incluye `type`, `title`, `status`, `code` y `request_id`.

| Código | HTTP | Uso |
| --- | ---: | --- |
| `AUTH_REQUIRED` | 401 | Falta una sesión para consultar publicaciones propias o administrativas. |
| `ADMIN_REQUIRED` | 403 | Una cuenta no administradora intenta la consulta administrativa. |
| `ACCOUNT_SUSPENDED` / `ACCOUNT_REVOKED` | 403 | La cuenta autenticada no puede usar rutas privadas. |
| `RESOURCE_NOT_FOUND` | 404 | La publicación no existe, no es pública o no pertenece a la cuenta. |
| `VALIDATION_FAILED` | 400 | Un parámetro de ruta o consulta no cumple el contrato. |
| `TOKEN_INVALID` | 400 | Un enlace de verificación o recuperación venció o ya se usó. |
| `AUTH_INVALID_CREDENTIALS` | 401 | Correo o contraseña incorrectos, sin indicar cuál falló. |

Una consulta privada de una publicación ajena devuelve 404 para no revelar su existencia. No se incluyen contraseñas, cookies, números de contacto ni datos recibidos en los registros de errores.
