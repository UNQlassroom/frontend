import type { EstadoCIInfo, EstadoEntrega } from "@/types";

/**
 * Obtiene la configuración de estilos, etiquetas e icono para el estado de CI.
 */
export function getEstadoCIInfo(estado?: string | null): EstadoCIInfo {
  switch (estado?.toLowerCase()) {
    case "success":
      return {
        label: "CI exitoso",
        badgeClass: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
        dotClass: "bg-emerald-500",
        type: "success",
      };
    case "failure":
      return {
        label: "CI fallido",
        badgeClass: "bg-rose-500/10 text-rose-600 border border-rose-500/20",
        dotClass: "bg-rose-500",
        type: "failure",
      };
    case "pending":
      return {
        label: "CI en ejecución",
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
 * Obtiene la configuración visual del badge para el estado de entrega de una asignación.
 */
export function getBadgeEstadoEntrega(estado: EstadoEntrega) {
  switch (estado) {
    case "corregido":
      return {
        label: "Corregido",
        classes: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
        dotColor: "bg-emerald-500",
      };
    case "entregado":
      return {
        label: "Entregado",
        classes: "bg-sky-500/10 text-sky-600 border border-sky-500/20",
        dotColor: "bg-sky-500",
      };
    case "pendiente":
    default:
      return {
        label: "Pendiente",
        classes: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
        dotColor: "bg-amber-500",
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
