import { useEffect } from "react";
import { useAlumnos } from "@/hooks";
import type { CursoResponseDTO } from "@/types";
import githubIcon from "@/assets/github_favicon.svg";
import {
  getGitHubTeamUrl,
  getEstadoCIInfo,
  formatearFechaCommit,
  obtenerPrimerLineaCommit,
} from "@/lib";

interface VerAlumnosModalProps {
  open: boolean;
  onClose: () => void;
  curso: CursoResponseDTO;
}

function CIStatusBadge({ estado }: { estado?: string | null }) {
  const info = getEstadoCIInfo(estado);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium shrink-0 ${info.badgeClass}`}
      title={`Estado de CI: ${info.label}`}
    >
      {info.type === "success" && (
        <svg className="w-3 h-3 shrink-0" viewBox="0 0 16 16" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {info.type === "failure" && (
        <svg className="w-3 h-3 shrink-0" viewBox="0 0 16 16" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {info.type === "pending" && (
        <svg
          className="w-3 h-3 shrink-0 animate-spin"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
        >
          <circle
            cx="8"
            cy="8"
            r="6"
            strokeWidth="2"
            strokeDasharray="14"
            strokeLinecap="round"
          />
        </svg>
      )}
      {info.type === "sin_ci" && (
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 shrink-0" />
      )}
      <span>{info.label}</span>
    </span>
  );
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
        className="w-full max-w-2xl rounded-2xl border border-line bg-panel2 p-6 shadow-xl flex flex-col max-h-[85vh] animate-rise"
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
                <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
                  {alumnosData.alumnos.map((alumno) => (
                    <div
                      key={alumno.username}
                      className="flex flex-col gap-2.5 rounded-xl border border-line bg-panel p-3.5 hover:border-foreground/20 transition-colors"
                    >
                      {/* Fila superior: Usuario, rol y estado */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={`https://github.com/${alumno.username}.png?size=64`}
                            alt={alumno.username}
                            className="w-7 h-7 rounded-full border border-line bg-line/20 object-cover shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          <a
                            href={`https://github.com/${alumno.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-sm font-semibold text-foreground hover:underline truncate"
                            title={`Ver perfil de @${alumno.username}`}
                          >
                            @{alumno.username}
                          </a>
                        </div>

                        <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
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

                      {/* Fila inferior: Repositorio, Estado CI y Último commit */}
                      <div className="pt-2 border-t border-line/60">
                        {alumno.repositorio ? (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2 min-w-0">
                              <a
                                href={alumno.repositorio.htmlUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-md border border-line bg-panel2 px-2.5 py-1 font-mono text-xs font-medium text-foreground hover:bg-line/40 transition-colors shrink-0"
                                title={`Abrir repositorio: ${alumno.repositorio.htmlUrl}`}
                              >
                                <img src={githubIcon} alt="GitHub" className="w-3.5 h-3.5 opacity-80" />
                                <span className="font-semibold truncate max-w-[180px] sm:max-w-[240px]">
                                  {alumno.repositorio.nombre}
                                </span>
                                <span className="text-[10px] text-muted-foreground">↗</span>
                              </a>

                              <CIStatusBadge estado={alumno.repositorio.estadoCI} />
                            </div>

                            {alumno.repositorio.ultimoCommit ? (
                              <div
                                className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground min-w-0"
                                title={`Último commit: "${alumno.repositorio.ultimoCommit}"${
                                  alumno.repositorio.fechaUltimoCommit
                                    ? `\nFecha: ${new Date(alumno.repositorio.fechaUltimoCommit).toLocaleString("es-AR")}`
                                    : ""
                                }`}
                              >
                                <svg
                                  className="w-3.5 h-3.5 shrink-0 opacity-70"
                                  viewBox="0 0 16 16"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm1.47 1a4.002 4.002 0 0 0-7.94 0H1.75a.75.75 0 0 0 0 1.5h2.28a4.002 4.002 0 0 0 7.94 0h2.28a.75.75 0 0 0 0-1.5h-2.28Z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="truncate max-w-[160px] sm:max-w-[220px]">
                                  {obtenerPrimerLineaCommit(alumno.repositorio.ultimoCommit)}
                                </span>
                                {alumno.repositorio.fechaUltimoCommit && (
                                  <span className="shrink-0 text-[10px] text-muted-foreground/80">
                                    · {formatearFechaCommit(alumno.repositorio.fechaUltimoCommit)}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="font-mono text-[11px] text-muted-foreground/60 italic">
                                Sin commits aún
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="font-mono text-[11px] text-muted-foreground/60">
                            Sin repositorio asignado
                          </div>
                        )}
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
