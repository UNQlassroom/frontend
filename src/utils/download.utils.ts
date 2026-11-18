/**
 * Dispara la descarga de un Blob en el navegador creando un elemento <a> temporal.
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Extrae el nombre de archivo del encabezado Content-Disposition si está disponible.
 * Soporta formato RFC 5987 (filename*=utf-8''...) y estándar (filename="...").
 */
export const getFilenameFromContentDisposition = (
  contentDisposition?: string,
  fallbackFilename = "curso_unqlassroom.xlsx"
): string => {
  if (!contentDisposition) return fallbackFilename;

  // 1. Caso RFC 5987: filename*=UTF-8''...
  const filenameStarMatch = contentDisposition.match(/filename\*=utf-8''([^;]+)/i);
  if (filenameStarMatch && filenameStarMatch[1]) {
    try {
      return decodeURIComponent(filenameStarMatch[1]);
    } catch {
      return filenameStarMatch[1];
    }
  }

  // 2. Caso estándar: filename="algo.xlsx" o filename=algo.xlsx
  const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
  if (filenameMatch && filenameMatch[1]) {
    return filenameMatch[1].replace(/['"]/g, "").trim();
  }

  return fallbackFilename;
};
