import { useState, type SubmitEvent } from "react";
import { toast } from "react-toastify";
import { modificarAsignacion } from "@/services";
import type {
  AsignacionResponseDTO,
  ModificarAsignacionRequestDTO,
} from "@/types";
import { resolveApiError } from "@/utils";

export interface ModificarAsignacionModalProps {
  open: boolean;
  onClose: () => void;
  cursoId: number;
  asignacion: AsignacionResponseDTO | null;
  onSuccess: (asignacionActualizada: AsignacionResponseDTO) => void;
}

interface ModificarAsignacionContentProps {
  onClose: () => void;
  cursoId: number;
  asignacion: AsignacionResponseDTO;
  onSuccess: (asignacionActualizada: AsignacionResponseDTO) => void;
}

function formatFechaInput(fechaIso?: string | null): string {
  if (!fechaIso) return "";
  if (fechaIso.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(fechaIso)) {
    return fechaIso.substring(0, 10);
  }
  const date = new Date(fechaIso);
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return "";
}

function ModificarAsignacionContent({
  onClose,
  cursoId,
  asignacion,
  onSuccess,
}: ModificarAsignacionContentProps) {
  const [descripcion, setDescripcion] = useState(asignacion.descripcion || "");
  const [fechaLimite, setFechaLimite] = useState(() =>
    formatFechaInput(asignacion.fechaLimite)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (isLoading) return;
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const fechaClean = fechaLimite.trim();
    if (!fechaClean) {
      setError("La fecha de entrega es obligatoria.");
      return;
    }

    setIsLoading(true);

    try {
      const payload: ModificarAsignacionRequestDTO = {
        descripcion: descripcion.trim() ? descripcion.trim() : null,
        fechaLimite: fechaClean ? `${fechaClean}T23:59:59` : null,
      };

      const response = await modificarAsignacion(
        cursoId,
        asignacion.id,
        payload
      );

      toast.success("La asignación fue modificada correctamente");
      onSuccess(response.data);
      onClose();
    } catch (err: unknown) {
      const resolved = resolveApiError(err);
      const errorMsg =
        resolved?.message ||
        "Ocurrió un error al modificar la asignación. Verificá los datos ingresados.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/60 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl border border-line bg-panel2 p-7 sm:p-8 shadow-xl flex flex-col animate-rise overflow-y-auto">
        {/* Encabezado */}
        <div className="flex items-start justify-between pb-4 border-b border-line">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">
              Modificar Asignación
            </p>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Editar Asignación
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

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Campo Título (Solo Lectura) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="modificar-titulo"
                className="font-mono text-xs uppercase tracking-wider font-semibold text-muted-foreground"
              >
                Título
              </label>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-muted-foreground/80 bg-line/30 px-2 py-0.5 rounded-md">
                <span>🔒</span>
                <span>Solo lectura</span>
              </span>
            </div>
            <input
              id="modificar-titulo"
              type="text"
              readOnly
              disabled
              value={asignacion.titulo}
              className="w-full rounded-xl border border-line bg-line/20 px-3.5 py-2.5 font-mono text-sm text-muted-foreground cursor-not-allowed select-none opacity-85"
            />
          </div>

          {/* Campos Tipo y Repositorio Template en dos columnas (Solo Lectura) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="modificar-tipo"
                  className="font-mono text-xs uppercase tracking-wider font-semibold text-muted-foreground"
                >
                  Tipo de asignación
                </label>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-muted-foreground/80 bg-line/30 px-2 py-0.5 rounded-md">
                  <span>🔒</span>
                  <span>Solo lectura</span>
                </span>
              </div>
              <input
                id="modificar-tipo"
                type="text"
                readOnly
                disabled
                value={asignacion.tipo === "GRUPAL" ? "Grupal" : "Individual"}
                className="w-full rounded-xl border border-line bg-line/20 px-3.5 py-2.5 font-mono text-sm text-muted-foreground cursor-not-allowed select-none opacity-85"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="modificar-template"
                  className="font-mono text-xs uppercase tracking-wider font-semibold text-muted-foreground"
                >
                  Repositorio Template
                </label>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-muted-foreground/80 bg-line/30 px-2 py-0.5 rounded-md">
                  <span>🔒</span>
                  <span>Solo lectura</span>
                </span>
              </div>
              <input
                id="modificar-template"
                type="text"
                readOnly
                disabled
                value={asignacion.templateRepoName}
                className="w-full rounded-xl border border-line bg-line/20 px-3.5 py-2.5 font-mono text-sm text-muted-foreground cursor-not-allowed select-none opacity-85 truncate"
              />
            </div>
          </div>

          {/* Campo Fecha Límite de Entrega (Modificable, mismo input y comportamiento que Crear Asignación) */}
          <div>
            <label
              htmlFor="modificar-fecha"
              className="mb-2 block font-mono text-xs uppercase tracking-wider font-semibold text-muted-foreground"
            >
              Fecha límite de entrega
            </label>
            <input
              id="modificar-fecha"
              type="date"
              required
              disabled={isLoading}
              value={fechaLimite}
              onChange={(e) => {
                setFechaLimite(e.target.value);
                setError(null);
              }}
              className="w-full rounded-xl border border-line bg-background px-3.5 py-2.5 font-mono text-sm sm:text-base text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* Campo Descripción (Modificable) */}
          <div>
            <label
              htmlFor="modificar-descripcion"
              className="mb-2 block font-mono text-xs uppercase tracking-wider font-semibold text-muted-foreground"
            >
              Descripción
            </label>
            <textarea
              id="modificar-descripcion"
              rows={4}
              disabled={isLoading}
              value={descripcion}
              onChange={(e) => {
                setDescripcion(e.target.value);
                setError(null);
              }}
              placeholder="Instrucciones, pautas o consignas del trabajo práctico..."
              className="w-full rounded-xl border border-line bg-background px-3.5 py-2.5 font-mono text-sm sm:text-base text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 resize-y"
            />
          </div>

          {/* Mensaje de Error si la petición falla */}
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 animate-rise">
              <p className="font-mono text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="pt-4 border-t border-line flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="rounded-xl px-5 py-2.5 text-sm sm:text-base font-medium text-muted-foreground hover:text-foreground hover:bg-line/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm sm:text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              )}
              <span>{isLoading ? "Guardando cambios..." : "Guardar cambios"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ModificarAsignacionModal({
  open,
  onClose,
  cursoId,
  asignacion,
  onSuccess,
}: ModificarAsignacionModalProps) {
  if (!open || !asignacion) return null;

  return (
    <ModificarAsignacionContent
      onClose={onClose}
      cursoId={cursoId}
      asignacion={asignacion}
      onSuccess={onSuccess}
    />
  );
}
