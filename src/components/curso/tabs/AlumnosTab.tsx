import { useState, useMemo } from "react";
import type { AlumnoResponseDTO, CursoResponseDTO } from "@/types";
import circleAddIcon from "@/assets/circle_add_favicon.svg";
import { PanelHeader, PanelFilterBar } from "@/components/panel";
import { EmptyState, ErrorBanner } from "@/components/common";
import { UserDetail, compararUsuarios } from "@/components/curso/UserDetail";

export interface AlumnosTabProps {
  curso?: CursoResponseDTO;
  alumnos: AlumnoResponseDTO[];
  isLoading: boolean;
  isRecargando?: boolean;
  error: string | null;
  onRetry: () => void;
  onOpenInvitarModal: () => void;
}

export function AlumnosTab({
  curso,
  alumnos,
  isLoading,
  error,
  onRetry,
  onOpenInvitarModal,
}: AlumnosTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");

  const esArchivado = Boolean(curso?.archivado);

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
  // Filtrado y ordenamiento alfabético de alumnos por apellido
  const alumnosFiltrados = useMemo(() => {
    return alumnos
      .filter((alumno) => {
        const termino = searchTerm.toLowerCase().trim();
        const coincideBusqueda =
          !termino ||
          alumno.username.toLowerCase().includes(termino) ||
          Boolean(
            alumno.nombreCompleto &&
              alumno.nombreCompleto.toLowerCase().includes(termino)
          );

        if (!coincideBusqueda) return false;

        if (filtroEstado === "todos") return true;
        return alumno.state === filtroEstado;
      })
      .sort(compararUsuarios);
  }, [alumnos, searchTerm, filtroEstado]);

  return (
    <div className="space-y-6 animate-rise">
      {/* Encabezado del Panel de Alumnos */}
      <PanelHeader
        title="Panel de Alumnos"
        description="Listado de alumnos y estado de membresía en la organización."
        actions={
          !esArchivado ? (
            <button
              type="button"
              onClick={onOpenInvitarModal}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              title="Invitar nuevos alumnos al curso"
            >
              <img
                src={circleAddIcon}
                alt="Invitar"
                className="w-4 h-4 brightness-0 invert"
              />
              <span>Invitar alumnos</span>
            </button>
          ) : undefined
        }
      />

      {/* Estado: Cargando */}
      {isLoading && (
        <div className="rounded-2xl border border-line bg-panel p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">
            Cargando nómina de alumnos matriculados...
          </p>
        </div>
      )}

      {/* Estado: Error */}
      {!isLoading && error && (
        <ErrorBanner message={error} onRetry={onRetry} />
      )}

      {/* Estado: Sin alumnos */}
      {!isLoading && !error && alumnos.length === 0 && (
        <EmptyState
          icon="👥"
          title="No hay alumnos en este curso"
          description={
            esArchivado
              ? "Este curso fue archivado sin alumnos registrados."
              : "Aún no se han añadido alumnos a este curso. Invítalos usando sus usuarios de GitHub para que puedan acceder a las asignaciones."
          }
          action={
            !esArchivado ? (
              <button
                type="button"
                onClick={onOpenInvitarModal}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              >
                <img
                  src={circleAddIcon}
                  alt="Invitar"
                  className="w-3.5 h-3.5 brightness-0 invert"
                />
                <span>Invitar alumnos</span>
              </button>
            ) : undefined
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
              className="rounded-xl border border-line bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none cursor-pointer"
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
                  className="rounded-xl border border-line bg-panel2 px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer"
                >
                  Restablecer filtros
                </button>
              }
            />
          ) : (
            /* Tabla detallada de alumnos */
            <div className="overflow-x-auto rounded-2xl border border-line bg-panel shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-line bg-panel2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    <th className="py-3.5 px-5">Alumno</th>
                    <th className="py-3.5 px-5">Estado en Curso</th>
                    <th className="py-3.5 px-5">Membresía en GitHub</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/70 text-sm">
                  {alumnosFiltrados.map((alumno) => (
                    <tr
                      key={alumno.username}
                      className="hover:bg-line/20 transition-colors group"
                    >
                      {/* Alumno con avatar */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3 min-w-[180px]">
                          <img
                            src={`https://github.com/${alumno.username}.png?size=64`}
                            alt={alumno.username}
                            className="w-9 h-9 rounded-full border border-line bg-line/30 object-cover shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          <UserDetail
                            username={alumno.username}
                            nombreCompleto={alumno.nombreCompleto}
                            layout="stacked"
                          />
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs sm:text-sm font-medium ${
                            alumno.state === "active"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
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
                      <td className="py-4 px-5">
                        {alumno.state === "active" ? (
                          <span className="text-muted-foreground text-xs sm:text-sm">
                            Miembro activo de UNQlassroom en GitHub
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-amber-600/90 dark:text-amber-400/90 text-xs sm:text-sm font-medium">
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
