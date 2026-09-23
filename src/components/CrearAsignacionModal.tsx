import { useState } from "react";
import type { AsignacionDTO, CrearAsignacionFormData } from "@/types";

interface CrearAsignacionModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (asignacion: AsignacionDTO) => void;
}

export function CrearAsignacionModal({
  open,
  onClose,
  onCreate,
}: CrearAsignacionModalProps) {
  const [formData, setFormData] = useState<CrearAsignacionFormData>({
    titulo: "",
    descripcion: "",
    fechaEntrega: "",
    repoPlantilla: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setFormData({
      titulo: "",
      descripcion: "",
      fechaEntrega: "",
      repoPlantilla: "",
    });
    setError(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.titulo.trim()) {
      setError("El título del trabajo práctico es obligatorio.");
      return;
    }

    const nuevaAsignacion: AsignacionDTO = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Math.random()),
      titulo: formData.titulo.trim(),
      descripcion: formData.descripcion.trim() || "Consigna general del trabajo práctico.",
      fechaEntrega: formData.fechaEntrega || undefined,
      repoPlantilla: formData.repoPlantilla.trim() || undefined,
      estado: "activa",
      entregasCount: 0,
      totalAlumnos: 0,
    };

    onCreate(nuevaAsignacion);
    handleClose();
  };

  if (!open) return null;


  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/60 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-lg rounded-2xl border border-line bg-panel2 p-6 shadow-xl flex flex-col animate-rise">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-line">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Trabajos Prácticos
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
              Crear Asignación
            </h2>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              Configurá una nueva entrega o TP para el curso.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-line/40 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div>
            <label
              htmlFor="asignacion-titulo"
              className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-muted-foreground"
            >
              Título del trabajo práctico *
            </label>
            <input
              id="asignacion-titulo"
              type="text"
              required
              placeholder="Ej: TP 1 - Algoritmos y Estructuras"
              value={formData.titulo}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, titulo: e.target.value }));
                setError(null);
              }}
              className="w-full rounded-lg border border-line bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="asignacion-descripcion"
              className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-muted-foreground"
            >
              Descripción / Consignas
            </label>
            <textarea
              id="asignacion-descripcion"
              rows={3}
              placeholder="Describí los requerimientos y objetivos principales de la entrega..."
              value={formData.descripcion}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, descripcion: e.target.value }))
              }
              className="w-full rounded-lg border border-line bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="asignacion-repo"
                className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-muted-foreground"
              >
                Repo Plantilla (GitHub)
              </label>
              <input
                id="asignacion-repo"
                type="text"
                placeholder="org/repo-template"
                value={formData.repoPlantilla}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, repoPlantilla: e.target.value }))
                }
                className="w-full rounded-lg border border-line bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label
                htmlFor="asignacion-fecha"
                className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-muted-foreground"
              >
                Fecha límite de entrega
              </label>
              <input
                id="asignacion-fecha"
                type="date"
                value={formData.fechaEntrega}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, fechaEntrega: e.target.value }))
                }
                className="w-full rounded-lg border border-line bg-background px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
              <p className="font-mono text-xs text-destructive">{error}</p>
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-line flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
            >
              Guardar Asignación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
