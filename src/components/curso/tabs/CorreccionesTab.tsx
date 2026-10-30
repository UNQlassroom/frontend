import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type {
  CursoResponseDTO,
  CorreccionGrupoResponseDTO,
  AsignacionResponseDTO,
  IssueResponseDTO,
} from "@/types";
import { obtenerAsignaciones, obtenerCorrecciones } from "@/services";
import { IssueEstadoBadge, KpiCard, EmptyState, ErrorBanner } from "@/components/common";
import { PanelHeader, PanelFilterBar } from "@/components/panel";
import githubIcon from "@/assets/github_favicon.svg";
import { getGitHubNewIssueUrl, getGitHubIssuesUrl } from "@/utils";

export interface CorreccionesTabProps {
  curso: CursoResponseDTO;
}

export function CorreccionesTab({ curso }: CorreccionesTabProps) {
  const [, setSearchParams] = useSearchParams();
  const [asignaciones, setAsignaciones] = useState<AsignacionResponseDTO[]>([]);
  const [selectedAsignacionId, setSelectedAsignacionId] = useState<number | null>(
    null
  );
  const [correcciones, setCorrecciones] = useState<
    CorreccionGrupoResponseDTO[]
  >([]);
  const [isLoadingAsignaciones, setIsLoadingAsignaciones] = useState(true);
  const [isLoadingCorrecciones, setIsLoadingCorrecciones] = useState(false);
  const [isRecargando, setIsRecargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");

  // Cargar asignaciones del curso al montar o ante reintento manual
  const cargarAsignaciones = useCallback(async () => {
    setIsLoadingAsignaciones(true);
    setError(null);
    try {
      const res = await obtenerAsignaciones(curso.id);
      setAsignaciones(res.data);
      if (res.data.length > 0) {
        setSelectedAsignacionId(res.data[0].id);
      } else {
        setSelectedAsignacionId(null);
      }
    } catch {
      setError("No se pudieron cargar las asignaciones del curso.");
    } finally {
      setIsLoadingAsignaciones(false);
    }
  }, [curso.id]);

  useEffect(() => {
    let ignore = false;
    obtenerAsignaciones(curso.id)
      .then((res) => {
        if (!ignore) {
          setAsignaciones(res.data);
          if (res.data.length > 0) {
            setSelectedAsignacionId(res.data[0].id);
          } else {
            setSelectedAsignacionId(null);
          }
        }
      })
      .catch(() => {
        if (!ignore) {
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

  // Cargar correcciones de la asignación seleccionada (y refrescar estado de asignaciones)
  const cargarCorrecciones = useCallback(
    async (asignacionId: number) => {
      setIsRecargando(true);
      setError(null);
      try {
        // Garantizamos un tiempo mínimo de 600ms para que la animación de recarga sea perceptible
        const [asigRes, corrRes] = await Promise.all([
          obtenerAsignaciones(curso.id),
          obtenerCorrecciones(curso.id, asignacionId),
          new Promise((resolve) => setTimeout(resolve, 600)),
        ]);
        setAsignaciones(asigRes.data);
        setCorrecciones(corrRes.data);
      } catch {
        setError("No se pudieron obtener las correcciones de esta asignación.");
      } finally {
        setIsRecargando(false);
      }
    },
    [curso.id]
  );

  const handleSelectAsignacion = (asignacionId: number) => {
    if (asignacionId === selectedAsignacionId) return;
    setSelectedAsignacionId(asignacionId);
    const targetAsig = asignaciones.find((a) => a.id === asignacionId);
    if (targetAsig?.estado === "CREANDO" || targetAsig?.estado === "ERROR") {
      setIsLoadingCorrecciones(false);
      setError(null);
      setCorrecciones([]);
      return;
    }
    setIsLoadingCorrecciones(true);
    setError(null);
    setCorrecciones([]);
  };

  const asignacionActual = useMemo(
    () => asignaciones.find((a) => a.id === selectedAsignacionId),
    [asignaciones, selectedAsignacionId]
  );

  const hayAsignacionesCreando = useMemo(
    () => asignaciones.some((a) => a.estado === "CREANDO"),
    [asignaciones]
  );

  // Polling silencioso mientras existan asignaciones creando sus repositorios en segundo plano
  useEffect(() => {
    if (!hayAsignacionesCreando) return;

    const intervalId = window.setInterval(() => {
      obtenerAsignaciones(curso.id)
        .then((res) => {
          setAsignaciones(res.data);
        })
        .catch(() => {
          // Ignorar errores puntuales de polling silencioso
        });
    }, 8000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [curso.id, hayAsignacionesCreando]);

  useEffect(() => {
    if (!selectedAsignacionId) return;
    if (
      asignacionActual?.estado === "CREANDO" ||
      asignacionActual?.estado === "ERROR"
    ) {
      return;
    }

    let ignore = false;

    obtenerCorrecciones(curso.id, selectedAsignacionId)
      .then((res) => {
        if (!ignore) {
          setCorrecciones(res.data);
        }
      })
      .catch(() => {
        if (!ignore) {
          setError("No se pudieron obtener las correcciones de esta asignación.");
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoadingCorrecciones(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [curso.id, selectedAsignacionId, asignacionActual?.estado]);

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
    const sinCorreccionesPct =
      totalGrupos > 0
        ? Math.round((sinCorreccionesGrupos / totalGrupos) * 100)
        : 0;
    const pendientesPct =
      totalCorrecciones > 0
        ? Math.round((pendientes / totalCorrecciones) * 100)
        : 0;
    const actualizadosPct =
      totalCorrecciones > 0
        ? Math.round((actualizados / totalCorrecciones) * 100)
        : 0;
    const resueltosPct =
      totalCorrecciones > 0
        ? Math.round((resueltos / totalCorrecciones) * 100)
        : 0;

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
      const searchLower = busqueda.trim().toLowerCase();
      const coincideBusqueda =
        !searchLower ||
        (g.nombre && g.nombre.toLowerCase().includes(searchLower)) ||
        g.repoNombre.toLowerCase().includes(searchLower) ||
        g.integrantes.some((i) => i.toLowerCase().includes(searchLower));

      if (!coincideBusqueda) return false;

      if (filtroEstado === "todos") return true;
      if (filtroEstado === "con_correcciones") return g.issues.length > 0;
      if (filtroEstado === "sin_correcciones") return g.issues.length === 0;
      if (filtroEstado === "actualizados")
        return g.issues.some(
          (i) => (i.estado || "").toUpperCase() === "ACTUALIZADO"
        );
      if (filtroEstado === "pendientes")
        return g.issues.some(
          (i) => (i.estado || "").toUpperCase() === "PENDIENTE"
        );
      if (filtroEstado === "resueltos")
        return g.issues.some(
          (i) => (i.estado || "").toUpperCase() === "RESUELTO"
        );

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

  const isActualizando = isRecargando || isLoadingCorrecciones;

  return (
    <div className="space-y-6 animate-rise">
      {/* Encabezado del panel de Correcciones */}
      <PanelHeader
        title="Panel de Correcciones"
        description="Seguimiento de correcciones por entrega y estado de commits posteriores de los alumnos."
        actions={
          selectedAsignacionId ? (
            <button
              type="button"
              onClick={() => cargarCorrecciones(selectedAsignacionId)}
              disabled={isActualizando || isLoadingAsignaciones}
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel2 px-4 py-2 text-sm font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
              title="Actualizar el estado de las correcciones"
            >
              <svg
                className={`w-4 h-4 ${
                  isActualizando
                    ? "animate-spin text-primary"
                    : "text-muted-foreground"
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
              <span>
                {isActualizando
                  ? "Actualizando..."
                  : "Actualizar correcciones"}
              </span>
            </button>
          ) : null
        }
      />

      {/* Loading inicial de asignaciones */}
      {isLoadingAsignaciones && (
        <div className="rounded-2xl border border-line bg-panel p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">
            Cargando asignaciones del curso...
          </p>
        </div>
      )}

      {/* Error al cargar asignaciones */}
      {!isLoadingAsignaciones && error && asignaciones.length === 0 && (
        <ErrorBanner message={error} onRetry={cargarAsignaciones} />
      )}

      {/* Si no hay asignaciones creadas */}
      {!isLoadingAsignaciones && !error && asignaciones.length === 0 && (
        <EmptyState
          icon="📋"
          title="No hay asignaciones en este curso"
          description='Para poder gestionar correcciones, primero debes crear al menos una asignación desde la pestaña "Asignaciones".'
        />
      )}

      {/* Si hay asignaciones, mostramos selector y contenido */}
      {!isLoadingAsignaciones && asignaciones.length > 0 && (
        <>
          {/* Selector de Asignación */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-line">
            <span className="text-sm font-semibold text-muted-foreground shrink-0 mr-1">
              Asignación:
            </span>
            {asignaciones.map((asig) => {
              const isSelected = asig.id === selectedAsignacionId;
              return (
                <button
                  key={asig.id}
                  type="button"
                  onClick={() => handleSelectAsignacion(asig.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer shrink-0 ${
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
                  {asig.estado === "CREANDO" && (
                    <span
                      className="w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0"
                      title="Creando repositorios en GitHub..."
                    />
                  )}
                  {asig.estado === "ERROR" && (
                    <span title="Error al crear repositorios en GitHub">⚠️</span>
                  )}
                </button>
              );
            })}
          </div>

          {asignacionActual?.estado === "CREANDO" ? (
            <>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center gap-3 text-xs sm:text-sm">
                <div className="w-4 h-4 border-2 border-amber-600 dark:border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
                <p className="text-muted-foreground">
                  <strong className="text-amber-700 dark:text-amber-300">
                    Creando repositorios en GitHub:
                  </strong>{" "}
                  Los repositorios de esta asignación se están generando en segundo plano y pueden demorar unos momentos en estar listos.
                </p>
              </div>
              <EmptyState
                icon="⏳"
                title="Creando repositorios en GitHub..."
                description="La asignación fue creada y sus repositorios se están generando en segundo plano. Esto puede demorar unos momentos. El estado se actualizará automáticamente."
              />
            </>
          ) : asignacionActual?.estado === "ERROR" ? (
            <ErrorBanner
              title="Ocurrió un error al crear los repositorios en GitHub"
              message="Ocurrió un error al generar los repositorios en GitHub para esta asignación. Te recomendamos eliminarla desde la pestaña Asignaciones y volver a crearla."
              onRetry={() => setSearchParams({ tab: "asignaciones" })}
              retryText="Ir a Asignaciones"
            />
          ) : (
            <>
              {/* Tarjetas KPI de Estado de Correcciones */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Total Correcciones */}
            <KpiCard
              label="Total Correcciones"
              value={metricas.totalCorrecciones}
              unit="correcciones"
              subtext={`En ${metricas.totalGrupos} ${
                metricas.totalGrupos === 1 ? "repositorio" : "repositorios"
              }`}
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

            {/* Sin Correcciones */}
            <KpiCard
              label="Sin Correcciones"
              value={metricas.sinCorreccionesGrupos}
              subtext={`${metricas.sinCorreccionesPct}% de los repos`}
              variant="neutral"
              isSelected={filtroEstado === "sin_correcciones"}
              onClick={() => handleCardClick("sin_correcciones")}
              title="Click para filtrar repositorios sin correcciones"
            />

            {/* Pendientes */}
            <KpiCard
              label="Pendientes"
              value={metricas.pendientes}
              subtext={`${metricas.pendientesPct}% del total`}
              variant="amber"
              isSelected={filtroEstado === "pendientes"}
              onClick={() => handleCardClick("pendientes")}
              title="Click para filtrar correcciones pendientes"
            />

            {/* Actualizadas */}
            <KpiCard
              label="Actualizadas"
              value={metricas.actualizados}
              subtext={`${metricas.actualizadosPct}% del total`}
              variant="sky"
              isSelected={filtroEstado === "actualizados"}
              onClick={() => handleCardClick("actualizados")}
              title="Click para filtrar correcciones actualizadas"
            />

            {/* Resueltas */}
            <KpiCard
              label="Resueltas"
              value={metricas.resueltos}
              subtext={`${metricas.resueltosPct}% del total`}
              variant="emerald"
              isSelected={filtroEstado === "resueltos"}
              onClick={() => handleCardClick("resueltos")}
              title="Click para filtrar correcciones resueltas"
            />
          </div>

          {/* Controles de Búsqueda y Filtro de Correcciones */}
          <PanelFilterBar
            searchTerm={busqueda}
            onSearchChange={setBusqueda}
            searchPlaceholder="Buscar por repositorio, alumno o grupo..."
            count={gruposFiltrados.length}
            countLabel={gruposFiltrados.length === 1 ? "repo" : "repos"}
          >
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="rounded-xl border border-line bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none cursor-pointer"
            >
              <option value="todos">
                Todos los repositorios ({correcciones.length})
              </option>
              <option value="actualizados">Con correcciones actualizadas</option>
              <option value="pendientes">Con correcciones pendientes</option>
              <option value="resueltos">Con correcciones resueltas</option>
              <option value="con_correcciones">Solo con correcciones</option>
              <option value="sin_correcciones">Sin correcciones</option>
            </select>
          </PanelFilterBar>

          {/* Mensaje de Error si falla la consulta de correcciones de la asignación */}
          {error && (
            <ErrorBanner
              message={error}
              onRetry={selectedAsignacionId ? () => cargarCorrecciones(selectedAsignacionId) : undefined}
              retryText="Reintentar correcciones"
            />
          )}

          {/* Spinner de carga de correcciones */}
          {isLoadingCorrecciones && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">
                Consultando correcciones desde GitHub...
              </p>
            </div>
          )}

          {/* Listado de Repositorios con sus Correcciones */}
          {!isLoadingCorrecciones && (
            <>
              {gruposFiltrados.length === 0 ? (
                <EmptyState
                  icon="🔍"
                  title="No se encontraron repositorios"
                  description="Probá cambiando el texto de búsqueda o el filtro seleccionado."
                />
              ) : (
                <div
                  className={`space-y-4 transition-all duration-300 ${
                    isRecargando ? "opacity-50 pointer-events-none" : "opacity-100"
                  }`}
                >
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
                        className="rounded-2xl border border-line bg-panel p-6 sm:p-7 shadow-xs space-y-4.5 transition-all hover:border-foreground/20 animate-rise"
                      >
                        {/* Cabecera del Grupo/Repo */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3.5 border-b border-line/60">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Nombre de Grupo o Alumno */}
                              <h4 className="font-display text-lg sm:text-xl font-bold text-foreground">
                                {grupo.nombre ||
                                  (grupo.integrantes.length === 1
                                    ? `@${grupo.integrantes[0]}`
                                    : "Grupo")}
                              </h4>

                              {/* Badge con cantidad de correcciones */}
                              <span className="text-xs px-2.5 py-0.5 rounded-full border border-line bg-panel2 text-muted-foreground font-semibold">
                                {totalGrupoCorrecciones}{" "}
                                {totalGrupoCorrecciones === 1
                                  ? "corrección"
                                  : "correcciones"}
                              </span>
                            </div>

                            {/* Integrantes y Repositorio */}
                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                              {grupo.integrantes.length > 0 && (
                                <span>
                                  Integrantes:{" "}
                                  <strong className="text-foreground font-medium">
                                    {grupo.integrantes
                                      .map((i) => `@${i}`)
                                      .join(", ")}
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
                          <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
                            <a
                              href={allIssuesUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel2 px-3.5 py-2 text-sm font-semibold text-foreground hover:bg-line/40 transition-colors shadow-2xs"
                              title="Ver correcciones en GitHub"
                            >
                              <img
                                src={githubIcon}
                                alt="GitHub"
                                className="w-4 h-4 opacity-80"
                              />
                              <span>Ver todos en GitHub ({totalGrupoCorrecciones})</span>
                              <span className="text-xs text-muted-foreground">
                                ↗
                              </span>
                            </a>

                            <a
                              href={newIssueUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-xs"
                              title="Crear una nueva corrección en el repositorio de GitHub"
                            >
                              <span>+ Crear corrección</span>
                              <span className="text-xs">↗</span>
                            </a>
                          </div>
                        </div>

                        {/* Lista de Correcciones dentro del grupo */}
                        {grupo.issues.length === 0 ? (
                          <div className="p-4 sm:p-5 rounded-xl border border-line/60 bg-panel2/40 text-center text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-3">
                            <span>
                              Aún no se crearon correcciones en este repositorio.
                            </span>
                            <a
                              href={newIssueUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline font-semibold text-sm inline-flex items-center gap-1"
                            >
                              Crear la primera corrección ↗
                            </a>
                          </div>
                        ) : (
                          <div className="divide-y divide-line/60 rounded-xl border border-line bg-panel2/30 overflow-hidden text-sm">
                            {grupo.issues.map((issue: IssueResponseDTO) => (
                              <div
                                key={issue.numero}
                                className="p-3.5 sm:p-4 hover:bg-line/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
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
                                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                        title="El alumno hizo commits posteriores a la creación de esta corrección"
                                      >
                                        <span>⚡ Commits posteriores detectados</span>
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <span>Por @{issue.autor}</span>
                                    <span>•</span>
                                    <span>
                                      Creada: {formatFecha(issue.fechaCreacion)}
                                    </span>
                                    {issue.fechaCierre && (
                                      <>
                                        <span>•</span>
                                        <span>
                                          Cerrada: {formatFecha(issue.fechaCierre)}
                                        </span>
                                      </>
                                    )}
                                    {issue.cantComentarios > 0 && (
                                      <>
                                        <span>•</span>
                                        <span className="font-medium text-foreground">
                                          💬 {issue.cantComentarios}{" "}
                                          {issue.cantComentarios === 1
                                            ? "comentario"
                                            : "comentarios"}
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
                                    className="inline-flex items-center gap-1.5 rounded-md border border-line bg-panel px-3 py-1.5 text-xs sm:text-sm font-semibold text-foreground hover:bg-line/50 transition-colors shadow-2xs"
                                  >
                                    <img
                                        src={githubIcon}
                                        alt="GitHub"
                                        className="w-4 h-4 opacity-80"
                                    />
                                    <span>Ver en GitHub</span>
                                    <span className="text-xs">↗</span>
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
        </>
      )}
    </div>
  );
}
