import { useState, useEffect, useCallback } from "react";
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
import { CIStatusBadge } from "./CIStatusBadge";
import {
  formatearFechaCommit,
  obtenerPrimerLineaCommit,
} from "@/lib";
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

  const handleCalificacionExitosa = (asignacionActualizada: AsignacionResponseDTO) => {
    setAsignaciones((prev) =>
      prev.map((asig) =>
        asig.id === asignacionActualizada.id ? asignacionActualizada : asig
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header del Tab */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Asignaciones
          </h3>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            Crea y administra asignaciones individuales o grupales integradas con GitHub.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-mono text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <img src={circleAddIcon} alt="Crear" className="w-3.5 h-3.5 brightness-0 invert" />
          <span>Crear asignación</span>
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-xs text-muted-foreground">
            Cargando asignaciones del curso...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive font-medium mb-3">{error}</p>
          <button
            type="button"
            onClick={cargarAsignaciones}
            className="rounded-lg bg-destructive px-4 py-2 font-mono text-xs font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Empty state si no hay asignaciones */}
      {!isLoading && !error && asignaciones.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line bg-panel p-12 text-center max-w-xl mx-auto my-8 animate-rise">
          <div className="mx-auto w-12 h-12 rounded-xl bg-line/40 flex items-center justify-center text-xl mb-3 text-muted-foreground">
            📚
          </div>
          <h3 className="font-display text-xl font-bold text-foreground tracking-tight">
            No hay asignaciones creadas
          </h3>
          <p className="mt-2 font-mono text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
            Aún no se han creado asignaciones para este curso. Puedes crear la primera asignación haciendo clic en el botón a continuación.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel2 px-5 py-2.5 font-mono text-xs font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer shadow-xs"
            >
              <img src={circleAddIcon} alt="Crear" className="w-3.5 h-3.5 opacity-80" />
              <span>Crear primera asignación</span>
            </button>
          </div>
        </div>
      )}

      {/* Listado de Asignaciones */}
      {!isLoading && asignaciones.length > 0 && (
        <div className="space-y-4">
          {asignaciones.map((asig) => {
            const isExpanded = expandedAsigId === asig.id;
            const totalGrupos = asig.grupos?.length || 0;
            const templateUrl = getTemplateUrl(asig.templateRepoName);

            return (
              <div
                key={asig.id}
                className="rounded-2xl border border-line bg-panel p-5 shadow-xs transition-colors space-y-4"
              >
                {/* Header de la Asignación */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md border border-line bg-panel2 px-2.5 py-0.5 font-mono text-[11px] font-medium text-foreground">
                        {asig.tipo === "GRUPAL" ? "Grupal" : "Individual"}
                      </span>

                      {/* Enlace al repositorio plantilla */}
                      <a
                        href={templateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-line bg-panel2 px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground hover:text-foreground hover:bg-line/40 transition-colors group cursor-pointer"
                        title={`Ver repositorio plantilla ${asig.templateRepoName} en GitHub`}
                      >
                        <img src={githubIcon} alt="Repo" className="w-3.5 h-3.5 opacity-80" />
                        <span>Plantilla:</span>
                        <span className="font-semibold text-foreground underline decoration-muted-foreground/40 group-hover:decoration-foreground">
                          {asig.templateRepoName}
                        </span>
                        <span className="text-[10px] text-muted-foreground group-hover:text-foreground">↗</span>
                      </a>

                      {asig.fechaLimite && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-line bg-panel2 px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                          <span>Fecha límite:</span>
                          <span className="font-semibold text-foreground">
                            {new Date(asig.fechaLimite).toLocaleDateString("es-AR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </span>
                        </span>
                      )}
                    </div>

                    <h4 className="font-display text-xl font-bold text-foreground">
                      {asig.titulo}
                    </h4>
                    {asig.descripcion && (
                      <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                        {asig.descripcion}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-xs text-muted-foreground">
                      {totalGrupos} {asig.tipo === "GRUPAL" ? "grupo(s)" : "repositorio(s)"}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleExpand(asig.id)}
                      className="rounded-lg border border-line bg-panel2 px-3 py-1.5 font-mono text-xs font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer"
                    >
                      {isExpanded ? "Ocultar repositorios ▲" : "Ver repositorios ▼"}
                    </button>
                  </div>
                </div>

                {/* Detalle desplegable de los repositorios y grupos */}
                {isExpanded && (
                  <div className="pt-4 border-t border-line space-y-3">
                    <h5 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                      Repositorios generados ({totalGrupos})
                    </h5>

                    {totalGrupos === 0 ? (
                      <p className="font-mono text-xs text-muted-foreground italic">
                        No hay repositorios asociados a esta asignación todavía.
                      </p>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-line bg-panel2/60">
                        <table className="w-full text-left border-collapse font-mono text-xs">
                          <thead>
                            <tr className="border-b border-line bg-panel2 text-[11px] uppercase tracking-wider text-muted-foreground">
                              <th className="py-2.5 px-3">
                                {asig.tipo === "GRUPAL" ? "Grupo / Integrantes" : "Alumno"}
                              </th>
                              <th className="py-2.5 px-3">Repositorio GitHub</th>
                              <th className="py-2.5 px-3">Pipeline CI/CD</th>
                              <th className="py-2.5 px-3">Estado / Entrega</th>
                              <th className="py-2.5 px-3">Último Commit</th>
                              <th className="py-2.5 px-3 text-right">Acción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-line/60">
                            {asig.grupos.map((grupo) => (
                              <tr key={grupo.id} className="hover:bg-line/20 transition-colors">
                                {/* Nombre o Integrantes */}
                                <td className="py-3 px-3">
                                  <div className="space-y-1">
                                    {grupo.nombre && (
                                      <p className="font-semibold text-foreground">
                                        {grupo.nombre}
                                      </p>
                                    )}
                                    <div className="flex flex-wrap gap-1">
                                      {grupo.integrantes.map((u) => (
                                        <a
                                          key={u}
                                          href={`https://github.com/${u}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[11px] text-muted-foreground hover:text-foreground hover:underline"
                                        >
                                          @{u}
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                </td>

                                {/* Repositorio */}
                                <td className="py-3 px-3">
                                  {grupo.repositorio ? (
                                    <div className="flex items-center gap-1.5">
                                      <a
                                        href={grupo.repositorio.htmlUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 rounded-md border border-line bg-panel px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-line/40 transition-colors"
                                        title={grupo.repositorio.htmlUrl}
                                      >
                                        <img src={githubIcon} alt="GitHub" className="w-3.5 h-3.5 opacity-80" />
                                        <span className="truncate max-w-[170px]">
                                          {grupo.repositorio.nombre}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">↗</span>
                                      </a>
                                      {grupo.releaseUrl && (
                                        <a
                                          href={grupo.releaseUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center rounded-md border border-line bg-panel px-1.5 py-1 text-[11px] font-semibold text-foreground hover:bg-line/40 transition-colors"
                                          title="Ver entrega / release en GitHub"
                                        >
                                          🏷️
                                        </a>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground/60 italic text-[11px]">
                                      En proceso...
                                    </span>
                                  )}
                                </td>

                                {/* CI/CD */}
                                <td className="py-3 px-3">
                                  {grupo.repositorio ? (
                                    <CIStatusBadge estado={grupo.repositorio.estadoCI} />
                                  ) : (
                                    <span className="text-muted-foreground/50 text-[11px]">—</span>
                                  )}
                                </td>

                                {/* Estado / Entrega */}
                                <td className="py-3 px-3">
                                  {grupo.calificacion !== null && grupo.calificacion !== undefined ? (
                                    <div className="space-y-0.5">
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-mist-300/10 text-mist-600 border border-mist-600/20">
                                        <span>Calificado: {grupo.calificacion}/10</span>
                                      </span>
                                    </div>
                                  ) : (grupo.entregada || grupo.fechaEntregada) ? (
                                    <div className="space-y-0.5">
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/10 text-sky-600 border border-sky-500/20">
                                        Entregado
                                      </span>
                                      {grupo.fechaEntregada && (
                                        <p className="text-[10px] text-muted-foreground">
                                          {new Date(grupo.fechaEntregada).toLocaleDateString("es-AR", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="inline-flex items-center text-amber-600 text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                      Pendiente
                                    </span>
                                  )}
                                </td>

                                {/* Último commit */}
                                <td className="py-3 px-3">
                                  {grupo.repositorio?.ultimoCommit ? (
                                    <div className="min-w-[160px] max-w-[220px]">
                                      <p className="truncate text-foreground text-[11px] font-medium">
                                        {obtenerPrimerLineaCommit(grupo.repositorio.ultimoCommit)}
                                      </p>
                                      {grupo.repositorio.fechaUltimoCommit && (
                                        <p className="text-[10px] text-muted-foreground mt-0.5">
                                          {formatearFechaCommit(grupo.repositorio.fechaUltimoCommit)}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground/60 italic text-[11px]">
                                      {grupo.repositorio ? "Sin commits" : "—"}
                                    </span>
                                  )}
                                </td>

                                {/* Acción / Calificar */}
                                <td className="py-3 px-3 text-right">
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
                                    className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer shadow-2xs"
                                    title={
                                      grupo.calificacion !== null && grupo.calificacion !== undefined
                                        ? "Editar calificación de este grupo"
                                        : "Calificar este grupo"
                                    }
                                  >
                                    <span>{grupo.calificacion !== null && grupo.calificacion !== undefined ? "Editar" : "Calificar"}</span>
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
