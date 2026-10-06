import { useState, useEffect, useMemo, useCallback } from "react";
import type {
  AlumnoMiembroDeUnCursoDTO,
  AsignacionResponseDTO,
  CursoResponseDTO,
} from "@/types";
import { obtenerAsignaciones } from "@/services";
import { CIStatusBadge, KpiCard, EmptyState } from "@/components/common";
import { PanelHeader, PanelFilterBar } from "@/components/panel";
import {
  formatearFechaCommit,
  obtenerPrimerLineaCommit,
} from "@/utils";
import githubIcon from "@/assets/github_favicon.svg";

export interface MetricasTabProps {
  curso: CursoResponseDTO;
  alumnos?: AlumnoMiembroDeUnCursoDTO[];
  asignaciones?: AsignacionResponseDTO[];
}

interface ItemMetrica {
  id: string;
  repoNombre: string;
  repoUrl: string;
  alumnoUsername: string;
  estadoCI: "success" | "failure" | "pending" | "sin_ci";
  ultimoCommit: string;
  commitHash: string;
  fechaUltimoCommit: string | null;
  branch: string;
}

export function MetricasTab({
  curso,
}: MetricasTabProps) {
  const [asignaciones, setAsignaciones] = useState<AsignacionResponseDTO[]>([]);
  const [selectedAsignacionId, setSelectedAsignacionId] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState<string>("");

  const cargarDatos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await obtenerAsignaciones(curso.id);
      setAsignaciones(response.data);
      if (response.data.length > 0) {
        setSelectedAsignacionId((prev) => {
          if (prev && response.data.some((a) => a.id === prev)) {
            return prev;
          }
          return response.data[0].id;
        });
      } else {
        setSelectedAsignacionId(null);
      }
    } catch (err: unknown) {
      console.error("Error al cargar métricas de repositorios desde la BD:", err);
      setError("No se pudieron cargar las asignaciones y repositorios del curso.");
    } finally {
      setIsLoading(false);
    }
  }, [curso.id]);

  useEffect(() => {
    let ignore = false;

    obtenerAsignaciones(curso.id)
      .then((response) => {
        if (!ignore) {
          setAsignaciones(response.data);
          if (response.data.length > 0) {
            setSelectedAsignacionId((prev) => {
              if (prev && response.data.some((a) => a.id === prev)) {
                return prev;
              }
              return response.data[0].id;
            });
          } else {
            setSelectedAsignacionId(null);
          }
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          console.error("Error al cargar métricas desde la BD:", err);
          setError("No se pudieron cargar las asignaciones y repositorios del curso.");
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [curso.id]);

  // Extraer repositorios filtrados por la asignación seleccionada
  const datosItems: ItemMetrica[] = useMemo(() => {
    if (!asignaciones || asignaciones.length === 0) return [];
    const asignacionesAProcesar = selectedAsignacionId
      ? asignaciones.filter((a) => a.id === selectedAsignacionId)
      : asignaciones;

    const items: ItemMetrica[] = [];

    asignacionesAProcesar.forEach((asig) => {
      asig.grupos.forEach((grupo, idx) => {
        if (grupo.repositorio) {
          const repo = grupo.repositorio;
          const estadoValido = (repo.estadoCI ?? "sin_ci") as
            | "success"
            | "failure"
            | "pending"
            | "sin_ci";

          items.push({
            id: `${asig.id}-${grupo.id}-${idx}`,
            repoNombre: repo.nombre,
            repoUrl: repo.htmlUrl,
            alumnoUsername:
              grupo.nombre ||
              (grupo.integrantes.length > 0
                ? grupo.integrantes.join(", ")
                : "Sin asignar"),
            estadoCI: ["success", "failure", "pending", "sin_ci"].includes(
              estadoValido
            )
              ? estadoValido
              : "sin_ci",
            ultimoCommit: repo.ultimoCommit || "Sin commits registrados",
            commitHash: repo.ultimoCommit ? repo.ultimoCommit.slice(0, 7) : "-",
            fechaUltimoCommit: repo.fechaUltimoCommit || null,
            branch: "main",
          });
        }
      });
    });

    return items;
  }, [asignaciones, selectedAsignacionId]);

  // Cálculo de estadísticas consolidadas reales
  const total = datosItems.length;
  const passingCount = datosItems.filter((i) => i.estadoCI === "success").length;
  const failingCount = datosItems.filter((i) => i.estadoCI === "failure").length;
  const pendingCount = datosItems.filter((i) => i.estadoCI === "pending").length;
  const sinCiCount = datosItems.filter((i) => i.estadoCI === "sin_ci").length;

  const passingPct = total > 0 ? Math.round((passingCount / total) * 100) : 0;
  const failingPct = total > 0 ? Math.round((failingCount / total) * 100) : 0;
  const pendingPct = total > 0 ? Math.round((pendingCount / total) * 100) : 0;
  const sinCiPct = total > 0 ? Math.round((sinCiCount / total) * 100) : 0;

  // Filtrado por texto y estado de CI
  const itemsFiltrados = useMemo(() => {
    return datosItems.filter((item) => {
      const matchBusqueda =
        item.repoNombre.toLowerCase().includes(busqueda.toLowerCase().trim()) ||
        item.alumnoUsername
          .toLowerCase()
          .includes(busqueda.toLowerCase().trim()) ||
        item.ultimoCommit.toLowerCase().includes(busqueda.toLowerCase().trim());

      if (!matchBusqueda) return false;
      if (filtroEstado === "todos") return true;
      return item.estadoCI === filtroEstado;
    });
  }, [datosItems, busqueda, filtroEstado]);

  const handleCardClick = (estadoTarget: string) => {
    setFiltroEstado((prev) => (prev === estadoTarget ? "todos" : estadoTarget));
  };

  return (
    <div className="space-y-6 animate-rise">
      {/* Encabezado del panel de métricas con botón de actualización */}
      <PanelHeader
        title="Panel de Métricas de Repositorios (CI/CD)"
        description="Monitoreo en tiempo real de los pipelines de GitHub Actions, fechas y actividad de commits de las asignaciones."
        actions={
          <button
            type="button"
            onClick={cargarDatos}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel2 px-4 py-2 font-mono text-sm font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs self-start sm:self-auto shrink-0"
            title="Consultar datos actualizados de la base de datos y GitHub"
          >
            <svg
              className={`w-4 h-4 ${
                isLoading ? "animate-spin text-primary" : "text-muted-foreground"
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
            <span>{isLoading ? "Actualizando..." : "Actualizar métricas"}</span>
          </button>
        }
      />

      {/* Estado: Cargando */}
      {isLoading && (
        <div className="rounded-2xl border border-line bg-panel p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-sm text-muted-foreground">
            Cargando repositorios y métricas desde el servidor...
          </p>
        </div>
      )}

      {/* Estado: Error */}
      {!isLoading && error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-7 text-center">
          <p className="font-mono text-sm text-destructive mb-3.5">{error}</p>
          <button
            type="button"
            onClick={cargarDatos}
            className="rounded-lg bg-destructive px-4 py-2 font-mono text-sm font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Estado sin asignaciones creadas */}
      {!isLoading && !error && asignaciones.length === 0 && (
        <EmptyState
          icon="📋"
          title="No hay asignaciones en este curso"
          description='Para poder monitorear repositorios, primero debes crear al menos una asignación desde la pestaña "Asignaciones".'
        />
      )}

      {/* Si hay asignaciones, mostramos selector y contenido */}
      {!isLoading && !error && asignaciones.length > 0 && (
        <>
          {/* Selector de Asignación idéntico al de Correcciones */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-line">
            <span className="font-mono text-sm font-semibold text-muted-foreground shrink-0 mr-1">
              Asignación:
            </span>
            {asignaciones.map((asig) => {
              const isSelected = asig.id === selectedAsignacionId;
              return (
                <button
                  key={asig.id}
                  type="button"
                  onClick={() => setSelectedAsignacionId(asig.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm font-semibold transition-colors cursor-pointer shrink-0 ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-panel2 border border-line text-muted-foreground hover:text-foreground hover:bg-line/40"
                  }`}
                >
                  <span>{asig.titulo}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      isSelected
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-line/60 text-muted-foreground"
                    }`}
                  >
                    {asig.tipo === "GRUPAL" ? "Grupal" : "Individual"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Si la asignación seleccionada no tiene repositorios generados */}
          {datosItems.length === 0 ? (
            <EmptyState
              icon="📊"
              title="No hay repositorios en esta asignación"
              description="Aún no se han generado repositorios para los grupos o alumnos de esta asignación."
            />
          ) : (
            <>
              {/* Tarjetas KPI de Estado de Pipelines */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                {/* Total Repositorios */}
                <KpiCard
                  label="Total Monitoreados"
                  value={total}
                  unit="repos"
                  subtext={`Curso: ${curso.materia}`}
                  variant="default"
                  isSelected={filtroEstado === "todos"}
                  onClick={() => handleCardClick("todos")}
                  title="Click para ver todos los repositorios"
                  icon={
                    <img
                      src={githubIcon}
                      alt="GitHub"
                      className="w-4 h-4 opacity-60"
                    />
                  }
                />

                {/* Sin CI */}
                <KpiCard
                  label="Sin CI"
                  value={sinCiCount}
                  subtext={`${sinCiPct}% del total`}
                  variant="neutral"
                  isSelected={filtroEstado === "sin_ci"}
                  onClick={() => handleCardClick("sin_ci")}
                  title="Click para filtrar repositorios sin CI"
                />

                {/* Pending */}
                <KpiCard
                  label="CI En Ejecución"
                  value={pendingCount}
                  subtext={`${pendingPct}% del total`}
                  variant="amber"
                  isSelected={filtroEstado === "pending"}
                  onClick={() => handleCardClick("pending")}
                  title="Click para filtrar CI en ejecución"
                />

                {/* CI Passing */}
                <KpiCard
                  label="CI Exitosos"
                  value={passingCount}
                  subtext={`${passingPct}% del total`}
                  variant="emerald"
                  isSelected={filtroEstado === "success"}
                  onClick={() => handleCardClick("success")}
                  title="Click para filtrar CI exitosos"
                />

                {/* CI Failing */}
                <KpiCard
                  label="CI Fallidos"
                  value={failingCount}
                  subtext={`${failingPct}% del total`}
                  variant="rose"
                  isSelected={filtroEstado === "failure"}
                  onClick={() => handleCardClick("failure")}
                  title="Click para filtrar CI fallidos"
                />
              </div>

              {/* Controles de Búsqueda y Filtro de la Lista de Repositorios */}
              <PanelFilterBar
                searchTerm={busqueda}
                onSearchChange={setBusqueda}
                searchPlaceholder="Buscar por repositorio, alumno/grupo o commit..."
                count={itemsFiltrados.length}
                countLabel={itemsFiltrados.length === 1 ? "repo" : "repos"}
              >
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="rounded-lg border border-line bg-background px-3.5 py-2 font-mono text-sm text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="todos">Todos los pipelines</option>
                  <option value="success">Solo exitosos</option>
                  <option value="failure">Solo fallidos</option>
                  <option value="pending">Solo pendientes</option>
                  <option value="sin_ci">Solo sin CI</option>
                </select>
              </PanelFilterBar>

              {/* Tabla detallada de estado de Repositorios y Commits */}
              <div className="overflow-x-auto rounded-xl border border-line bg-panel shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-line bg-panel2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="py-3.5 px-4.5">Repositorio</th>
                      <th className="py-3.5 px-4.5">Alumno / Grupo</th>
                      <th className="py-3.5 px-4.5">Pipeline CI/CD</th>
                      <th className="py-3.5 px-4.5">Último Commit</th>
                      <th className="py-3.5 px-4.5">Rama</th>
                      <th className="py-3.5 px-4.5">Fecha Commit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/70 font-mono text-sm">
                    {itemsFiltrados.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-line/20 transition-colors group"
                      >
                        {/* Repositorio */}
                        <td className="py-4 px-4.5">
                          <a
                            href={item.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel2 px-3 py-1.5 text-xs sm:text-sm font-semibold text-foreground hover:bg-line/50 transition-colors max-w-[240px]"
                            title={item.repoUrl}
                          >
                            <img
                              src={githubIcon}
                              alt="GitHub"
                              className="w-4 h-4 opacity-80 shrink-0"
                            />
                            <span className="truncate">{item.repoNombre}</span>
                            <span className="text-xs text-muted-foreground shrink-0">
                              ↗
                            </span>
                          </a>
                        </td>

                        {/* Alumno o Grupo */}
                        <td className="py-4 px-4.5 whitespace-nowrap">
                          <span className="font-medium text-foreground">
                            {item.alumnoUsername}
                          </span>
                        </td>

                        {/* Pipeline CI/CD */}
                        <td className="py-4 px-4.5 whitespace-nowrap">
                          <CIStatusBadge estado={item.estadoCI} />
                        </td>

                        {/* Último commit */}
                        <td className="py-4 px-4.5">
                          <div className="flex items-center gap-2 min-w-[200px] max-w-[320px]">
                            <span className="rounded bg-panel2 border border-line px-2 py-0.5 text-xs font-mono text-muted-foreground shrink-0">
                              {item.commitHash}
                            </span>
                            <span
                              className="truncate text-foreground text-xs sm:text-sm"
                              title={item.ultimoCommit}
                            >
                              {obtenerPrimerLineaCommit(item.ultimoCommit)}
                            </span>
                          </div>
                        </td>

                        {/* Rama */}
                        <td className="py-4 px-4.5 whitespace-nowrap">
                          <span className="rounded-md border border-line bg-panel2 px-2.5 py-0.5 text-xs text-muted-foreground">
                            {item.branch}
                          </span>
                        </td>

                        {/* Fecha commit */}
                        <td className="py-4 px-4.5 whitespace-nowrap">
                          <div
                            className="text-xs sm:text-sm text-muted-foreground"
                            title={
                              item.fechaUltimoCommit
                                ? new Date(
                                    item.fechaUltimoCommit
                                  ).toLocaleString("es-AR")
                                : "Sin fecha registrada"
                            }
                          >
                            <span className="text-foreground font-medium">
                              {item.fechaUltimoCommit
                                ? formatearFechaCommit(item.fechaUltimoCommit)
                                : "Sin actividad"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

