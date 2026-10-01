import type { ReactNode } from "react";

interface PanelFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
  count?: number;
  countLabel?: string;
  extraActions?: ReactNode;
  className?: string;
}

export function PanelFilterBar({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  children,
  count,
  countLabel = "elementos",
  extraActions,
  className = "",
}: PanelFilterBarProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-panel p-4 rounded-xl border border-line ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2.5 flex-1">
        {/* Input de búsqueda */}
        <div className="relative min-w-[220px] flex-1 max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-line bg-background pl-9 pr-3 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Filtros adicionales (selects, botones, toggles) */}
        {children}
      </div>

      <div className="flex items-center gap-3">
        {count !== undefined && (
          <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
            {count} {countLabel}
          </span>
        )}
        {extraActions}
      </div>
    </div>
  );
}
