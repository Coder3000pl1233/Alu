# M09 · Carga y procesamiento de documentos

## Implementado

- Adaptador S3 para un bucket privado Cloudflare R2, sin ACL ni generación de URL pública.
- Ruta administrativa multipart limitada a un PDF de 25 MiB.
- Validación por cabecera real `%PDF-`, independientemente del nombre o `Content-Type` enviado.
- Cuarentena con clave UUID, SHA-256 del original y hash del nombre original.
- Estados PostgreSQL y trabajos idempotentes con `pg-boss`.
- Rasterizador Poppler con timeout y máximo inicial de 500 páginas.
- Derivado maestro PNG privado y variantes WebP `normal`/`high`.
- SHA-256, dimensiones y bytes de cada página/variante.
- Publicación transaccional únicamente cuando existen exactamente tres variantes de todas las páginas.
- Limpieza de derivados parciales y estados `failed`/`rejected` sin `published_at`.

## Separación del sandbox

La conversión no obtiene credenciales R2. El coordinador descarga el original a un volumen temporal, ejecuta `rasterizer` y después carga los resultados. El sandbox definido en `compose.worker.yml` utiliza:

- `network_mode: none`;
- filesystem raíz de solo lectura;
- usuario 10001 sin privilegios;
- todas las capabilities eliminadas;
- `no-new-privileges`;
- 1 CPU, 768 MiB de memoria y 64 procesos;
- entrada montada read-only y salida separada.

## Configuración R2 obligatoria

1. Crear un bucket dedicado de originales/derivados.
2. Mantener desactivado acceso público y dominio `r2.dev`.
3. Crear credenciales limitadas al bucket, nunca un token global.
4. Configurar `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` y `R2_BUCKET` solo en backend/worker.
5. Ejecutar una prueba HTTP externa contra un objeto conocido y confirmar `401/403` o ausencia de ruta pública.

## Validación pendiente

Docker Desktop no está instalado actualmente. Por eso todavía falta:

- construir `worker/Dockerfile.sandbox`;
- confirmar que el contenedor no tiene red y respeta límites;
- procesar el PDF de ejemplo con Poppler;
- comparar páginas declaradas, salidas y hashes;
- conectar un bucket R2 real y comprobar que el original no es público.

M09 no debe cerrarse completamente hasta superar esas pruebas.
