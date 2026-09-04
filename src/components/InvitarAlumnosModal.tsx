import { useState } from "react";
import { agregarAlumnos } from "@/services";
import type { CursoResponseDTO } from "@/types";
import * as React from "react";
import {getGitHubTeamUrl} from "@/lib";
import githubIcon from "@/assets/github_favicon.svg";

interface InvitarAlumnosModalProps {
  open: boolean;
  onClose: () => void;
  curso: CursoResponseDTO;
  onSuccess?: () => void;
}

export function InvitarAlumnosModal({
  open,
  onClose,
  curso,
  onSuccess,
}: InvitarAlumnosModalProps) {
  const [usernames, setUsernames] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  if (!open) return null;

  const handleAddUsername = () => {
    const clean = inputValue.trim().replace(/^@/, "");
    if (!clean) return;

    if (usernames.includes(clean)) {
      setError(`El usuario @${clean} ya está en la lista.`);
      return;
    }

    setUsernames((prev) => [...prev, clean]);
    setInputValue("");
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddUsername();
    }
  };

  const handleRemove = (usernameToRemove: string) => {
    setUsernames((prev) => prev.filter((u) => u !== usernameToRemove));
    setError(null);
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const finalUsernames = [...usernames];
    const pending = inputValue.trim().replace(/^@/, "");
    if (pending && !finalUsernames.includes(pending)) {
      finalUsernames.push(pending);
      setUsernames(finalUsernames);
      setInputValue("");
    }

    if (finalUsernames.length === 0) {
      setError("Ingresá al menos un usuario de GitHub para invitar.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await agregarAlumnos(curso.id, { usernames: finalUsernames });
      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null) {
        const apiErr = err as {
          response?: {
            status?: number;
            data?: { message?: string };
          };
          message?: string;
        };

        const status = apiErr.response?.status;
        const serverMessage = apiErr.response?.data?.message || "";

        if (status === 404 || serverMessage.includes("404")) {
          setError(
              "Uno o más usuarios no fueron encontrados en GitHub. Verificá que estén bien escritos."
          );
        } else if (status === 422 || serverMessage.includes("422")) {
          setError(
              "Uno o más usuarios están bloqueados o no pueden ser invitados. Verificá que estén bien escritos y que no tengan restricciones."
          );
        } else {
          setError(
              apiErr.message === "Network Error"
                  ? "Error de conexión."
                  : "Ocurrió un error inesperado."
          );
        }

      } else {
        setError("Ocurrió un error inesperado al invitar a los alumnos.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUsernames([]);
    setInputValue("");
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/60 backdrop-blur-[2px] p-4"
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-line bg-panel2 p-6 shadow-xl flex flex-col animate-rise"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-line">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Gestión de equipo
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>Invitar alumnos</span>
            </h2>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              Comisión {curso.comision} · Semestre {curso.semestre} · Año {curso.anio}
            </p>
            {curso.githubTeamSlug && (
                <a
                    href={getGitHubTeamUrl(curso.githubTeamSlug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-line bg-panel px-2 py-0.5 font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <img src={githubIcon} alt="GitHub" className="w-3.5 h-3.5 opacity-80" />
                  <span>{curso.githubTeamSlug}</span>
                </a>
            )}
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
        {success ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">
                ¡Invitaciones enviadas!
              </h3>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                Se agregaron {usernames.length} alumno(s) al equipo de GitHub del curso.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
              >
                Listo
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="py-4 space-y-4">
            <div>
              <label
                htmlFor="github-username-input"
                className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-muted-foreground"
              >
                Usuarios de GitHub
              </label>

              {/* Área interactiva con burbujas e input */}
              <div className="min-h-[96px] w-full rounded-xl border border-line bg-background p-2.5 flex flex-wrap gap-2 items-start transition-colors">
                {usernames.map((u) => (
                  <span
                    key={u}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-xs font-medium text-foreground animate-rise"
                  >
                    <span>@{u}</span>
                    <button
                      type="button"
                      onClick={() => handleRemove(u)}
                      className="rounded-full hover:bg-foreground/10 p-0.5 text-muted-foreground hover:text-foreground cursor-pointer text-[10px] leading-none"
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </span>
                ))}

                <input
                  id="github-username-input"
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  placeholder={
                    usernames.length === 0
                      ? "Escribí un usuario y presioná Enter..."
                      : "Escribí otro y presioná Enter..."
                  }
                  className="flex-1 min-w-[200px] bg-transparent outline-none py-1 px-1 font-mono text-xs  placeholder:text-muted-foreground/60"
                />
              </div>

              <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                Presioná <kbd className="rounded border border-line px-1.5 py-0.5 bg-panel text-[10px]">Enter</kbd> luego de cada usuario para agregarlo como burbuja.
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                <p className="font-mono text-xs text-destructive">{error}</p>
              </div>
            )}

            {/* Footer con botones */}
            <div className="pt-3 border-t border-line flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground">
                {usernames.length} {usernames.length === 1 ? "alumno listo" : "alumnos listos"}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="rounded-lg px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading || (usernames.length === 0 && !inputValue.trim())}
                  className="rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? "Invitando..." : "Invitar alumnos"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

