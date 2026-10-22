import { useState } from "react";
import { ErrorBanner } from "@/components/common";

export interface EliminarAsignacionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  asignacionTitulo: string;
  tipo?: "INDIVIDUAL" | "GRUPAL";
  totalGrupos?: number;
}

export function EliminarAsignacionModal({
  open,
  onClose,
  onConfirm,
  asignacionTitulo,
  tipo,
  totalGrupos = 0,
}: EliminarAsignacionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleClose = () => {
    if (isLoading) return;
    setError(null);
    onClose();
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onConfirm();
    } catch {
      // El interceptor global de Axios notifica el detalle mediante toast
      setError("No se pudo eliminar la asignación.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/60 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-xl rounded-2xl border border-destructive/30 bg-panel2 p-7 sm:p-8 shadow-xl flex flex-col animate-rise">
        {/* Encabezado */}
        <div className="flex items-start justify-between pb-4 border-b border-line">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-destructive font-semibold">
              Eliminar Asignación
            </p>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {asignacionTitulo}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-lg p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-line/40 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {error ? (
          <div className="mt-5">
            <ErrorBanner message={error} onRetry={handleConfirm} />
          </div>
        ) : (
          <>
            {/* Cuerpo del Modal */}
            <div className="mt-5 space-y-4">
              {/* Advertencia Destacada de Irreversibilidad y GitHub */}
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 sm:p-5 text-sm font-mono space-y-2.5">
                <div className="flex items-center gap-2 text-destructive font-semibold text-base">
                  <span>⚠️</span>
                  <span>Esta operación es irreversible</span>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  Al confirmar el borrado, se eliminará la asignación del sistema y se disparará la
                  eliminación de todos los repositorios asociados en GitHub de forma asincrónica.
                  Dejará de ser visible de inmediato tanto para el docente como para los alumnos.
                </p>
              </div>

              {/* Información contextual de la asignación */}
              <div className="rounded-xl border border-line bg-panel p-4 space-y-3 font-mono text-sm">
                <div className="flex items-center justify-between gap-3 min-w-0">
                  <span className="text-muted-foreground shrink-0">Tipo de asignación:</span>
                  <span className="font-semibold text-foreground">
                    {tipo === "GRUPAL" ? "Grupal" : "Individual"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 min-w-0">
                  <span className="text-muted-foreground shrink-0">Repositorios generados:</span>
                  <span className="font-semibold text-foreground">
                    {totalGrupos} {totalGrupos === 1 ? "repositorio" : "repositorios"} en GitHub
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="mt-6 pt-4 flex items-center justify-end gap-3 border-t border-line">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="rounded-xl border border-line bg-panel px-5 py-2.5 font-mono text-sm sm:text-base font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-destructive px-5 py-2.5 font-mono text-sm sm:text-base font-semibold text-white hover:bg-destructive/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                    </svg>
                    <span>Eliminar asignación</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
