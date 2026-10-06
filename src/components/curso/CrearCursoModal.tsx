import { useState } from "react";
import { COMISIONES, SEMESTRES } from "@/constants";
import type { CrearCursoFormData } from "@/types";
import * as React from "react";

interface CrearCursoModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: CrearCursoFormData) => void;
  isLoading?: boolean;
  serverError?: string | null;
}

export function CrearCursoModal({
  open,
  onClose,
  onCreate,
  isLoading = false,
  serverError = null,
}: CrearCursoModalProps) {
  const [materia, setMateria] = useState("");
  const [comision, setComision] = useState(COMISIONES[0]!);
  const [semestre, setSemestre] = useState(SEMESTRES[0]!);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!materia.trim()) {
      setError("Ingresá el nombre de la materia.");
      return;
    }
    onCreate({ materia: materia.trim(), comision, semestre });
  };

  const handleClose = () => {
    setMateria("");
    setError("");
    onClose();
  };

  const displayError = error || serverError;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/60 backdrop-blur-[2px] p-4"
      onClick={handleClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-2xl border border-line bg-panel2 p-7 sm:p-8 shadow-xl animate-rise"
      >
        <div className="flex items-start justify-between pb-4 border-b border-line">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">
              Nueva ficha
            </p>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Crear curso
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-line/40 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="materia"
              className="mb-2 block font-mono text-xs uppercase tracking-wider font-semibold text-muted-foreground"
            >
              Materia
            </label>
            <input
              id="materia"
              type="text"
              value={materia}
              disabled={isLoading}
              onChange={(e) => {
                setMateria(e.target.value);
                setError("");
              }}
              placeholder="Ej. Programación Funcional"
              className="w-full rounded-xl border border-line bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="comision"
                className="mb-2 block font-mono text-xs uppercase tracking-wider font-semibold text-muted-foreground"
              >
                Comisión
              </label>
              <select
                id="comision"
                value={comision}
                disabled={isLoading}
                onChange={(e) => setComision(e.target.value)}
                className="w-full rounded-xl border border-line bg-background px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none transition-colors"
              >
                {COMISIONES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="semestre"
                className="mb-2 block font-mono text-xs uppercase tracking-wider font-semibold text-muted-foreground"
              >
                Semestre
              </label>
              <select
                id="semestre"
                value={semestre}
                disabled={isLoading}
                onChange={(e) => setSemestre(e.target.value)}
                className="w-full rounded-xl border border-line bg-background px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none transition-colors"
              >
                {SEMESTRES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {displayError && (
            <p className="text-sm text-destructive font-mono">{displayError}</p>
          )}
        </div>

        <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-line">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-xl px-5 py-2.5 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-line/30 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-xl bg-primary px-7 py-2.5 text-base font-semibold text-primary-foreground cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {isLoading ? "Creando..." : "Crear"}
          </button>
        </div>
      </form>
    </div>
  );
}
