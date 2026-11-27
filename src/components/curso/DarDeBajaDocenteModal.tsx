import type { DocenteResponseDTO } from "@/types";

export interface DarDeBajaDocenteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  docente: DocenteResponseDTO | null;
  esPropioUsuario?: boolean;
  isLoading?: boolean;
  error?: string | null;
}

export function DarDeBajaDocenteModal({
  open,
  onClose,
  onConfirm,
  docente,
  esPropioUsuario = false,
  isLoading = false,
  error = null,
}: DarDeBajaDocenteModalProps) {
  if (!open || !docente) return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[60] grid place-items-center bg-background/60 backdrop-blur-[2px] p-4"
    >
      <div className="w-full max-w-xl rounded-2xl border border-line bg-panel2 p-7 sm:p-8 shadow-xl flex flex-col animate-rise">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-line">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400 font-semibold">
              Baja de Docente
            </p>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {esPropioUsuario
                ? "Salir del equipo docente"
                : "Dar de baja del curso"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-line/40 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
            aria-label="Cerrar modal de confirmación"
          >
            ✕
          </button>
        </div>

        {/* Mensaje descriptivo */}
        <div className="mt-5 space-y-4">
          <p className="text-sm sm:text-base text-foreground leading-relaxed">
            {esPropioUsuario ? (
              <>
                ¿Estás seguro de que deseas darte de baja del equipo docente de
                este curso?
              </>
            ) : docente.nombreCompleto ? (
              <>
                ¿Estás seguro de que deseas dar de baja a{" "}
                <strong className="text-foreground font-semibold">
                  {docente.nombreCompleto}
                </strong>{" "}
                <span className="text-muted-foreground">
                  (@{docente.username})
                </span>
                ?
              </>
            ) : (
              <>
                ¿Estás seguro de que deseas dar de baja a{" "}
                <strong className="text-foreground font-semibold">
                  @{docente.username}
                </strong>
                ?
              </>
            )}
          </p>

          <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-4 sm:p-5 text-sm space-y-2">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-sm sm:text-base">
              <span>⚠️</span>
              <span>Consecuencias de la baja</span>
            </div>
            <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
              {esPropioUsuario
                ? "Perderás el acceso a la gestión de este curso (asignaciones, alumnos, entregas y correcciones) y serás redirigido a la pantalla principal."
                : "El docente perderá el acceso a la gestión del curso, sus asignaciones, alumnos y correcciones."}
            </p>
          </div>

          {error && (
            <div
              data-testid="baja-docente-error-message"
              className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 animate-rise"
            >
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}
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
            data-testid="confirmar-baja-docente-button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Dando de baja...</span>
              </>
            ) : (
              <span>Confirmar baja</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
