import { useState, useMemo } from "react";
import type { AlumnoMiembroDeUnCursoDTO, CursoResponseDTO } from "@/types";
import circleAddIcon from "@/assets/circle_add_favicon.svg";

interface AlumnosTableProps {
  curso: CursoResponseDTO;
  alumnos: AlumnoMiembroDeUnCursoDTO[];
  isLoading: boolean;
  isSyncing?: boolean;
  error: string | null;
  onRetry: () => void;
  onSync?: () => void;
  onOpenInvitarModal: () => void;
}

export function AlumnosTable({
  alumnos,
  isLoading,
  isSyncing = false,
  error,
  onRetry,
  onSync,
  onOpenInvitarModal,
}: AlumnosTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");

  const alumnosFiltrados = useMemo(() => {
    return alumnos.filter((alumno) => {
      const coincideBusqueda = alumno.username
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim());

      if (!coincideBusqueda) return false;

      if (filtroEstado === "todos") return true;
      return alumno.state === filtroEstado;
    });
  }, [alumnos, searchTerm, filtroEstado]);

  const pendientesCount = useMemo(
    () => alumnos.filter((a) => a.state !== "active").length,
    [alumnos]
  );

  return (
    <div className="space-y-4 animate-rise">
      {/* Barra superior de acciones y filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-panel p-4 rounded-xl border border-line">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Input de búsqueda */}
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar alumno por @usuario..."
              className="w-full rounded-lg border border-line bg-background pl-9 pr-3 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Filtro por estado de inscripción */}
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="rounded-lg border border-line bg-background px-3 py-1.5 font-mono text-xs text-foreground focus:outline-none cursor-pointer"
          >
            <option value="todos">Todos los estados ({alumnos.length})</option>
            <option value="active">Activos ({alumnos.length - pendientesCount})</option>
            <option value="pending">Invitación pendiente ({pendientesCount})</option>
          </select>
        </div>

        {/* Acciones principales: Sincronizar con GitHub e Invitar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {onSync && (
            <button
              type="button"
              onClick={onSync}
              disabled={isSyncing || isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel2 px-3 py-2 font-mono text-xs font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
              title="Consultar a GitHub si los alumnos ya aceptaron la invitación para actualizar su estado a activo"
            >
              <svg
                className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-primary" : "text-muted-foreground"}`}
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
          )}

          <button
            type="button"
            onClick={onOpenInvitarModal}
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel2 px-3.5 py-2 font-mono text-xs font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer shadow-xs shrink-0"
            title="Invitar alumnos"
          >
            <img src={circleAddIcon} alt="Invitar" className="w-3.5 h-3.5 opacity-80" />
            <span>Invitar alumnos</span>
          </button>
        </div>
      </div>

      {/* Estado: Cargando */}
      {isLoading && (
        <div className="rounded-xl border border-line bg-panel p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-xs text-muted-foreground">
            Cargando nómina de alumnos matriculados...
          </p>
        </div>
      )}

      {/* Estado: Error */}
      {!isLoading && error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center">
          <p className="font-mono text-xs text-destructive mb-3">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-destructive px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Estado: Sin alumnos (Empty State) */}
      {!isLoading && !error && alumnos.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line bg-panel p-12 text-center max-w-lg mx-auto my-6">

          <h3 className="font-display text-lg font-bold text-foreground">
            No hay alumnos en este curso
          </h3>
          <p className="mt-1 font-mono text-xs text-muted-foreground leading-relaxed">
            Aún no se han añadido alumnos a este curso. Invítalos usando sus usuarios de GitHub.
          </p>
          <div className="mt-5">
            <button
              type="button"
              onClick={onOpenInvitarModal}
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel2 px-5 py-2.5 font-mono text-xs font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer shadow-xs"
            >
              <img src={circleAddIcon} alt="Invitar" className="w-3.5 h-3.5 opacity-80" />
              <span>Invitar alumnos</span>
            </button>
          </div>
        </div>
      )}

      {/* Estado: Tabla con datos */}
      {!isLoading && !error && alumnos.length > 0 && (
        <>
          {alumnosFiltrados.length === 0 ? (
            <div className="rounded-xl border border-line bg-panel p-8 text-center">
              <p className="font-mono text-xs text-muted-foreground">
                No se encontraron alumnos que coincidan con los filtros aplicados.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setFiltroEstado("todos");
                }}
                className="mt-3 font-mono text-xs text-primary underline cursor-pointer"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-line bg-panel shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-line bg-panel2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="py-3 px-4">Alumno</th>
                    <th className="py-3 px-4">Rol</th>
                    <th className="py-3 px-4">Estado en Curso</th>
                    <th className="py-3 px-4">Información</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/70 font-mono text-xs">
                  {alumnosFiltrados.map((alumno) => (
                    <tr
                      key={alumno.username}
                      className="hover:bg-line/20 transition-colors group"
                    >
                      {/* Alumno */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5 min-w-[170px]">
                          <img
                            src={`https://github.com/${alumno.username}.png?size=64`}
                            alt={alumno.username}
                            className="w-7 h-7 rounded-full border border-line bg-line/30 object-cover shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          <a
                            href={`https://github.com/${alumno.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-foreground hover:underline inline-flex items-center gap-1 truncate"
                            title={`Ver perfil de GitHub de @${alumno.username}`}
                          >
                            <span>@{alumno.username}</span>
                            <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                              ↗
                            </span>
                          </a>
                        </div>
                      </td>

                      {/* Rol */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="rounded-md border border-line bg-panel2 px-2 py-0.5 text-[11px] text-muted-foreground uppercase">
                          {alumno.role}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium ${
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
                          {alumno.state === "active" ? "Activo" : "Invitación pendiente"}
                        </span>
                      </td>

                      {/* Información adicional */}
                      <td className="py-3.5 px-4">
                        {alumno.state === "active" ? (
                          <span className="text-muted-foreground text-[11px]">
                            Miembro activo de UNQlassroom en GitHub
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-amber-600/90 text-[11px]">
                              Pendiente de aceptar la invitación
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
