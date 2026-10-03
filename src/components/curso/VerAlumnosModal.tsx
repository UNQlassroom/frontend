import { useEffect } from "react";
import { useAlumnos } from "@/hooks";
import type { CursoResponseDTO } from "@/types";

interface VerAlumnosModalProps {
  open: boolean;
  onClose: () => void;
  curso: CursoResponseDTO;
}

export function VerAlumnosModal({ open, onClose, curso }: VerAlumnosModalProps) {
  const {
    alumnosData,
    isLoading,
    isSyncing,
    error,
    cargarAlumnos,
    sincronizarAlumnos,
    limpiar,
  } = useAlumnos();

  useEffect(() => {
    if (open) {
      cargarAlumnos(curso.id);
    } else {
      limpiar();
    }
  }, [open, curso.id, cargarAlumnos, limpiar]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/60 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-line bg-panel2 p-7 sm:p-8 shadow-xl flex flex-col max-h-[88vh] animate-rise">
        <div className="flex items-start justify-between pb-4 border-b border-line">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">
              Alumnos inscriptos
            </p>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {curso.materia}
            </h2>
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              Comisión {curso.comision} · Semestre {curso.semestre} · Año {curso.anio}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-line/40 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Lista de Alumnos */}
        <div className="py-5 flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="font-mono text-sm text-muted-foreground">
                Cargando alumnos del curso...
              </p>
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-center">
              <p className="font-mono text-sm text-destructive mb-3">{error}</p>
              <button
                type="button"
                onClick={() => cargarAlumnos(curso.id)}
                className="rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer"
              >
                Reintentar
              </button>
            </div>
          )}

          {!isLoading && !error && alumnosData && (
            <div>
              <div className="flex items-center justify-between mb-4 px-1">
                <span className="font-mono text-sm text-muted-foreground font-medium">
                  Total: {alumnosData.alumnos.length}{" "}
                  {alumnosData.alumnos.length === 1 ? "alumno" : "alumnos"}
                </span>

                <button
                  type="button"
                  onClick={() => sincronizarAlumnos(curso.id)}
                  disabled={isSyncing || isLoading}
                  className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel px-4 py-2 font-mono text-sm font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                  title="Consultar a GitHub si los alumnos ya aceptaron la invitación para actualizar su estado a activo"
                >
                  <svg
                    className={`w-4 h-4 ${
                      isSyncing ? "animate-spin text-primary" : "text-muted-foreground"
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                  <span>{isSyncing ? "Sincronizando..." : "Sincronizar con GitHub"}</span>
                </button>
              </div>

              {alumnosData.alumnos.length === 0 ? (
                <div className="rounded-xl border border-line bg-panel p-8 text-center">
                  <p className="font-mono text-sm text-muted-foreground">
                    No hay alumnos inscriptos en este curso todavía.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                  {alumnosData.alumnos.map((alumno) => (
                    <div
                      key={alumno.username}
                      className="flex items-center justify-between gap-4 rounded-xl border border-line bg-panel p-4 hover:border-foreground/20 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={`https://github.com/${alumno.username}.png?size=64`}
                          alt={alumno.username}
                          className="w-10 h-10 rounded-full border border-line bg-line/20 object-cover shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div>
                          <a
                            href={`https://github.com/${alumno.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-base font-semibold text-foreground hover:underline truncate block"
                            title={`Ver perfil de @${alumno.username}`}
                          >
                            @{alumno.username}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-xs sm:text-sm shrink-0">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 font-medium ${
                            alumno.state === "active"
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              alumno.state === "active" ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          />
                          {alumno.state === "active" ? "Activo" : "Invitación pendiente en GitHub"}
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
            className="rounded-xl border border-line bg-panel px-6 py-2.5 text-sm sm:text-base font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
