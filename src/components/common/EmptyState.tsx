import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-line bg-panel p-12 text-center max-w-lg mx-auto my-6 animate-rise ${className}`}
    >
      {icon && (
        <div className="mx-auto w-12 h-12 rounded-xl bg-line/40 flex items-center justify-center text-xl mb-3 text-muted-foreground">
          {icon}
        </div>
      )}
      <h4 className="font-display text-lg font-bold text-foreground">
        {title}
      </h4>
      {description && (
        <p className="mt-1 font-mono text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
