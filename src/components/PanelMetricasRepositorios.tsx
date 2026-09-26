import { useState, useMemo, useEffect, useCallback } from "react";
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

  // Extraer repositorios reales persistidos en la base de datos para este curso
  const datosItems: ItemMetrica[] = useMemo(() => {
    if (!asignaciones || asignaciones.length === 0) return [];
    const items: ItemMetrica[] = [];

    asignaciones.forEach((asig) => {
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
  }, [asignaciones]);

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

      {/* Estado: Sin repositorios creados (Empty State) */}
      {!isLoading && !error && datosItems.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line bg-panel p-12 text-center max-w-lg mx-auto my-6">
          <div className="mx-auto w-12 h-12 rounded-xl bg-line/40 flex items-center justify-center text-xl mb-3 text-muted-foreground">
            📊
          </div>
          <h4 className="font-display text-lg font-bold text-foreground">
            No hay repositorios para monitorear
          </h4>
          <p className="mt-1 font-mono text-xs text-muted-foreground leading-relaxed">
            Aún no se han generado repositorios en este curso. Creá asignaciones en la pestaña "Asignaciones" para que se creen los repositorios y se visualicen sus pipelines, commits y estados acá.
          </p>
        </div>
      )}

      {/* Estado con datos reales */}
      {!isLoading && !error && datosItems.length > 0 && (
        <>
          {/* Tarjetas KPI de Estado de Pipelines */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Repositorios */}
            <div className="rounded-xl border border-line bg-panel p-4 shadow-xs">
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
            </div>

            {/* CI Passing */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-700">
                  CI Passing
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-suez text-3xl font-bold text-emerald-600">
                  {passingCount}
                </span>
                <span className="font-mono text-xs text-emerald-700 font-semibold">
                  {passingPct}%
                </span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-emerald-700/80">
                Builds y pruebas exitosas
              </p>
            </div>

            {/* CI Failing */}
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-rose-700">
                  CI Failing
                </span>
                <span className="w-2 h-2 rounded-full bg-rose-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-suez text-3xl font-bold text-rose-600">
                  {failingCount}
                </span>
                <span className="font-mono text-xs text-rose-700 font-semibold">
                  {failingPct}%
                </span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-rose-700/80">
                Requieren atención del alumno
              </p>
            </div>

            {/* Pending & Sin CI */}
            <div className="rounded-xl border border-line bg-panel p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  En Ejecución / Sin CI
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-suez text-3xl font-bold text-foreground">
                  {pendingCount + sinCiCount}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  ({pendingCount} pending / {sinCiCount} sin CI)
                </span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                {pendingPct + sinCiPct}% del total
              </p>
            </div>
          </div>

          {/* Barra visual de distribución de Pipelines (Health Bar) */}
          <div className="rounded-2xl border border-line bg-panel p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Distribución de Pipelines CI/CD</span>
              <span>{passingPct}% tasa de aprobación</span>
            </div>

            {/* Barra segmentada */}
            <div className="h-3.5 w-full rounded-full bg-line/60 overflow-hidden flex">
              {passingPct > 0 && (
                <div
                  style={{ width: `${passingPct}%` }}
                  className="bg-emerald-500 transition-all duration-500"
                  title={`Passing: ${passingCount} (${passingPct}%)`}
                />
              )}
              {failingPct > 0 && (
                <div
                  style={{ width: `${failingPct}%` }}
                  className="bg-rose-500 transition-all duration-500"
                  title={`Failing: ${failingCount} (${failingPct}%)`}
                />
              )}
              {pendingPct > 0 && (
                <div
                  style={{ width: `${pendingPct}%` }}
                  className="bg-amber-500 transition-all duration-500"
                  title={`Pending: ${pendingCount} (${pendingPct}%)`}
                />
              )}
              {sinCiPct > 0 && (
                <div
                  style={{ width: `${sinCiPct}%` }}
                  className="bg-neutral-400 transition-all duration-500"
                  title={`Sin CI: ${sinCiCount} (${sinCiPct}%)`}
                />
              )}
            </div>

            {/* Leyenda interactiva */}
            <div className="flex flex-wrap items-center gap-4 pt-1 font-mono text-[11px] text-muted-foreground">
              <button
                type="button"
                onClick={() => setFiltroEstado(filtroEstado === "success" ? "todos" : "success")}
                className={`inline-flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors ${
                  filtroEstado === "success" ? "font-bold text-foreground underline" : ""
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Success ({passingCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setFiltroEstado(filtroEstado === "failure" ? "todos" : "failure")}
                className={`inline-flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors ${
                  filtroEstado === "failure" ? "font-bold text-foreground underline" : ""
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Failure ({failingCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setFiltroEstado(filtroEstado === "pending" ? "todos" : "pending")}
                className={`inline-flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors ${
                  filtroEstado === "pending" ? "font-bold text-foreground underline" : ""
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Pending ({pendingCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setFiltroEstado(filtroEstado === "sin_ci" ? "todos" : "sin_ci")}
                className={`inline-flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors ${
                  filtroEstado === "sin_ci" ? "font-bold text-foreground underline" : ""
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-neutral-400" />
                <span>Sin CI ({sinCiCount})</span>
              </button>
              {filtroEstado !== "todos" && (
                <button
                  type="button"
                  onClick={() => setFiltroEstado("todos")}
                  className="ml-auto text-primary underline cursor-pointer"
                >
                  Mostrar todos
                </button>
              )}
            </div>
          </div>

          {/* Controles de Búsqueda y Filtro de la Lista de Repositorios */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-panel p-4 rounded-xl border border-line">
            <div className="relative flex-1 max-w-md">
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

            <div className="flex items-center gap-2">
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="rounded-lg border border-line bg-background px-3 py-1.5 font-mono text-xs text-foreground focus:outline-none cursor-pointer"
              >
                <option value="todos">Todos los pipelines</option>
                <option value="success">Solo Passing</option>
                <option value="failure">Solo Failing</option>
                <option value="pending">Solo Pending</option>
                <option value="sin_ci">Solo Sin CI</option>
              </select>
              <span className="font-mono text-xs text-muted-foreground">
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
    </div>
  );
}
