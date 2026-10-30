export interface ErrorBannerProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
  children?: React.ReactNode;
}

export function ErrorBanner({
  title,
  message,
  onRetry,
  retryText = "Reintentar",
  className = "",
  children,
}: ErrorBannerProps) {
  return (
    <div
      className={`rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center animate-rise ${className}`}
    >
      {title && (
        <h2 className="font-display text-xl font-bold text-foreground mb-2">
          {title}
        </h2>
      )}
      <p className="text-sm text-destructive mb-3 font-medium">
        {message}
      </p>
      {(onRetry || children) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          {children}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg bg-destructive px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              {retryText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
