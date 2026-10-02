import { useState, useMemo } from "react";
import type { AlumnoMiembroDeUnCursoDTO, CursoResponseDTO } from "@/types";
import circleAddIcon from "@/assets/circle_add_favicon.svg";
import { PanelHeader, PanelFilterBar } from "../panel";
import { EmptyState } from "../common";

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

  // Métricas y conteos
  const total = alumnos.length;
  const activosCount = useMemo(
    () => alumnos.filter((a) => a.state === "active").length,
    [alumnos]
  );
  const pendientesCount = useMemo(
    () => alumnos.filter((a) => a.state !== "active").length,
    [alumnos]
  );
  // Filtrado de alumnos por búsqueda y estado
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

  return (
    <div className="space-y-6 animate-rise">
      {/* Encabezado del Panel de Alumnos */}
      <PanelHeader
        title="Panel de Alumnos Matriculados"
        description="Nómina de estudiantes, estado de membresía en GitHub y sincronización con la organización."
        actions={
          <>
            {onSync && (
              <button
                type="button"
                onClick={onSync}
                disabled={isSyncing || isLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel2 px-3.5 py-2 font-mono text-xs font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                title="Consultar a GitHub si los alumnos ya aceptaron la invitación para actualizar su estado a activo"
              >
                <svg
                  className={`w-3.5 h-3.5 ${
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
            )}

            <button
              type="button"
              onClick={onOpenInvitarModal}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 font-mono text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              title="Invitar nuevos alumnos al curso"
            >
              <img
                src={circleAddIcon}
                alt="Invitar"
                className="w-3.5 h-3.5 brightness-0 invert"
              />
              <span>Invitar alumnos</span>
            </button>
          </>
        }
      />

      {/* Estado: Cargando */}
      {isLoading && (
        <div className="rounded-2xl border border-line bg-panel p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-xs text-muted-foreground">
            Cargando nómina de alumnos matriculados...
          </p>
        </div>
      )}

      {/* Estado: Error */}
      {!isLoading && error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="font-mono text-xs text-destructive mb-3">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-destructive px-4 py-2 font-mono text-xs font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Estado: Sin alumnos */}
      {!isLoading && !error && alumnos.length === 0 && (
        <EmptyState
          icon="👥"
          title="No hay alumnos en este curso"
          description="Aún no se han añadido alumnos a este curso. Invítalos usando sus usuarios de GitHub para que puedan acceder a las asignaciones."
          action={
            <button
              type="button"
              onClick={onOpenInvitarModal}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-mono text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              <img
                src={circleAddIcon}
                alt="Invitar"
                className="w-3.5 h-3.5 brightness-0 invert"
              />
              <span>Invitar alumnos</span>
            </button>
          }
        />
      )}

      {/* Si hay alumnos, mostramos KPIs, Filtros y Tabla */}
      {!isLoading && !error && alumnos.length > 0 && (
        <>
          {/* Barra de Filtros y Búsqueda */}
          <PanelFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar alumno por @usuario..."
            count={alumnosFiltrados.length}
            countLabel={alumnosFiltrados.length === 1 ? "alumno" : "alumnos"}
          >
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="rounded-lg border border-line bg-background px-3 py-1.5 font-mono text-xs text-foreground focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos los estados ({total})</option>
              <option value="active">Solo activos ({activosCount})</option>
              <option value="pending">
                Solo invitaciones pendientes ({pendientesCount})
              </option>
            </select>
          </PanelFilterBar>

          {/* Estado de búsqueda sin coincidencias */}
          {alumnosFiltrados.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No se encontraron alumnos"
              description="No hay estudiantes que coincidan con el término de búsqueda o el filtro de estado seleccionado."
              action={
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setFiltroEstado("todos");
                  }}
                  className="rounded-lg border border-line bg-panel2 px-4 py-2 font-mono text-xs font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer"
                >
                  Restablecer filtros
                </button>
              }
            />
          ) : (
            /* Tabla detallada de alumnos */
            <div className="overflow-x-auto rounded-xl border border-line bg-panel shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-line bg-panel2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="py-3 px-4">Alumno</th>
                    <th className="py-3 px-4">Estado en Curso</th>
                    <th className="py-3 px-4">Membresía en GitHub</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/70 font-mono text-xs">
                  {alumnosFiltrados.map((alumno) => (
                    <tr
                      key={alumno.username}
                      className="hover:bg-line/20 transition-colors group"
                    >
                      {/* Alumno con avatar */}
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
                            className="font-semibold text-foreground hover:text-primary hover:underline inline-flex items-center gap-1 truncate"
                            title={`Ver perfil de GitHub de @${alumno.username}`}
                          >
                            <span>@{alumno.username}</span>
                            <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">
                              ↗
                            </span>
                          </a>
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium ${
                            alumno.state === "active"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              alumno.state === "active"
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                          />
                          {alumno.state === "active"
                            ? "Activo"
                            : "Invitación pendiente"}
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
                            <span className="text-amber-600/90 dark:text-amber-400/90 text-[11px]">
                              Pendiente de aceptar la invitación a la organización
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

