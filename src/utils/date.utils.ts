/**
 * Formatea una fecha ISO en tiempo relativo o fecha corta legible.
 */
export function formatearFechaCommit(fechaIso?: string | null): string {
  if (!fechaIso) return "";
  try {
    const date = new Date(fechaIso);
    if (isNaN(date.getTime())) return fechaIso;

    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "hace un momento";
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours} h`;
    if (diffDays === 1) return "ayer";
    if (diffDays < 7) return `hace ${diffDays} d`;

    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return fechaIso;
  }
}
