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
 * Formatea una fecha ISO a formato legible dd/mm/aaaa hh:mm (es-AR).
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
 * Formatea una fecha ISO a formato fecha corta dd/mm/aaaa (es-AR).
 */
export function formatFechaCorta(isoDate?: string | null): string | null {
  if (!isoDate) return null;
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return isoDate;
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
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

/**
 * Formatea el texto mientras el usuario escribe una fecha, insertando barras automáticamente (DD/MM/AAAA).
 */
export function formatearInputFecha(valor: string, valorAnterior: string = ""): string {
  if (valor.length < valorAnterior.length) {
    return valor;
  }
  const digits = valor.replace(/\D/g, "").slice(0, 8);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return valor.endsWith("/") ? `${digits}/` : digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${valor.endsWith("/") ? `${digits.slice(2)}/` : digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/**
 * Convierte una fecha en formato DD/MM/AAAA a formato ISO YYYY-MM-DD.
 * Valida que los días, meses y años sean coherentes (incluyendo años bisiestos).
 * Retorna null si la fecha no es válida.
 */
export function fechaDDMMAAAAHaciaISO(fecha: string): string | null {
  const match = fecha.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2100) return null;
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    return null;
  }
  return `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/**
 * Convierte una fecha en formato ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss) a formato legible DD/MM/AAAA para el input.
 */
export function fechaISOHaciaDDMMAAAA(fechaIso?: string | null): string {
  if (!fechaIso) return "";
  const [fecha] = fechaIso.split("T");
  if (!fecha) return "";
  const parts = fecha.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return "";
}
