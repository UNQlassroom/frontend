import type { EstadoCIInfo } from "@/types";

/**
 * Obtiene la configuración de estilos, etiquetas e icono para el estado de CI.
 */
export function getEstadoCIInfo(estado?: string | null): EstadoCIInfo {
  switch (estado?.toLowerCase()) {
    case "success":
      return {
        label: "CI passing",
        badgeClass: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
        dotClass: "bg-emerald-500",
        type: "success",
      };
    case "failure":
      return {
        label: "CI failing",
        badgeClass: "bg-rose-500/10 text-rose-600 border border-rose-500/20",
        dotClass: "bg-rose-500",
        type: "failure",
      };
    case "pending":
      return {
        label: "CI pending",
        badgeClass: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
        dotClass: "bg-amber-500",
        type: "pending",
      };
    case "sin_ci":
    default:
      return {
        label: "Sin CI",
        badgeClass: "bg-line/40 text-muted-foreground border border-line",
        dotClass: "bg-muted-foreground/60",
        type: "sin_ci",
      };
  }
}

/**
 * Extrae la primera línea del mensaje del commit.
 */
export function obtenerPrimerLineaCommit(mensaje?: string | null): string {
  if (!mensaje) return "";
  const primeraLinea = mensaje.split("\n")[0].trim();
  return primeraLinea;
}
