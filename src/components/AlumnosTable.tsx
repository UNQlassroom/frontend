import { useState, useMemo } from "react";
import type { AlumnoMiembroDeUnCursoDTO, CursoResponseDTO } from "@/types";
import { CIStatusBadge } from "./CIStatusBadge";
import {
  formatearFechaCommit,
  obtenerPrimerLineaCommit,
} from "@/lib";
import githubIcon from "@/assets/github_favicon.svg";
import circleAddIcon from "@/assets/circle_add_favicon.svg";

interface AlumnosTableProps {
  curso: CursoResponseDTO;
  alumnos: AlumnoMiembroDeUnCursoDTO[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onOpenInvitarModal: () => void;
}

export function AlumnosTable({
  alumnos,
  isLoading,
  error,
  onRetry,
  onOpenInvitarModal,
}: AlumnosTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroCI, setFiltroCI] = useState<string>("todos");

  const alumnosFiltrados = useMemo(() => {
    return alumnos.filter((alumno) => {
      const coincideBusqueda = alumno.username
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim());

      if (!coincideBusqueda) return false;

      if (filtroCI === "todos") return true;
      if (filtroCI === "con_repo") return Boolean(alumno.repositorio);
      if (filtroCI === "sin_repo") return !alumno.repositorio;
      return alumno.repositorio?.estadoCI === filtroCI;
    });
  }, [alumnos, searchTerm, filtroCI]);

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

          {/* Filtro por estado de CI */}
          <select
            value={filtroCI}
            onChange={(e) => setFiltroCI(e.target.value)}
            className="rounded-lg border border-line bg-background px-3 py-1.5 font-mono text-xs text-foreground focus:outline-none cursor-pointer"
          >
            <option value="todos">Todos los estados</option>
            <option value="success">CI Passing</option>
            <option value="failure">CI Failing</option>
            <option value="pending">CI Pending</option>
            <option value="sin_ci">Sin CI</option>
            <option value="con_repo">Con repositorio</option>
            <option value="sin_repo">Sin repositorio</option>
          </select>
        </div>

        {/* Botón de acceso al modal de invitar alumnos */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
            {alumnos.length} {alumnos.length === 1 ? "alumno" : "alumnos"}
          </span>
          <button
            type="button"
            onClick={onOpenInvitarModal}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-mono text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-sm shrink-0"
          >
            <img src={circleAddIcon} alt="Invitar" className="w-3.5 h-3.5 invert opacity-90" />
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
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl mb-3 text-foreground">
            👥
          </div>
          <h3 className="font-display text-lg font-bold text-foreground">
            No hay alumnos matriculados
          </h3>
          <p className="mt-1 font-mono text-xs text-muted-foreground leading-relaxed">
            Aún no se han añadido alumnos a este curso. Invitá a los estudiantes usando sus usuarios de GitHub para que puedan acceder a sus repositorios.
          </p>
          <div className="mt-5">
            <button
              type="button"
              onClick={onOpenInvitarModal}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-mono text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
            >
              <img src={circleAddIcon} alt="Invitar" className="w-3.5 h-3.5 invert opacity-90" />
              <span>Invitar primer alumno</span>
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
                  setFiltroCI("todos");
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
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Repositorio</th>
                    <th className="py-3 px-4">Pipeline CI/CD</th>
                    <th className="py-3 px-4">Último Commit</th>
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
                          {alumno.state}
                        </span>
                      </td>

                      {/* Repositorio */}
                      <td className="py-3.5 px-4">
                        {alumno.repositorio ? (
                          <a
                            href={alumno.repositorio.htmlUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-panel2 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-line/50 transition-colors shrink-0 max-w-[220px]"
                            title={`Abrir repositorio: ${alumno.repositorio.htmlUrl}`}
                          >
                            <img src={githubIcon} alt="GitHub" className="w-3.5 h-3.5 opacity-80 shrink-0" />
                            <span className="truncate">{alumno.repositorio.nombre}</span>
                            <span className="text-[10px] text-muted-foreground shrink-0">↗</span>
                          </a>
                        ) : (
                          <span className="text-muted-foreground/60 italic text-[11px]">
                            Sin repositorio
                          </span>
                        )}
                      </td>

                      {/* Pipeline CI/CD */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {alumno.repositorio ? (
                          <CIStatusBadge estado={alumno.repositorio.estadoCI} />
                        ) : (
                          <span className="text-muted-foreground/50 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Último commit */}
                      <td className="py-3.5 px-4">
                        {alumno.repositorio?.ultimoCommit ? (
                          <div
                            className="min-w-[180px] max-w-[280px]"
                            title={`Commit: "${alumno.repositorio.ultimoCommit}"${
                              alumno.repositorio.fechaUltimoCommit
                                ? `\nFecha: ${new Date(alumno.repositorio.fechaUltimoCommit).toLocaleString("es-AR")}`
                                : ""
                            }`}
                          >
                            <p className="truncate text-foreground text-[11px] font-medium">
                              {obtenerPrimerLineaCommit(alumno.repositorio.ultimoCommit)}
                            </p>
                            {alumno.repositorio.fechaUltimoCommit && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {formatearFechaCommit(alumno.repositorio.fechaUltimoCommit)}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60 italic text-[11px]">
                            {alumno.repositorio ? "Sin commits" : "—"}
                          </span>
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
