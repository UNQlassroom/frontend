import { useState } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (err: unknown) {
      console.error("Error al calificar la asignación:", err);
      if (typeof err === "object" && err !== null && "response" in err) {
        const apiErr = err as {
          response?: { data?: { message?: string } };
        };
        setError(apiErr.response?.data?.message || "Error al registrar la calificación.");
      } else {
        setError("Error de conexión al calificar la asignación.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const esEntregada = Boolean(grupo.entregada || grupo.fechaEntregada);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/60 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-lg rounded-2xl border border-line bg-panel2 p-6 shadow-xl flex flex-col animate-rise">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-line">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Calificación Docente
            </p>
            <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground">
              {asignacionTitulo}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold text-primary">
                {grupo.nombre || (grupo.integrantes.length === 1 ? `@${grupo.integrantes[0]}` : "Grupo")}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-line/40 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Info adicional del grupo: Entrega y Repositorio */}
        <div className="mt-4 p-3 rounded-xl border border-line bg-panel flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Estado de entrega:</span>
            {esEntregada ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <span>Entregado</span>
                {grupo.fechaEntregada && (
                  <span className="text-muted-foreground font-normal ml-1">
                    ({new Date(grupo.fechaEntregada).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })})
                  </span>
                )}
              </span>
            ) : (
              <span className="inline-flex items-center text-amber-600 text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Sin entregar
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {grupo.releaseUrl && (
              <a
                href={grupo.releaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold"
              >
                <span>🏷️ Release ↗</span>
              </a>
            )}
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Calificación (1 a 10) */}
          <div>
            <label
              htmlFor="calificacion-nota"
              className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-muted-foreground"
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
                className="w-28 rounded-xl border border-line bg-panel px-3.5 py-2 font-mono text-base font-bold text-foreground outline-none focus:border-primary transition-colors text-center"
              />
            </div>
          </div>

          {/* Observaciones / Devolución */}
          <div>
            <label
              htmlFor="calificacion-observaciones"
              className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-muted-foreground"
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
              className="w-full rounded-xl border border-line bg-panel p-3 font-mono text-xs text-foreground outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3">
              <p className="font-mono text-xs text-destructive">{error}</p>
            </div>
          )}

          {/* Acciones */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg border border-line bg-panel px-4 py-2 font-mono text-xs font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || nota === ""}
              className="rounded-lg bg-primary px-5 py-2 font-mono text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
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
