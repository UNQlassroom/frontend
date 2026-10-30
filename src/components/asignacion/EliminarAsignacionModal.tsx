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
      <div className="w-full max-w-lg rounded-2xl border border-destructive/30 bg-panel2 p-6 sm:p-7 shadow-xl flex flex-col animate-rise">
        {/* Encabezado */}
        <div className="flex items-start justify-between pb-4 border-b border-line">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-destructive font-semibold">
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
            {/* Cuerpo del Modal unificado y directo */}
            <div className="mt-5">
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  <span className="font-semibold text-destructive">
                    ⚠️ Acción irreversible:
                  </span>{" "}
                  Se eliminará la asignación y sus{" "}
                  <span className="font-semibold text-foreground">
                    {totalGrupos}{" "}
                    {totalGrupos === 1 ? "repositorio" : "repositorios"}
                  </span>{" "}
                  en GitHub de forma permanente.
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div className="mt-6 pt-4 flex items-center justify-end gap-3 border-t border-line">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="rounded-xl border border-line bg-panel px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-destructive px-5 py-2.5 text-sm font-semibold text-white hover:bg-destructive/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <span>Eliminar</span>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
