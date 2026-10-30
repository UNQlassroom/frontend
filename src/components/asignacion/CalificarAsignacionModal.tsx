import { useState, type SubmitEvent } from "react";
import { calificarAsignacion } from "@/services";
import type {
  AsignacionResponseDTO,
  GrupoAsignacionResponseDTO,
} from "@/types";

interface CalificarAsignacionModalProps {
  open: boolean;
  onClose: () => void;
  cursoId: number;
  asignacionId: number;
  asignacionTitulo: string;
  grupo: GrupoAsignacionResponseDTO | null;
  onSuccess: (asignacionActualizada: AsignacionResponseDTO) => void;
}

interface CalificarAsignacionContentProps {
  onClose: () => void;
  cursoId: number;
  asignacionId: number;
  asignacionTitulo: string;
  grupo: GrupoAsignacionResponseDTO;
  onSuccess: (asignacionActualizada: AsignacionResponseDTO) => void;
}

function CalificarAsignacionContent({
  onClose,
  cursoId,
  asignacionId,
  asignacionTitulo,
  grupo,
  onSuccess,
}: CalificarAsignacionContentProps) {
  const [nota, setNota] = useState<number | "">(grupo.calificacion ?? "");
  const [observaciones, setObservaciones] = useState(grupo.observaciones ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (nota === "" || isNaN(Number(nota))) {
      setError("La nota es obligatoria.");
      return;
    }

    const numNota = Number(nota);
    if (numNota < 1 || numNota > 10) {
      setError("La nota debe estar entre 1 y 10.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await calificarAsignacion(cursoId, asignacionId, {
        grupoId: grupo.id,
        calificacion: numNota,
        observaciones: observaciones.trim() ? observaciones.trim() : null,
      });

      onSuccess(response.data);
      onClose();
    } catch {
      // El interceptor global de Axios notifica el error mediante toast amigable
      setError("Error al calificar la asignación.");
    } finally {
      setIsLoading(false);
    }
  };

  const esEntregada = Boolean(grupo.entregada || grupo.fechaEntregada);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/60 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-line bg-panel2 p-7 sm:p-8 shadow-xl flex flex-col animate-rise">
        {/* Header con metadatos integrados */}
        <div className="flex items-start justify-between pb-4 border-b border-line gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">
              Calificación Docente
            </p>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {asignacionTitulo}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              <span className="font-semibold text-foreground">
                {grupo.nombre ||
                  (grupo.integrantes.length === 1
                    ? `@${grupo.integrantes[0]?.username}`
                    : "Grupo")}
              </span>

              <span className="text-muted-foreground/40">•</span>

              {esEntregada ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                  <span>Entregado</span>
                  {grupo.fechaEntregada && (
                    <span className="text-muted-foreground font-normal">
                      (
                      {new Date(grupo.fechaEntregada).toLocaleDateString(
                        "es-AR",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                      )
                    </span>
                  )}
                </span>
              ) : (
                <span className="inline-flex items-center text-amber-600 dark:text-amber-400 text-xs bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20 font-semibold">
                  Sin entregar
                </span>
              )}

              {grupo.releaseUrl && (
                <>
                  <span className="text-muted-foreground/40">•</span>
                  <a
                    href={grupo.releaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:underline"
                  >
                    <span>🏷️ Release ↗</span>
                  </a>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-line/40 transition-colors cursor-pointer shrink-0"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Calificación (1 a 10) */}
          <div>
            <label
              htmlFor="calificacion-nota"
              className="mb-2 block text-xs uppercase tracking-wider font-semibold text-muted-foreground"
            >
              Nota (1 a 10) *
            </label>
            <div className="flex items-center gap-3">
              <input
                id="calificacion-nota"
                type="number"
                min="1"
                max="10"
                step="1"
                required
                disabled={isLoading}
                placeholder="Ej: 8"
                value={nota}
                onChange={(e) => {
                  const val = e.target.value;
                  setNota(val === "" ? "" : Number(val));
                  setError(null);
                }}
                className="w-32 rounded-xl border border-line bg-panel px-4 py-2.5 text-xl font-bold text-foreground outline-none focus:border-primary transition-colors text-center"
              />
            </div>
          </div>

          {/* Observaciones / Devolución */}
          <div>
            <label
              htmlFor="calificacion-observaciones"
              className="mb-2 block text-xs uppercase tracking-wider font-semibold text-muted-foreground"
            >
              Observaciones / Devolución (opcional)
            </label>
            <textarea
              id="calificacion-observaciones"
              rows={4}
              disabled={isLoading}
              placeholder="Escribí comentarios sobre la corrección, aspectos a mejorar o puntos destacados..."
              value={observaciones}
              onChange={(e) => {
                setObservaciones(e.target.value);
                setError(null);
              }}
              className="w-full rounded-xl border border-line bg-panel p-4 text-sm sm:text-base text-foreground outline-none focus:border-primary transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Error de validación local */}
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Acciones */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl border border-line bg-panel px-5 py-2.5 text-sm sm:text-base font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || nota === ""}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm sm:text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Guardar calificación</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CalificarAsignacionModal({
  open,
  grupo,
  ...props
}: CalificarAsignacionModalProps) {
  if (!open || !grupo) return null;

  return (
    <CalificarAsignacionContent
      key={`${props.asignacionId}-${grupo.id}`}
      grupo={grupo}
      {...props}
    />
  );
}
