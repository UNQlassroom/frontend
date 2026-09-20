import { getEstadoCIInfo } from "@/lib";

interface CIStatusBadgeProps {
  estado?: string | null;
  className?: string;
  showIcon?: boolean;
}

export function CIStatusBadge({ estado, className = "", showIcon = true }: CIStatusBadgeProps) {
  const info = getEstadoCIInfo(estado);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium shrink-0 ${info.badgeClass} ${className}`}
      title={`Estado de CI: ${info.label}`}
    >
      {showIcon && (
        <>
          {info.type === "success" && (
            <svg className="w-3 h-3 shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {info.type === "failure" && (
            <svg className="w-3 h-3 shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {info.type === "pending" && (
            <svg
              className="w-3 h-3 shrink-0 animate-spin"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
            >
              <circle
                cx="8"
                cy="8"
                r="6"
                strokeWidth="2"
                strokeDasharray="14"
                strokeLinecap="round"
              />
            </svg>
          )}
          {info.type === "sin_ci" && (
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 shrink-0" />
          )}
        </>
      )}
      <span>{info.label}</span>
    </span>
  );
}
