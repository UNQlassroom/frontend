import { useEffect } from "react";
import { useAlumnos } from "@/hooks";
import type { CursoResponseDTO } from "@/types";
import githubIcon from "@/assets/github_favicon.svg";
import { getGitHubTeamUrl } from "@/lib";

interface VerAlumnosModalProps {
  open: boolean;
  onClose: () => void;
  curso: CursoResponseDTO;
}

export function VerAlumnosModal({ open, onClose, curso }: VerAlumnosModalProps) {
  const { alumnosData, isLoading, error, cargarAlumnos, limpiar } = useAlumnos();

  useEffect(() => {
    if (open) {
      cargarAlumnos(curso.id);
    } else {
      limpiar();
    }
  }, [open, curso.id, cargarAlumnos, limpiar]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/60 backdrop-blur-[2px] p-4"
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-line bg-panel2 p-6 shadow-xl flex flex-col max-h-[85vh] animate-rise"
      >
        <div className="flex items-start justify-between pb-4 border-b border-line">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Alumnos inscriptos
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
              {curso.materia}
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
        </div>

        {/* Lista de Alumnos */}
        <div className="py-4 flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="font-mono text-xs text-muted-foreground">
                Cargando alumnos del curso...
              </p>
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-center">
              <p className="font-mono text-xs text-destructive mb-3">{error}</p>
              <button
                type="button"
                onClick={() => cargarAlumnos(curso.id)}
                className="rounded-lg bg-destructive px-3.5 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer"
              >
                Reintentar
              </button>
            </div>
          )}

          {!isLoading && !error && alumnosData && (
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="font-mono text-xs text-muted-foreground">
                  Total: {alumnosData.alumnos.length} {alumnosData.alumnos.length === 1 ? "alumno" : "alumnos"}
                </span>
              </div>

              {alumnosData.alumnos.length === 0 ? (
                <div className="rounded-xl border border-line bg-panel p-8 text-center">
                  <p className="font-mono text-xs text-muted-foreground">
                    No hay alumnos inscriptos en este curso todavía.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {alumnosData.alumnos.map((alumno) => (
                    <div
                      key={alumno.username}
                      className="flex items-center justify-between rounded-xl border border-line bg-panel p-3 hover:border-foreground/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://github.com/${alumno.username}.png?size=64`}
                          alt={alumno.username}
                          className="w-8 h-8 rounded-full border border-line bg-line/20 object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div>
                          <a
                            href={`https://github.com/${alumno.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-sm font-semibold text-foreground hover:underline"
                          >
                            @{alumno.username}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="rounded-md border border-line bg-panel2 px-2 py-0.5 text-muted-foreground">
                          {alumno.role}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium ${
                            alumno.state === "active"
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              alumno.state === "active" ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          />
                          {alumno.state}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-line flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-line bg-panel px-4 py-2 text-xs font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
