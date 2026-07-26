const MAX_PDF_SIZE = 25 * 1024 * 1024;

export function validatePdfUpload(filename: string, size: number) {
  if (!filename.toLocaleLowerCase().endsWith(".pdf")) {
    return "Seleccioná un archivo PDF válido.";
  }
  if (size > MAX_PDF_SIZE) {
    return "El archivo supera el límite de 25 MB del MVP.";
  }
  return null;
}
