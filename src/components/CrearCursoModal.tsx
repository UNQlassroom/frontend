import { useState } from "react";
import { COMISIONES, SEMESTRES } from "@/lib";
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
      className="fixed inset-0 z-50 grid place-items-center bg-background/60 p-4"
      onClick={handleClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-line bg-panel2 p-6 shadow-md"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Nueva ficha
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
              Crear curso
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md px-2 py-1 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Cerrar
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="materia"
              className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-muted-foreground"
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
              className="w-full rounded-lg border border-line bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="comision"
                className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-muted-foreground"
              >
                Comisión
              </label>
              <select
                id="comision"
                value={comision}
                disabled={isLoading}
                onChange={(e) => setComision(e.target.value)}
                className="w-full rounded-lg border border-line bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                {COMISIONES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="semestre"
                className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-muted-foreground"
              >
                Semestre
              </label>
              <select
                id="semestre"
                value={semestre}
                disabled={isLoading}
                onChange={(e) => setSemestre(e.target.value)}
                className="w-full rounded-lg border border-line bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                {SEMESTRES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {displayError && (
            <p className="text-xs text-destructive font-mono">{displayError}</p>
          )}
        </div>

        <div className="mt-7 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-lg px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground cursor-pointer disabled:opacity-60"
          >
            {isLoading ? "Creando..." : "Crear"}
          </button>
        </div>
      </form>
    </div>
  );
}
