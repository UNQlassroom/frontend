interface ConfirmarReentregaModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  asignacionTitulo: string;
  repoNombre?: string | null;
  fechaEntregadaPrevia?: string | null;
  fechaLimite?: string | null;
  isLoading?: boolean;
}

export function ConfirmarReentregaModal({
  open,
  onClose,
  onConfirm,
  asignacionTitulo,
  repoNombre,
  fechaEntregadaPrevia,
  fechaLimite,
  isLoading = false,
}: ConfirmarReentregaModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/60 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-lg rounded-2xl border border-line bg-panel2 p-6 shadow-xl flex flex-col animate-rise">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-line">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400 font-semibold">
              Reentrega de Asignación
            </p>
            <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground">
              {asignacionTitulo}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-line/40 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Mensaje descriptivo */}
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 text-xs font-mono space-y-2">
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-semibold text-[13px]">
              <span>ℹ️</span>
              <span>¿Querés volver a entregar este trabajo?</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Al confirmar la reentrega, se creará un nuevo release en el repositorio correspondiente, reemplazando la entrega anterior.
            </p>
          </div>

          {/* Información contextual del trabajo */}
          <div className="rounded-xl border border-line bg-panel p-3.5 space-y-2.5 font-mono text-xs">
            {repoNombre && (
              <div className="flex items-center justify-between gap-3 min-w-0">
                <span className="text-muted-foreground shrink-0">Repositorio:</span>
                <span
                  className="font-semibold text-foreground truncate text-right max-w-[260px] sm:max-w-[320px]"
                  title={repoNombre}
                >
                  {repoNombre}
                </span>
              </div>
            )}
            {fechaEntregadaPrevia && (
              <div className="flex items-center justify-between gap-3 min-w-0">
                <span className="text-muted-foreground shrink-0">Última entrega registrada:</span>
                <span className="text-foreground text-right shrink-0">{fechaEntregadaPrevia}</span>
              </div>
            )}
            {fechaLimite && (
              <div className="flex items-center justify-between gap-3 min-w-0">
                <span className="text-muted-foreground shrink-0">Fecha límite de entrega:</span>
                <span className="font-semibold text-foreground text-right shrink-0">{fechaLimite}</span>
              </div>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-6 pt-4 flex items-center justify-end gap-2.5 border-t border-line">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg border border-line bg-panel px-4 py-2 font-mono text-xs font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-lg bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 font-mono text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2 shadow-xs"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Reentregando...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                <span>Confirmar reentrega</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
