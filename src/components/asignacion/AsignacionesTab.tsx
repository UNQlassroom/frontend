import { useState, useEffect, useCallback, useMemo } from "react";
import type {
  AlumnoMiembroDeUnCursoDTO,
  AsignacionResponseDTO,
  GrupoAsignacionResponseDTO,
  CursoResponseDTO,
  TemplateRepoResponseDTO,
} from "@/types";
import { obtenerAsignaciones, listarTemplates } from "@/services";
import { CrearAsignacionModal } from "./CrearAsignacionModal";
import { CalificarAsignacionModal } from "./CalificarAsignacionModal";
import { CIStatusBadge, EmptyState } from "../common";
import { PanelHeader, PanelFilterBar } from "../panel";
import {
  formatearFechaCommit,
  obtenerPrimerLineaCommit,
} from "@/utils";
import circleAddIcon from "@/assets/circle_add_favicon.svg";
import githubIcon from "@/assets/github_favicon.svg";

interface AsignacionesTabProps {
  curso: CursoResponseDTO;
  alumnos: AlumnoMiembroDeUnCursoDTO[];
}

export function AsignacionesTab({ curso, alumnos }: AsignacionesTabProps) {
  const [asignaciones, setAsignaciones] = useState<AsignacionResponseDTO[]>([]);
  const [templates, setTemplates] = useState<TemplateRepoResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedAsigId, setExpandedAsigId] = useState<number | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");

  const [calificarModal, setCalificarModal] = useState<{
    open: boolean;
    asignacionId: number;
    asignacionTitulo: string;
    grupo: GrupoAsignacionResponseDTO | null;
  }>({
    open: false,
    asignacionId: 0,
    asignacionTitulo: "",
    grupo: null,
  });

  const cargarAsignaciones = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await obtenerAsignaciones(curso.id);
      setAsignaciones(response.data);
      if (response.data.length > 0) {
        setExpandedAsigId((prev) => (prev === null ? response.data[0].id : prev));
      }
    } catch (err: unknown) {
      console.error("Error al cargar asignaciones:", err);
      setError("No se pudieron cargar las asignaciones del curso.");
    } finally {
      setIsLoading(false);
    }
  }, [curso.id]);

  useEffect(() => {
    let ignore = false;
    obtenerAsignaciones(curso.id)
      .then((res) => {
        if (!ignore) {
          setAsignaciones(res.data);
          if (res.data.length > 0) {
            setExpandedAsigId(res.data[0].id);
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
          setIsLoading(false);
        }
      });

    listarTemplates()
      .then((res) => {
        if (!ignore) {
          setTemplates(res.data);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.warn("No se pudieron cargar repositorios plantillas:", err);
        }
      });

    return () => {
      ignore = true;
    };
  }, [curso.id]);

  const toggleExpand = (asigId: number) => {
    setExpandedAsigId((prev) => (prev === asigId ? null : asigId));
  };

  const getTemplateUrl = (templateRepoName: string) => {
    const found = templates.find((t) => t.name === templateRepoName);
    if (found?.htmlUrl) return found.htmlUrl;
    return `https://github.com/UNQlassroom/${templateRepoName}`;
  };

  const handleCalificacionExitosa = (
    asignacionActualizada: AsignacionResponseDTO
  ) => {
    setAsignaciones((prev) =>
      prev.map((asig) =>
        asig.id === asignacionActualizada.id ? asignacionActualizada : asig
      )
    );
  };

  // Métricas
  const totalAsignaciones = asignaciones.length;
  const individualesCount = useMemo(
    () => asignaciones.filter((a) => a.tipo === "INDIVIDUAL").length,
    [asignaciones]
  );
  const grupalesCount = useMemo(
    () => asignaciones.filter((a) => a.tipo === "GRUPAL").length,
    [asignaciones]
  );

  // Filtrado de asignaciones
  const asignacionesFiltradas = useMemo(() => {
    return asignaciones.filter((asig) => {
      const matchTexto =
        asig.titulo.toLowerCase().includes(busqueda.toLowerCase().trim()) ||
        (asig.descripcion &&
          asig.descripcion.toLowerCase().includes(busqueda.toLowerCase().trim())) ||
        (asig.templateRepoName &&
          asig.templateRepoName.toLowerCase().includes(busqueda.toLowerCase().trim()));

      if (!matchTexto) return false;

      if (filtroTipo === "todos") return true;
      return asig.tipo === filtroTipo;
    });
  }, [asignaciones, busqueda, filtroTipo]);

  return (
    <div className="space-y-6 animate-rise">
      {/* Encabezado del Panel de Asignaciones */}
      <PanelHeader
        title="Panel de Asignaciones"
        description="Crea y administra asignaciones individuales o grupales integradas con GitHub y seguimiento de entregas."
        actions={
          <>
            <button
              type="button"
              onClick={cargarAsignaciones}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel2 px-4 py-2 font-mono text-sm font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
              title="Recargar asignaciones del curso"
            >
              <svg
                className={`w-3.5 h-3.5 ${
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
              <span>{isLoading ? "Actualizando..." : "Actualizar asignaciones"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-mono text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              title="Crear una nueva asignación"
            >
              <img
                src={circleAddIcon}
                alt="Crear"
                className="w-3.5 h-3.5 brightness-0 invert"
              />
              <span>Crear asignación</span>
            </button>
          </>
        }
      />

      {/* Loading State */}
      {isLoading && (
        <div className="rounded-2xl border border-line bg-panel p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-xs text-muted-foreground">
            Cargando asignaciones del curso...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-xs font-mono text-destructive mb-3">{error}</p>
          <button
            type="button"
            onClick={cargarAsignaciones}
            className="rounded-lg bg-destructive px-4 py-2 font-mono text-xs font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Empty state si no hay asignaciones creadas */}
      {!isLoading && !error && asignaciones.length === 0 && (
        <EmptyState
          icon="📚"
          title="No hay asignaciones en este curso"
          description="Aún no se han creado asignaciones para este curso. Puedes crear la primera asignación haciendo clic en el botón a continuación."
          action={
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-mono text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              <img
                src={circleAddIcon}
                alt="Crear"
                className="w-3.5 h-3.5 brightness-0 invert"
              />
              <span>Crear primera asignación</span>
            </button>
          }
        />
      )}

      {/* Si hay asignaciones, mostramos KPIs, Filtros y Lista */}
      {!isLoading && !error && asignaciones.length > 0 && (
        <>
          {/* Barra de Filtros y Búsqueda */}
          <PanelFilterBar
            searchTerm={busqueda}
            onSearchChange={setBusqueda}
            searchPlaceholder="Buscar por título, descripción o plantilla..."
            count={asignacionesFiltradas.length}
            countLabel={
              asignacionesFiltradas.length === 1 ? "asignación" : "asignaciones"
            }
          >
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="rounded-lg border border-line bg-background px-3 py-1.5 font-mono text-xs text-foreground focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos los tipos ({totalAsignaciones})</option>
              <option value="INDIVIDUAL">Solo individuales ({individualesCount})</option>
              <option value="GRUPAL">Solo grupales ({grupalesCount})</option>
            </select>
          </PanelFilterBar>

          {/* Listado de Asignaciones */}
          {asignacionesFiltradas.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No se encontraron asignaciones"
              description="No hay asignaciones que coincidan con la búsqueda o el filtro aplicado."
              action={
                <button
                  type="button"
                  onClick={() => {
                    setBusqueda("");
                    setFiltroTipo("todos");
                  }}
                  className="rounded-lg border border-line bg-panel2 px-4 py-2 font-mono text-xs font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer"
                >
                  Restablecer filtros
                </button>
              }
            />
          ) : (
            <div className="space-y-4">
              {asignacionesFiltradas.map((asig) => {
                const isExpanded = expandedAsigId === asig.id;
                const totalGrupos = asig.grupos?.length || 0;
                const templateUrl = getTemplateUrl(asig.templateRepoName);

                return (
                  <div
                    key={asig.id}
                    className="rounded-2xl border border-line bg-panel p-6 shadow-xs transition-colors space-y-5 hover:border-foreground/20"
                  >
                    {/* Header de la Asignación */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 font-mono text-xs font-semibold ${
                              asig.tipo === "GRUPAL"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                            }`}
                          >
                            {asig.tipo === "GRUPAL" ? "Grupal" : "Individual"}
                          </span>

                          {/* Enlace al repositorio plantilla */}
                          <a
                            href={templateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel2 px-3 py-1 font-mono text-xs text-muted-foreground hover:text-foreground hover:bg-line/40 transition-colors group cursor-pointer"
                            title={`Ver repositorio plantilla ${asig.templateRepoName} en GitHub`}
                          >
                            <img
                              src={githubIcon}
                              alt="Repo"
                              className="w-4 h-4 opacity-80"
                            />
                            <span>Plantilla:</span>
                            <span className="font-semibold text-foreground underline decoration-muted-foreground/40 group-hover:decoration-foreground">
                              {asig.templateRepoName}
                            </span>
                            <span className="text-xs text-muted-foreground group-hover:text-foreground">
                              ↗
                            </span>
                          </a>

                          {asig.fechaLimite && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel2 px-3 py-1 font-mono text-xs text-muted-foreground">
                              <span>Fecha límite:</span>
                              <span className="font-semibold text-foreground">
                                {new Date(asig.fechaLimite).toLocaleDateString(
                                  "es-AR",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  }
                                )}
                              </span>
                            </span>
                          )}
                        </div>

                        <h4 className="font-display text-2xl font-bold text-foreground">
                          {asig.titulo}
                        </h4>
                        {asig.descripcion && (
                          <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                            {asig.descripcion}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-sm text-muted-foreground">
                          {totalGrupos}{" "}
                          {asig.tipo === "GRUPAL" ? "grupo(s)" : "repositorio(s)"}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleExpand(asig.id)}
                          className="rounded-xl border border-line bg-panel2 px-4 py-2 font-mono text-sm font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer"
                        >
                          {isExpanded
                            ? "Ocultar repositorios ▲"
                            : "Ver repositorios ▼"}
                        </button>
                      </div>
                    </div>

                    {/* Detalle desplegable de los repositorios y grupos */}
                    {isExpanded && (
                      <div className="pt-4 border-t border-line space-y-3.5">
                        <h5 className="font-mono text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                          Repositorios generados ({totalGrupos})
                        </h5>

                        {totalGrupos === 0 ? (
                          <p className="font-mono text-sm text-muted-foreground italic">
                            No hay repositorios asociados a esta asignación todavía.
                          </p>
                        ) : (
                          <div className="overflow-x-auto rounded-2xl border border-line bg-panel2/60">
                            <table className="w-full text-left border-collapse font-mono text-sm">
                              <thead>
                                <tr className="border-b border-line bg-panel2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                                  <th className="py-3 px-3.5">
                                    {asig.tipo === "GRUPAL"
                                      ? "Grupo / Integrantes"
                                      : "Alumno"}
                                  </th>
                                  <th className="py-3 px-3.5">Repositorio GitHub</th>
                                  <th className="py-3 px-3.5">Pipeline CI/CD</th>
                                  <th className="py-3 px-3.5">Estado / Entrega</th>
                                  <th className="py-3 px-3.5">Último Commit</th>
                                  <th className="py-3 px-3.5 text-right">Acción</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-line/60">
                                {asig.grupos.map((grupo) => (
                                  <tr
                                    key={grupo.id}
                                    className="hover:bg-line/20 transition-colors"
                                  >
                                    {/* Nombre o Integrantes */}
                                    <td className="py-3.5 px-3.5">
                                      <div className="space-y-1">
                                        {grupo.nombre && (
                                          <p className="font-semibold text-foreground text-sm">
                                            {grupo.nombre}
                                          </p>
                                        )}
                                        <div className="flex flex-wrap gap-1.5">
                                          {grupo.integrantes.map((u) => (
                                            <a
                                              key={u}
                                              href={`https://github.com/${u}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                                            >
                                              @{u}
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    </td>

                                    {/* Repositorio */}
                                    <td className="py-3.5 px-3.5">
                                      {grupo.repositorio ? (
                                        <div className="flex items-center gap-1.5">
                                          <a
                                            href={grupo.repositorio.htmlUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-line/40 transition-colors"
                                            title={grupo.repositorio.htmlUrl}
                                          >
                                            <img
                                              src={githubIcon}
                                              alt="GitHub"
                                              className="w-4 h-4 opacity-80"
                                            />
                                            <span className="truncate max-w-[170px]">
                                              {grupo.repositorio.nombre}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                              ↗
                                            </span>
                                          </a>
                                          {grupo.releaseUrl && (
                                            <a
                                              href={grupo.releaseUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center rounded-lg border border-line bg-panel px-2 py-1 text-xs font-semibold text-foreground hover:bg-line/40 transition-colors"
                                              title="Ver entrega / release en GitHub"
                                            >
                                              🏷️
                                            </a>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-muted-foreground/60 italic text-xs">
                                          En proceso...
                                        </span>
                                      )}
                                    </td>

                                    {/* CI/CD */}
                                    <td className="py-3.5 px-3.5">
                                      {grupo.repositorio ? (
                                        <CIStatusBadge
                                          estado={grupo.repositorio.estadoCI}
                                        />
                                      ) : (
                                        <span className="text-muted-foreground/50 text-xs">
                                          —
                                        </span>
                                      )}
                                    </td>

                                    {/* Estado / Entrega */}
                                    <td className="py-3.5 px-3.5">
                                      {grupo.calificacion !== null &&
                                      grupo.calificacion !== undefined ? (
                                        <div className="space-y-0.5">
                                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                            <span>
                                              Calificado: {grupo.calificacion}/10
                                            </span>
                                          </span>
                                        </div>
                                      ) : grupo.entregada ||
                                        grupo.fechaEntregada ? (
                                        <div className="space-y-0.5">
                                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                                            Entregado
                                          </span>
                                          {grupo.fechaEntregada && (
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                              {new Date(
                                                grupo.fechaEntregada
                                              ).toLocaleDateString("es-AR", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                              })}
                                            </p>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="inline-flex items-center text-amber-600 dark:text-amber-400 text-xs font-semibold bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                                          Pendiente
                                        </span>
                                      )}
                                    </td>

                                    {/* Último commit */}
                                    <td className="py-3.5 px-3.5">
                                      {grupo.repositorio?.ultimoCommit ? (
                                        <div className="min-w-[160px] max-w-[220px]">
                                          <p className="truncate text-foreground text-xs font-medium">
                                            {obtenerPrimerLineaCommit(
                                              grupo.repositorio.ultimoCommit
                                            )}
                                          </p>
                                          {grupo.repositorio.fechaUltimoCommit && (
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                              {formatearFechaCommit(
                                                grupo.repositorio
                                                  .fechaUltimoCommit
                                              )}
                                            </p>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-muted-foreground/60 italic text-xs">
                                          {grupo.repositorio
                                            ? "Sin commits"
                                            : "—"}
                                        </span>
                                      )}
                                    </td>

                                    {/* Acción / Calificar */}
                                    <td className="py-3.5 px-3.5 text-right">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setCalificarModal({
                                            open: true,
                                            asignacionId: asig.id,
                                            asignacionTitulo: asig.titulo,
                                            grupo,
                                          })
                                        }
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs sm:text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer shadow-2xs"
                                        title={
                                          grupo.calificacion !== null &&
                                          grupo.calificacion !== undefined
                                            ? "Editar calificación de este grupo"
                                            : "Calificar este grupo"
                                        }
                                      >
                                        <span>
                                          {grupo.calificacion !== null &&
                                          grupo.calificacion !== undefined
                                            ? "Editar"
                                            : "Calificar"}
                                        </span>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modal para crear asignación */}
      <CrearAsignacionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cursoId={curso.id}
        alumnos={alumnos}
        onSuccess={cargarAsignaciones}
      />

      {/* Modal para calificar asignación */}
      <CalificarAsignacionModal
        open={calificarModal.open}
        onClose={() =>
          setCalificarModal((prev) => ({ ...prev, open: false, grupo: null }))
        }
        cursoId={curso.id}
        asignacionId={calificarModal.asignacionId}
        asignacionTitulo={calificarModal.asignacionTitulo}
        grupo={calificarModal.grupo}
        onSuccess={handleCalificacionExitosa}
      />
    </div>
  );
}
