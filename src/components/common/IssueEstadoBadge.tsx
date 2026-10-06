import type { EstadoIssue } from "@/types";

interface IssueEstadoBadgeProps {
  estado: EstadoIssue | string;
  className?: string;
  showIcon?: boolean;
}

export function IssueEstadoBadge({
  estado,
  className = "",
  showIcon = true,
}: IssueEstadoBadgeProps) {
  const estadoUpper = (estado || "").toUpperCase();

  switch (estadoUpper) {
    case "PENDIENTE":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-semibold bg-amber-100 text-amber-600 dark:text-amber-400 border border-amber-500/25 ${className}`}
          title="El alumno aún no ha enviado commits posteriores"
        >
          {showIcon && (
            <svg
              className="w-3.5 h-3.5 text-amber-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          )}
          <span>Pendiente</span>
        </span>
      );

    case "ACTUALIZADO":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/25 ${className}`}
          title="Se detectaron nuevos commits del alumno en el repositorio"
        >
          {showIcon && (
            <svg
              className="w-3.5 h-3.5 text-sky-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <line x1="1.05" y1="12" x2="7" y2="12" />
              <line x1="17.01" y1="12" x2="22.96" y2="12" />
            </svg>
          )}
          <span>Actualizado</span>
        </span>
      );

    case "RESUELTO":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 ${className}`}
          title="La corrección fue cerrada y resuelta"
        >
          {showIcon && (
            <svg
              className="w-3.5 h-3.5 text-emerald-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          )}
          <span>Resuelto</span>
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-xs font-medium bg-line/40 text-muted-foreground border border-line ${className}`}
        >
          <span>{estado}</span>
        </span>
      );
  }
}
