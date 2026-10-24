import type { EstadoAsignacion } from "@/types";

interface EstadoAsignacionBadgeProps {
  estado?: EstadoAsignacion | string | null;
  className?: string;
  showIcon?: boolean;
}

export function EstadoAsignacionBadge({
  estado,
  className = "",
  showIcon = true,
}: EstadoAsignacionBadgeProps) {
  const estadoUpper = (estado || "LISTA").toUpperCase();

  switch (estadoUpper) {
    case "CREANDO":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 font-mono text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 ${className}`}
          title="La asignación fue creada y sus repositorios se están generando en GitHub en segundo plano"
        >
          {showIcon && (
            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
          )}
          <span>Creando repositorios...</span>
        </span>
      );

    case "ERROR":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 font-mono text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/25 ${className}`}
          title="Ocurrió un error al crear los repositorios en GitHub"
        >
          {showIcon && (
            <svg
              className="w-3.5 h-3.5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
          <span>Error al crear repos</span>
        </span>
      );

    case "LISTA":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 font-mono text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 ${className}`}
          title="Todos los repositorios de esta asignación fueron creados correctamente en GitHub"
        >
          {showIcon && (
            <svg
              className="w-3.5 h-3.5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          <span>Repositorios listos</span>
        </span>
      );
  }
}
