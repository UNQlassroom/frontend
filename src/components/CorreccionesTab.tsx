import { useState, useEffect, useMemo, useCallback } from "react";
import type { CursoResponseDTO, CorreccionGrupoResponseDTO, AsignacionResponseDTO, IssueResponseDTO } from "@/types";
import { obtenerAsignaciones, obtenerCorrecciones } from "@/services";
import { IssueEstadoBadge } from "./IssueEstadoBadge";
import githubIcon from "@/assets/github_favicon.svg";
import { getGitHubNewIssueUrl, getGitHubIssuesUrl } from "@/lib";

interface CorreccionesTabProps {
  curso: CursoResponseDTO;
}

export function CorreccionesTab({ curso }: CorreccionesTabProps) {
  const [asignaciones, setAsignaciones] = useState<AsignacionResponseDTO[]>([]);
  const [selectedAsignacionId, setSelectedAsignacionId] = useState<number | null>(null);
  const [correcciones, setCorrecciones] = useState<CorreccionGrupoResponseDTO[]>([]);
  const [isLoadingAsignaciones, setIsLoadingAsignaciones] = useState(true);
  const [isLoadingCorrecciones, setIsLoadingCorrecciones] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");

  // Cargar asignaciones del curso al montar
  useEffect(() => {
    let ignore = false;
    setIsLoadingAsignaciones(true);
    setError(null);

    obtenerAsignaciones(curso.id)
      .then((res) => {
        if (!ignore) {
          setAsignaciones(res.data);
          if (res.data.length > 0) {
            setSelectedAsignacionId(res.data[0].id);
          }
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Error al cargar asignaciones:", err);
          setError("No se pudieron cargar las asignaciones del curso.");
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoadingAsignaciones(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [curso.id]);

  // Cargar correcciones de la asignación seleccionada
  const cargarCorrecciones = useCallback(
    async (asignacionId: number) => {
      setIsLoadingCorrecciones(true);
      setError(null);
      try {
        const res = await obtenerCorrecciones(curso.id, asignacionId);
        setCorrecciones(res.data);
      } catch (err: unknown) {
        console.error("Error al cargar correcciones:", err);
        setError("No se pudieron obtener las correcciones de esta asignación.");
      } finally {
        setIsLoadingCorrecciones(false);
      }
    },
    [curso.id]
  );

  useEffect(() => {
    if (selectedAsignacionId) {
      cargarCorrecciones(selectedAsignacionId);
    } else {
      setCorrecciones([]);
    }
  }, [selectedAsignacionId, cargarCorrecciones]);

  const asignacionActual = useMemo(
    () => asignaciones.find((a) => a.id === selectedAsignacionId),
    [asignaciones, selectedAsignacionId]
  );

  // Estadísticas globales de la asignación actual
  const metricas = useMemo(() => {
    let totalCorrecciones = 0;
    let pendientes = 0;
    let actualizados = 0;
    let resueltos = 0;
    let sinCorreccionesGrupos = 0;

    correcciones.forEach((c) => {
      if (c.issues.length === 0) {
        sinCorreccionesGrupos++;
      }
      c.issues.forEach((issue) => {
        totalCorrecciones++;
        const st = (issue.estado || "").toUpperCase();
        if (st === "PENDIENTE") pendientes++;
        else if (st === "ACTUALIZADO") actualizados++;
        else if (st === "RESUELTO") resueltos++;
      });
    });

    const totalGrupos = correcciones.length;
    const sinCorreccionesPct = totalGrupos > 0 ? Math.round((sinCorreccionesGrupos / totalGrupos) * 100) : 0;
    const pendientesPct = totalCorrecciones > 0 ? Math.round((pendientes / totalCorrecciones) * 100) : 0;
    const actualizadosPct = totalCorrecciones > 0 ? Math.round((actualizados / totalCorrecciones) * 100) : 0;
    const resueltosPct = totalCorrecciones > 0 ? Math.round((resueltos / totalCorrecciones) * 100) : 0;

    return {
      totalGrupos,
      totalCorrecciones,
      pendientes,
      actualizados,
      resueltos,
      sinCorreccionesGrupos,
      sinCorreccionesPct,
      pendientesPct,
      actualizadosPct,
      resueltosPct,
    };
  }, [correcciones]);

  // Filtrado de grupos
  const gruposFiltrados = useMemo(() => {
    return correcciones.filter((g) => {
      // Búsqueda por nombre de alumno, grupo o repositorio
      const searchLower = busqueda.trim().toLowerCase();
      const coincideBusqueda =
        !searchLower ||
        (g.nombre && g.nombre.toLowerCase().includes(searchLower)) ||
        g.repoNombre.toLowerCase().includes(searchLower) ||
        g.integrantes.some((i) => i.toLowerCase().includes(searchLower));

      if (!coincideBusqueda) return false;

      // Filtro por estado de correcciones
      if (filtroEstado === "todos") return true;
      if (filtroEstado === "con_correcciones") return g.issues.length > 0;
      if (filtroEstado === "sin_correcciones") return g.issues.length === 0;
      if (filtroEstado === "actualizados")
        return g.issues.some((i) => (i.estado || "").toUpperCase() === "ACTUALIZADO");
      if (filtroEstado === "pendientes")
        return g.issues.some((i) => (i.estado || "").toUpperCase() === "PENDIENTE");
      if (filtroEstado === "resueltos")
        return g.issues.some((i) => (i.estado || "").toUpperCase() === "RESUELTO");

      return true;
    });
  }, [correcciones, busqueda, filtroEstado]);

  const formatFecha = (isoString?: string | null) => {
    if (!isoString) return "-";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const handleCardClick = (estadoTarget: string) => {
    setFiltroEstado((prev) => (prev === estadoTarget ? "todos" : estadoTarget));
  };

  return (
    <div className="space-y-6 animate-rise">
      {/* Encabezado del panel de Correcciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-panel p-5 rounded-2xl border border-line shadow-xs">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">
            Panel de Correcciones
          </h3>
          <p className="font-mono text-xs text-muted-foreground mt-0.5">
            Seguimiento de correcciones por entrega y estado de commits posteriores de los alumnos.
          </p>
        </div>

        {selectedAsignacionId && (
          <button
            type="button"
            onClick={() => cargarCorrecciones(selectedAsignacionId)}
            disabled={isLoadingCorrecciones}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel2 px-3.5 py-2 font-mono text-xs font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs self-start sm:self-auto shrink-0"
            title="Recargar el estado de las correcciones"
          >
            <svg
              className={`w-3.5 h-3.5 ${isLoadingCorrecciones ? "animate-spin text-primary" : "text-muted-foreground"}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>{isLoadingCorrecciones ? "Actualizando..." : "Actualizar correcciones"}</span>
          </button>
        )}
      </div>

      {/* Loading inicial de asignaciones */}
      {isLoadingAsignaciones && (
        <div className="rounded-2xl border border-line bg-panel p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-xs text-muted-foreground">
            Cargando asignaciones del curso...
          </p>
        </div>
      )}

      {/* Si no hay asignaciones creadas */}
      {!isLoadingAsignaciones && asignaciones.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line bg-panel p-12 text-center max-w-lg mx-auto my-6 animate-rise">
          <div className="mx-auto w-12 h-12 rounded-xl bg-line/40 flex items-center justify-center text-xl mb-3 text-muted-foreground">
            📋
          </div>
          <h4 className="font-display text-lg font-bold text-foreground">
            No hay asignaciones en este curso
          </h4>
          <p className="mt-1 font-mono text-xs text-muted-foreground leading-relaxed">
            Para poder gestionar correcciones, primero debes crear al menos una asignación desde la pestaña "Asignaciones".
          </p>
        </div>
      )}

      {/* Si hay asignaciones, mostramos selector y contenido */}
      {!isLoadingAsignaciones && asignaciones.length > 0 && (
        <>
          {/* Selector de Asignación */}
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

          {/* Tarjetas KPI de Estado de Correcciones (Clickeables como filtros) */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Total Correcciones */}
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
                  Total Correcciones
                </span>
                <img src={githubIcon} alt="GitHub" className="w-4 h-4 opacity-60" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-suez text-3xl font-bold text-foreground">
                  {metricas.totalCorrecciones}
                </span>
                <span className="font-mono text-xs text-muted-foreground">correcciones</span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                En {metricas.totalGrupos} {metricas.totalGrupos === 1 ? "repositorio" : "repositorios"}
              </p>
            </button>

            {/* Sin Correcciones */}
            <button
              type="button"
              onClick={() => handleCardClick("sin_correcciones")}
              className={`rounded-xl border p-4 shadow-xs text-left cursor-pointer transition-all duration-150 hover:scale-[1.02] hover:shadow-md ${
                filtroEstado === "sin_correcciones"
                  ? "border-neutral-500 ring-2 ring-neutral-500/30 bg-neutral-200 shadow-sm"
                  : "border-line bg-neutral-200 hover:border-neutral-400"
              }`}
              title="Click para filtrar repositorios sin correcciones"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Sin Correcciones
                </span>
                <span className="w-2 h-2 rounded-full bg-neutral-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-suez text-3xl font-bold text-foreground">
                  {metricas.sinCorreccionesGrupos}
                </span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                {metricas.sinCorreccionesPct}% de los repos
              </p>
            </button>

            {/* Pendientes */}
            <button
              type="button"
              onClick={() => handleCardClick("pendientes")}
              className={`rounded-xl border p-4 shadow-xs text-left cursor-pointer transition-all duration-150 hover:scale-[1.02] hover:shadow-md ${
                filtroEstado === "pendientes"
                  ? "border-amber-500 ring-2 ring-amber-500/40 bg-amber-100 shadow-sm"
                  : "border-line bg-amber-100 hover:border-amber-400"
              }`}
              title="Click para filtrar correcciones pendientes"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Pendientes
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-suez text-3xl font-bold text-foreground">
                  {metricas.pendientes}
                </span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                {metricas.pendientesPct}% del total (sin commits)
              </p>
            </button>

            {/* Actualizadas */}
            <button
              type="button"
              onClick={() => handleCardClick("actualizados")}
              className={`rounded-xl border p-4 shadow-xs text-left cursor-pointer transition-all duration-150 hover:scale-[1.02] hover:shadow-md ${
                filtroEstado === "actualizados"
                  ? "border-sky-500 ring-2 ring-sky-500/40 bg-sky-500/10 shadow-sm"
                  : "border-sky-500/20 bg-sky-500/5 hover:border-sky-500/40"
              }`}
              title="Click para filtrar correcciones actualizadas"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-sky-700 dark:text-sky-300">
                  Actualizadas
                </span>
                <span className="w-2 h-2 rounded-full bg-sky-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-suez text-3xl font-bold text-sky-600 dark:text-sky-400">
                  {metricas.actualizados}
                </span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-sky-700/80 dark:text-sky-300/80">
                {metricas.actualizadosPct}% del total (con commits)
              </p>
            </button>

            {/* Resueltas */}
            <button
              type="button"
              onClick={() => handleCardClick("resueltos")}
              className={`rounded-xl border p-4 shadow-xs text-left cursor-pointer transition-all duration-150 hover:scale-[1.02] hover:shadow-md ${
                filtroEstado === "resueltos"
                  ? "border-emerald-500 ring-2 ring-emerald-500/40 bg-emerald-500/10 shadow-sm"
                  : "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40"
              }`}
              title="Click para filtrar correcciones resueltas"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Resueltas
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-suez text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {metricas.resueltos}
                </span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
                {metricas.resueltosPct}% del total (cerradas)
              </p>
            </button>
          </div>

          {/* Controles de Búsqueda y Filtro de Correcciones */}
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
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por repositorio, alumno o grupo..."
                  className="w-full rounded-lg border border-line bg-background pl-9 pr-3 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Filtro por estado pegado a la search bar */}
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="rounded-lg border border-line bg-background px-3 py-1.5 font-mono text-xs text-foreground focus:outline-none cursor-pointer"
              >
                <option value="todos">Todos los repositorios ({correcciones.length})</option>
                <option value="actualizados">Con correcciones actualizadas</option>
                <option value="pendientes">Con correcciones pendientes</option>
                <option value="resueltos">Con correcciones resueltas</option>
                <option value="con_correcciones">Solo con correcciones</option>
                <option value="sin_correcciones">Sin correcciones</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                {gruposFiltrados.length} {gruposFiltrados.length === 1 ? "repo" : "repos"}
              </span>
            </div>
          </div>

          {/* Mensaje de Error si falla la consulta de correcciones */}
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-center">
              <p className="text-xs font-mono text-destructive">{error}</p>
            </div>
          )}

          {/* Spinner de carga de correcciones */}
          {isLoadingCorrecciones && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="font-mono text-xs text-muted-foreground">
                Consultando correcciones desde GitHub y base de datos...
              </p>
            </div>
          )}

          {/* Listado de Repositorios con sus Correcciones */}
          {!isLoadingCorrecciones && (
            <>
              {gruposFiltrados.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-line bg-panel p-10 text-center animate-rise">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-line/40 flex items-center justify-center text-xl mb-3 text-muted-foreground">
                    🔍
                  </div>
                  <h4 className="font-display text-base font-bold text-foreground">
                    No se encontraron repositorios
                  </h4>
                  <p className="mt-1 font-mono text-xs text-muted-foreground leading-relaxed">
                    Probá cambiando el texto de búsqueda o el filtro seleccionado.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {gruposFiltrados.map((grupo) => {
                    const allIssuesUrl = getGitHubIssuesUrl(grupo.repoNombre);
                    const totalGrupoCorrecciones = grupo.issues.length;
                    const newIssueUrl = getGitHubNewIssueUrl(
                      grupo.repoNombre,
                      asignacionActual?.titulo
                        ? `[Corrección] ${asignacionActual.titulo}`
                        : "[Corrección]"
                    );

                    return (
                      <div
                        key={grupo.grupoId}
                        className="rounded-2xl border border-line bg-panel p-5 shadow-xs space-y-4 transition-all hover:border-foreground/20 animate-rise"
                      >
                        {/* Cabecera del Grupo/Repo */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-line/60">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Nombre de Grupo o Alumno */}
                              <h4 className="font-display text-base font-bold text-foreground">
                                {grupo.nombre || (grupo.integrantes.length === 1 ? `@${grupo.integrantes[0]}` : "Grupo")}
                              </h4>

                              {/* Badge con cantidad de correcciones */}
                              <span className="font-mono text-[11px] px-2 py-0.5 rounded-full border border-line bg-panel2 text-muted-foreground">
                                {totalGrupoCorrecciones} {totalGrupoCorrecciones === 1 ? "corrección" : "correcciones"}
                              </span>
                            </div>

                            {/* Integrantes y Repositorio */}
                            <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
                              {grupo.integrantes.length > 0 && (
                                <span>
                                  Integrantes:{" "}
                                  <strong className="text-foreground font-medium">
                                    {grupo.integrantes.map((i) => `@${i}`).join(", ")}
                                  </strong>
                                </span>
                              )}
                              <span>•</span>
                              <span className="text-foreground font-medium truncate max-w-xs sm:max-w-md">
                                {grupo.repoNombre}
                              </span>
                            </div>
                          </div>

                          {/* Botones de acción directos a GitHub */}
                          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                            <a
                              href={allIssuesUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel2 px-3 py-1.5 font-mono text-xs font-semibold text-foreground hover:bg-line/40 transition-colors shadow-2xs"
                              title="Ver correcciones en GitHub"
                            >
                              <img src={githubIcon} alt="GitHub" className="w-3.5 h-3.5 opacity-80" />
                              <span>Ver todos en GitHub ({totalGrupoCorrecciones})</span>
                              <span className="text-[10px] text-muted-foreground">↗</span>
                            </a>

                            <a
                              href={newIssueUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 font-mono text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-xs"
                              title="Crear una nueva corrección en el repositorio de GitHub"
                            >
                              <span>+ Crear corrección</span>
                              <span className="text-[10px]">↗</span>
                            </a>
                          </div>
                        </div>

                        {/* Lista de Correcciones dentro del grupo */}
                        {grupo.issues.length === 0 ? (
                          <div className="p-4 rounded-xl border border-line/60 bg-panel2/40 text-center font-mono text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-3">
                            <span>Aún no se crearon correcciones en este repositorio.</span>
                          </div>
                        ) : (
                          <div className="divide-y divide-line/60 rounded-xl border border-line bg-panel2/30 overflow-hidden font-mono text-xs">
                            {grupo.issues.map((issue: IssueResponseDTO) => (
                              <div
                                key={issue.numero}
                                className="p-3.5 hover:bg-line/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                              >
                                <div className="space-y-1.5 min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold text-muted-foreground">
                                      #{issue.numero}
                                    </span>
                                    <a
                                      href={issue.htmlUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-semibold text-foreground hover:text-primary hover:underline break-words"
                                      title={issue.titulo}
                                    >
                                      {issue.titulo}
                                    </a>
                                    <IssueEstadoBadge estado={issue.estado} />
                                    {issue.tieneCommitsPosteriores && (
                                      <span
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                        title="El alumno hizo commits posteriores a la creación de esta corrección"
                                      >
                                        <span>⚡ Commits posteriores detectados</span>
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                                    <span>Por @{issue.autor}</span>
                                    <span>•</span>
                                    <span>Creada: {formatFecha(issue.fechaCreacion)}</span>
                                    {issue.fechaCierre && (
                                      <>
                                        <span>•</span>
                                        <span>Cerrada: {formatFecha(issue.fechaCierre)}</span>
                                      </>
                                    )}
                                    {issue.cantComentarios > 0 && (
                                      <>
                                        <span>•</span>
                                        <span className="font-medium text-foreground">
                                          💬 {issue.cantComentarios} {issue.cantComentarios === 1 ? "comentario" : "comentarios"}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="shrink-0 self-end sm:self-center">
                                  <a
                                    href={issue.htmlUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 rounded-md border border-line bg-panel px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-line/50 transition-colors shadow-2xs"
                                  >
                                    <img src={githubIcon} alt="GitHub" className="w-3.5 h-3.5 opacity-80" />
                                    <span>Ver en GitHub</span>
                                    <span className="text-[10px]">↗</span>
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
