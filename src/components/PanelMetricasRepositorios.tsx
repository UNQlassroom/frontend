import { useState, useEffect, useMemo, useCallback } from "react";
import type {
  AlumnoMiembroDeUnCursoDTO,
  AsignacionResponseDTO,
  CursoResponseDTO,
} from "@/types";
import { obtenerAsignaciones } from "@/services";
import { CIStatusBadge } from "./CIStatusBadge";
import {
  formatearFechaCommit,
  obtenerPrimerLineaCommit,
} from "@/lib";
import githubIcon from "@/assets/github_favicon.svg";

interface PanelMetricasRepositoriosProps {
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

export function PanelMetricasRepositorios({
  curso,
}: PanelMetricasRepositoriosProps) {
  const [asignaciones, setAsignaciones] = useState<AsignacionResponseDTO[]>([]);
  const [selectedAsignacionId, setSelectedAsignacionId] = useState<number | null>(null);
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
            estadoCI: ["success", "failure", "pending", "sin_ci"].includes(estadoValido)
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
        item.alumnoUsername.toLowerCase().includes(busqueda.toLowerCase().trim()) ||
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-panel p-5 rounded-2xl border border-line shadow-xs">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">
            Panel de Métricas de Repositorios (CI/CD)
          </h3>
          <p className="font-mono text-xs text-muted-foreground mt-0.5">
            Monitoreo en tiempo real de los pipelines de GitHub Actions, fechas y actividad de commits de las asignaciones.
          </p>
        </div>

        <button
          type="button"
          onClick={cargarDatos}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel2 px-3.5 py-2 font-mono text-xs font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs self-start sm:self-auto shrink-0"
          title="Consultar datos actualizados de la base de datos y GitHub"
        >
          <svg
            className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-primary" : "text-muted-foreground"}`}
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
      </div>

      {/* Estado: Cargando */}
      {isLoading && (
        <div className="rounded-2xl border border-line bg-panel p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-xs text-muted-foreground">
            Cargando repositorios y métricas desde el servidor...
          </p>
        </div>
      )}

      {/* Estado: Error */}
      {!isLoading && error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="font-mono text-xs text-destructive mb-3">{error}</p>
          <button
            type="button"
            onClick={cargarDatos}
            className="rounded-lg bg-destructive px-4 py-2 font-mono text-xs font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Estado sin asignaciones creadas */}
      {!isLoading && !error && asignaciones.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line bg-panel p-12 text-center max-w-lg mx-auto my-6 animate-rise">
          <div className="mx-auto w-12 h-12 rounded-xl bg-line/40 flex items-center justify-center text-xl mb-3 text-muted-foreground">
            📋
          </div>
          <h4 className="font-display text-lg font-bold text-foreground">
            No hay asignaciones en este curso
          </h4>
          <p className="mt-1 font-mono text-xs text-muted-foreground leading-relaxed">
            Para poder monitorear repositorios, primero debes crear al menos una asignación desde la pestaña "Asignaciones".
          </p>
        </div>
      )}

      {/* Si hay asignaciones, mostramos selector y contenido */}
      {!isLoading && !error && asignaciones.length > 0 && (
        <>
          {/* Selector de Asignación idéntico al de Correcciones */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-line">
            <span className="font-mono text-xs font-semibold text-muted-foreground shrink-0 mr-1">
              Asignación:
            </span>
            {asignaciones.map((asig) => {
              const isSelected = asig.id === selectedAsignacionId;
              return (
                <button
                  key={asig.id}
                  type="button"
                  onClick={() => setSelectedAsignacionId(asig.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-mono text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-panel2 border border-line text-muted-foreground hover:text-foreground hover:bg-line/40"
                  }`}
                >
                  <span>{asig.titulo}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
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
            <div className="rounded-2xl border border-dashed border-line bg-panel p-12 text-center max-w-lg mx-auto my-6 animate-rise">
              <div className="mx-auto w-12 h-12 rounded-xl bg-line/40 flex items-center justify-center text-xl mb-3 text-muted-foreground">
                📊
              </div>
              <h4 className="font-display text-lg font-bold text-foreground">
                No hay repositorios en esta asignación
              </h4>
              <p className="mt-1 font-mono text-xs text-muted-foreground leading-relaxed">
                Aún no se han generado repositorios para los grupos o alumnos de esta asignación.
              </p>
            </div>
          ) : (
            <>
              {/* Tarjetas KPI de Estado de Pipelines (Clickeables como filtros) */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                {/* Total Repositorios */}
                <button
                  type="button"
                  onClick={() => handleCardClick("todos")}
                  className={`rounded-xl border p-4 shadow-xs text-left cursor-pointer transition-all duration-150 hover:scale-[1.02] hover:shadow-md ${
                    filtroEstado === "todos"
                      ? "border-primary ring-2 ring-primary/30 bg-panel shadow-sm"
                      : "border-line bg-panel hover:border-foreground/30"
                  }`}
                  title="Click para ver todos los repositorios"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      Total Monitoreados
                    </span>
                    <img src={githubIcon} alt="GitHub" className="w-4 h-4 opacity-60" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-suez text-3xl font-bold text-foreground">
                      {total}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">repos</span>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                    Curso: {curso.materia}
                  </p>
                </button>

                {/* Sin CI */}
                <button
                  type="button"
                  onClick={() => handleCardClick("sin_ci")}
                  className={`rounded-xl border p-4 shadow-xs text-left cursor-pointer transition-all duration-150 hover:scale-[1.02] hover:shadow-md ${
                    filtroEstado === "sin_ci"
                      ? "border-neutral-500 ring-2 ring-neutral-500/30 bg-neutral-200 shadow-sm"
                      : "border-line bg-neutral-200 hover:border-neutral-400"
                  }`}
                  title="Click para filtrar repositorios sin CI"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      Sin CI
                    </span>
                    <span className="w-2 h-2 rounded-full bg-neutral-400" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-suez text-3xl font-bold text-foreground">
                      {sinCiCount}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                    {sinCiPct}% del total
                  </p>
                </button>

                {/* Pending */}
                <button
                  type="button"
                  onClick={() => handleCardClick("pending")}
                  className={`rounded-xl border p-4 shadow-xs text-left cursor-pointer transition-all duration-150 hover:scale-[1.02] hover:shadow-md ${
                    filtroEstado === "pending"
                      ? "border-amber-500 ring-2 ring-amber-500/40 bg-amber-100 shadow-sm"
                      : "border-line bg-amber-100 hover:border-amber-400"
                  }`}
                  title="Click para filtrar CI en ejecución"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      CI En Ejecución
                    </span>
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-suez text-3xl font-bold text-foreground">
                      {pendingCount}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                    {pendingPct}% del total
                  </p>
                </button>

                {/* CI Passing */}
                <button
                  type="button"
                  onClick={() => handleCardClick("success")}
                  className={`rounded-xl border p-4 shadow-xs text-left cursor-pointer transition-all duration-150 hover:scale-[1.02] hover:shadow-md ${
                    filtroEstado === "success"
                      ? "border-emerald-500 ring-2 ring-emerald-500/40 bg-emerald-500/10 shadow-sm"
                      : "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40"
                  }`}
                  title="Click para filtrar CI exitosos"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-700">
                      CI Exitosos
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-suez text-3xl font-bold text-emerald-600">
                      {passingCount}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-emerald-700/80">
                    {passingPct}% del total
                  </p>
                </button>

                {/* CI Failing */}
                <button
                  type="button"
                  onClick={() => handleCardClick("failure")}
                  className={`rounded-xl border p-4 shadow-xs text-left cursor-pointer transition-all duration-150 hover:scale-[1.02] hover:shadow-md ${
                    filtroEstado === "failure"
                      ? "border-rose-500 ring-2 ring-rose-500/40 bg-rose-500/10 shadow-sm"
                      : "border-rose-500/20 bg-rose-500/5 hover:border-rose-500/40"
                  }`}
                  title="Click para filtrar CI fallidos"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-rose-700">
                      CI Fallidos
                    </span>
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-suez text-3xl font-bold text-rose-600">
                      {failingCount}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-rose-700/80">
                    {failingPct}% del total
                  </p>
                </button>
              </div>

              {/* Controles de Búsqueda y Filtro de la Lista de Repositorios */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-panel p-4 rounded-xl border border-line">
                <div className="flex flex-wrap items-center gap-2.5 flex-1">
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
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      placeholder="Buscar por repositorio, alumno/grupo o commit..."
                      className="w-full rounded-lg border border-line bg-background pl-9 pr-3 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="rounded-lg border border-line bg-background px-3 py-1.5 font-mono text-xs text-foreground focus:outline-none cursor-pointer"
                  >
                    <option value="todos">Todos los pipelines</option>
                    <option value="success">Solo exitosos</option>
                    <option value="failure">Solo fallidos</option>
                    <option value="pending">Solo pendientes</option>
                    <option value="sin_ci">Solo sin CI</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {itemsFiltrados.length} {itemsFiltrados.length === 1 ? "repo" : "repos"}
                  </span>
                </div>
              </div>

              {/* Tabla detallada de estado de Repositorios y Commits */}
              <div className="overflow-x-auto rounded-xl border border-line bg-panel shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-line bg-panel2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="py-3 px-4">Repositorio</th>
                      <th className="py-3 px-4">Alumno / Grupo</th>
                      <th className="py-3 px-4">Pipeline CI/CD</th>
                      <th className="py-3 px-4">Último Commit</th>
                      <th className="py-3 px-4">Rama</th>
                      <th className="py-3 px-4">Fecha Commit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/70 font-mono text-xs">
                    {itemsFiltrados.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-line/20 transition-colors group"
                      >
                        {/* Repositorio */}
                        <td className="py-3.5 px-4">
                          <a
                            href={item.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-panel2 px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-line/50 transition-colors max-w-[240px]"
                            title={item.repoUrl}
                          >
                            <img src={githubIcon} alt="GitHub" className="w-3.5 h-3.5 opacity-80 shrink-0" />
                            <span className="truncate">{item.repoNombre}</span>
                            <span className="text-[10px] text-muted-foreground shrink-0">↗</span>
                          </a>
                        </td>

                        {/* Alumno o Grupo */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-medium text-foreground">
                            {item.alumnoUsername}
                          </span>
                        </td>

                        {/* Pipeline CI/CD */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <CIStatusBadge estado={item.estadoCI} />
                        </td>

                        {/* Último commit */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 min-w-[200px] max-w-[320px]">
                            <span className="rounded bg-panel2 border border-line px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground shrink-0">
                              {item.commitHash}
                            </span>
                            <span
                              className="truncate text-foreground text-[11px]"
                              title={item.ultimoCommit}
                            >
                              {obtenerPrimerLineaCommit(item.ultimoCommit)}
                            </span>
                          </div>
                        </td>

                        {/* Rama */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="rounded-md border border-line bg-panel2 px-2 py-0.5 text-[11px] text-muted-foreground">
                            {item.branch}
                          </span>
                        </td>

                        {/* Fecha commit */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div
                            className="text-[11px] text-muted-foreground"
                            title={
                              item.fechaUltimoCommit
                                ? new Date(item.fechaUltimoCommit).toLocaleString("es-AR")
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
