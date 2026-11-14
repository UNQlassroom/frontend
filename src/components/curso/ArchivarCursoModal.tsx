import type { CursoResponseDTO } from "@/types";

export interface ArchivarCursoModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  curso: CursoResponseDTO;
  isLoading?: boolean;
}

export function ArchivarCursoModal({
  open,
  onClose,
  onConfirm,
  curso,
  isLoading = false,
}: ArchivarCursoModalProps) {
  if (!open) return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 grid place-items-center bg-background/60 backdrop-blur-[2px] p-4"
    >
      <div className="w-full max-w-xl rounded-2xl border border-line bg-panel2 p-7 sm:p-8 shadow-xl flex flex-col animate-rise">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-line">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400 font-semibold">
              Archivado de Curso
            </p>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {curso.materia}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Comisión {curso.comision} · Semestre {curso.semestre} · Año {curso.anio}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-line/40 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Mensaje descriptivo */}
        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 sm:p-5 text-sm space-y-2.5">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-base">
              <span>⚠️</span>
              <span>¿Querés archivar este curso?</span>
            </div>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Los repositorios en GitHub pasarán a <strong className="text-foreground font-semibold">solo lectura</strong> y el curso dejará de aparecer en la pantalla principal. Esta acción no se puede deshacer, pero podrás seguir consultándolo en <strong className="text-foreground font-semibold">Cursos Archivados</strong>.
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-6 pt-4 flex items-center justify-end gap-3 border-t border-line">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-line bg-panel px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Archivando...</span>
              </>
            ) : (
              <span>Archivar</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
