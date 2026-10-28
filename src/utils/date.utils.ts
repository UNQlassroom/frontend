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

/**
 * Formatea una fecha ISO a formato legible dd/mm/yyyy hh:mm (es-AR).
 */
export function formatFechaLegible(isoDate?: string | null): string | null {
  if (!isoDate) return null;
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return isoDate;
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoDate;
  }
}

/**
 * Evalúa si una fecha límite ya venció considerando hasta las 23:59:59.999 del día límite en hora local
 * cuando viene en formato YYYY-MM-DD.
 */
export function esFechaLimiteVencida(fechaLimite?: string | null): boolean {
  if (!fechaLimite) return false;
  try {
    // Si viene solo como fecha YYYY-MM-DD, tomar el final del día en zona horaria local
    if (/^\d{4}-\d{2}-\d{2}$/.test(fechaLimite.trim())) {
      const [year, month, day] = fechaLimite.trim().split("-").map(Number);
      const finDelDia = new Date(year, month - 1, day, 23, 59, 59, 999);
      return Date.now() > finDelDia.getTime();
    }
    const date = new Date(fechaLimite);
    if (isNaN(date.getTime())) return false;
    return Date.now() > date.getTime();
  } catch {
    return false;
  }
}
