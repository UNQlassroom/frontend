import type { ReactNode } from "react";

export type KpiVariant =
  | "default"
  | "neutral"
  | "amber"
  | "emerald"
  | "rose"
  | "sky"
  | "indigo";

interface KpiCardProps {
  label: string;
  value: number | string;
  unit?: string;
  subtext?: string;
  icon?: ReactNode;
  variant?: KpiVariant;
  isSelected?: boolean;
  onClick?: () => void;
  title?: string;
  className?: string;
}

const variantStyles: Record<
  KpiVariant,
  {
    selected: string;
    unselected: string;
    labelColor: string;
    valueColor: string;
    subtextColor: string;
    dotColor: string;
  }
> = {
  default: {
    selected:
      "border-primary ring-2 ring-primary/30 bg-panel shadow-sm dark:border-indigo-500 dark:ring-indigo-500/40 dark:bg-indigo-500/10",
    unselected:
      "border-line bg-panel hover:border-foreground/30 dark:border-indigo-500/20 dark:bg-indigo-500/5 dark:hover:border-indigo-500/40",
    labelColor: "text-muted-foreground dark:text-indigo-300",
    valueColor: "text-foreground dark:text-indigo-400",
    subtextColor: "text-muted-foreground dark:text-indigo-300/80",
    dotColor: "bg-primary dark:bg-indigo-500",
  },
  indigo: {
    selected: "border-indigo-500 ring-2 ring-indigo-500/40 bg-indigo-500/10 shadow-sm",
    unselected: "border-indigo-500/20 bg-indigo-500/5 hover:border-indigo-500/40",
    labelColor: "text-indigo-700 dark:text-indigo-300",
    valueColor: "text-indigo-600 dark:text-indigo-400",
    subtextColor: "text-indigo-700/80 dark:text-indigo-300/80",
    dotColor: "bg-indigo-500",
  },
  neutral: {
    selected: "border-neutral-500 ring-2 ring-neutral-500/40 bg-neutral-500/10 shadow-sm",
    unselected: "border-neutral-500/20 bg-neutral-500/5 hover:border-neutral-500/40",
    labelColor: "text-neutral-700 dark:text-neutral-300",
    valueColor: "text-neutral-800 dark:text-neutral-200",
    subtextColor: "text-neutral-600 dark:text-neutral-400",
    dotColor: "bg-neutral-400 dark:bg-neutral-500",
  },
  amber: {
    selected: "border-amber-500 ring-2 ring-amber-500/40 bg-amber-500/10 shadow-sm",
    unselected: "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40",
    labelColor: "text-amber-700 dark:text-amber-300",
    valueColor: "text-amber-600 dark:text-amber-400",
    subtextColor: "text-amber-700/80 dark:text-amber-300/80",
    dotColor: "bg-amber-500",
  },
  emerald: {
    selected: "border-emerald-500 ring-2 ring-emerald-500/40 bg-emerald-500/10 shadow-sm",
    unselected: "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40",
    labelColor: "text-emerald-700 dark:text-emerald-300",
    valueColor: "text-emerald-600 dark:text-emerald-400",
    subtextColor: "text-emerald-700/80 dark:text-emerald-300/80",
    dotColor: "bg-emerald-500",
  },
  rose: {
    selected: "border-rose-500 ring-2 ring-rose-500/40 bg-rose-500/10 shadow-sm",
    unselected: "border-rose-500/20 bg-rose-500/5 hover:border-rose-500/40",
    labelColor: "text-rose-700 dark:text-rose-300",
    valueColor: "text-rose-600 dark:text-rose-400",
    subtextColor: "text-rose-700/80 dark:text-rose-300/80",
    dotColor: "bg-rose-500",
  },
  sky: {
    selected: "border-sky-500 ring-2 ring-sky-500/40 bg-sky-500/10 shadow-sm",
    unselected: "border-sky-500/20 bg-sky-500/5 hover:border-sky-500/40",
    labelColor: "text-sky-700 dark:text-sky-300",
    valueColor: "text-sky-600 dark:text-sky-400",
    subtextColor: "text-sky-700/80 dark:text-sky-300/80",
    dotColor: "bg-sky-500",
  },
};

export function KpiCard({
  label,
  value,
  unit,
  subtext,
  icon,
  variant = "default",
  isSelected = false,
  onClick,
  title,
  className = "",
}: KpiCardProps) {
  const styles = variantStyles[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`rounded-xl border p-4 sm:p-4.5 shadow-xs text-left transition-all duration-150 ${
        onClick
          ? "cursor-pointer hover:scale-[1.02] hover:shadow-md"
          : "cursor-default"
      } ${isSelected ? styles.selected : styles.unselected} ${className}`}
      title={title}
    >
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span
          className={`text-[11px] sm:text-xs uppercase tracking-wide font-semibold ${styles.labelColor}`}
        >
          {label}
        </span>
        {icon !== undefined ? (
          icon
        ) : (
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${styles.dotColor}`} />
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-2">
        <span className={`font-suez text-3xl sm:text-4xl font-bold ${styles.valueColor}`}>
          {value}
        </span>
        {unit && (
          <span className="text-sm text-muted-foreground">{unit}</span>
        )}
      </div>

      <p className={`mt-1.5 text-xs sm:text-sm truncate ${styles.subtextColor}`}>
        {subtext || <span className="invisible select-none">&nbsp;</span>}
      </p>
    </button>
  );
}
