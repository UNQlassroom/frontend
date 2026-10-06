import type { ReactNode } from "react";

interface PanelHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PanelHeader({
  title,
  description,
  actions,
  className = "",
}: PanelHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-panel p-6 rounded-2xl border border-line shadow-xs ${className}`}
    >
      <div>
        <h3 className="font-display text-xl font-bold text-foreground">
          {title}
        </h3>
        {description && (
          <p className="font-mono text-sm text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
