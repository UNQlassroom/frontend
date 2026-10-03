import { useState } from "react";
import type { AsignacionAlumnoDTO, EstadoEntrega, CorreccionGrupoResponseDTO } from "@/types";
import { obtenerCorrecciones } from "@/services";
import { CIStatusBadge, IssueEstadoBadge } from "../common";
import { ConfirmarReentregaModal } from "./ConfirmarReentregaModal";
import githubIcon from "@/assets/github_favicon.svg";

interface AsignacionesAlumnoListProps {
  cursoId?: number;
  asignaciones: AsignacionAlumnoDTO[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onEntregar?: (asignacionId: number) => Promise<boolean>;
  entregandoId?: number | string | null;
}

export function AsignacionesAlumnoList({
  cursoId,
  asignaciones,
  isLoading,
  error,
  onRetry,
  onEntregar,
  entregandoId,
}: AsignacionesAlumnoListProps) {
  const [filtro, setFiltro] = useState<EstadoEntrega | "todas">("todas");
  const [copiedId, setCopiedId] = useState<string | number | null>(null);
  const [entregaError, setEntregaError] = useState<{ id: string | number; message: string } | null>(null);
  const [asignacionParaReentregar, setAsignacionParaReentregar] = useState<AsignacionAlumnoDTO | null>(null);

  // Estado para la sección desplegable de correcciones e issues
  const [expandedCorrecciones, setExpandedCorrecciones] = useState<Set<number>>(new Set());
  const [correccionesPorAsig, setCorreccionesPorAsig] = useState<
    Record<
      number,
      {
        loading: boolean;
        error: string | null;
        grupo: CorreccionGrupoResponseDTO | null;
      }
    >
  >({});

  const asignacionesFiltradas =
    filtro === "todas"
      ? asignaciones
      : asignaciones.filter((a) => a.estadoEntrega === filtro);

  const conteo = {
    todas: asignaciones.length,
    pendiente: asignaciones.filter((a) => a.estadoEntrega === "pendiente").length,
    entregado: asignaciones.filter((a) => a.estadoEntrega === "entregado").length,
    corregido: asignaciones.filter((a) => a.estadoEntrega === "corregido").length,
  };

  const handleCopyClone = (asigId: string | number, repoUrl: string) => {
    const cloneCmd = `git clone ${repoUrl}.git`;
    navigator.clipboard.writeText(cloneCmd).then(() => {
      setCopiedId(asigId);
      setTimeout(() => {
        setCopiedId((prev) => (prev === asigId ? null : prev));
      }, 2000);
    });
  };

  const handleEntregar = async (asigId: number) => {
    if (!onEntregar) return;
    setEntregaError(null);
    try {
      await onEntregar(asigId);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String(err.message)
          : "Error al registrar la entrega. Intentalo nuevamente.";
      setEntregaError({ id: asigId, message: msg });
      throw err;
    }
  };

  const cargarCorreccionParaAsig = async (asigId: number) => {
    if (!cursoId) return;
    setCorreccionesPorAsig((prev) => ({
      ...prev,
      [asigId]: { loading: true, error: null, grupo: prev[asigId]?.grupo ?? null },
    }));
    try {
      const res = await obtenerCorrecciones(cursoId, asigId);
      const miGrupo = res.data[0] || null;
      setCorreccionesPorAsig((prev) => ({
        ...prev,
        [asigId]: { loading: false, error: null, grupo: miGrupo },
      }));
    } catch (err: unknown) {
      console.error("Error al cargar correcciones de asignacion:", err);
      setCorreccionesPorAsig((prev) => ({
        ...prev,
        [asigId]: {
          loading: false,
          error: "No se pudieron obtener las correcciones.",
          grupo: null,
        },
      }));
    }
  };

  const toggleCorrecciones = async (asigId: number) => {
    const isCurrentlyOpen = expandedCorrecciones.has(asigId);
    const next = new Set(expandedCorrecciones);
    if (isCurrentlyOpen) {
      next.delete(asigId);
      setExpandedCorrecciones(next);
    } else {
      next.add(asigId);
      setExpandedCorrecciones(next);
      if (!correccionesPorAsig[asigId] && cursoId) {
        await cargarCorreccionParaAsig(asigId);
      }
    }
  };

  const getBadgeEstado = (estado: EstadoEntrega) => {
    switch (estado) {
      case "corregido":
        return {
          label: "Corregido",
          classes: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
          dotColor: "bg-emerald-500",
        };
      case "entregado":
        return {
          label: "Entregado",
          classes: "bg-sky-500/10 text-sky-600 border border-sky-500/20",
          dotColor: "bg-sky-500",
        };
      case "pendiente":
      default:
        return {
          label: "Pendiente",
          classes: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
          dotColor: "bg-amber-500",
        };
    }
  };

  const formatFechaLegible = (isoDate?: string | null) => {
    if (!isoDate) return null;
    try {
      const date = new Date(isoDate);
      if (isNaN(date.getTime())) return isoDate;
      return date.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoDate;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-xs text-muted-foreground">
          Cargando tus asignaciones y notas...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center animate-rise">
        <p className="font-mono text-xs text-destructive mb-3">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-destructive px-4 py-2 font-mono text-xs font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de Filtros por Estado */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <button
            type="button"
            onClick={() => setFiltro("todas")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filtro === "todas"
                ? "bg-foreground text-background font-semibold shadow-xs"
                : "bg-panel border border-line text-muted-foreground hover:text-foreground hover:bg-line/40"
            }`}
          >
            Todas ({conteo.todas})
          </button>
          <button
            type="button"
            onClick={() => setFiltro("pendiente")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filtro === "pendiente"
                ? "bg-amber-600 text-white font-semibold shadow-xs"
                : "bg-panel border border-line text-muted-foreground hover:text-foreground hover:bg-line/40"
            }`}
          >
            Pendientes ({conteo.pendiente})
          </button>
          <button
            type="button"
            onClick={() => setFiltro("entregado")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filtro === "entregado"
                ? "bg-sky-600 text-white font-semibold shadow-xs"
                : "bg-panel border border-line text-muted-foreground hover:text-foreground hover:bg-line/40"
            }`}
          >
            Entregadas ({conteo.entregado})
          </button>
          <button
            type="button"
            onClick={() => setFiltro("corregido")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filtro === "corregido"
                ? "bg-emerald-600 text-white font-semibold shadow-xs"
                : "bg-panel border border-line text-muted-foreground hover:text-foreground hover:bg-line/40"
            }`}
          >
            Corregidas ({conteo.corregido})
          </button>
        </div>
      </div>

      {/* Lista de Asignaciones */}
      {asignaciones.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-panel p-10 text-center animate-rise">
          <div className="mx-auto w-12 h-12 rounded-xl bg-line/40 flex items-center justify-center text-xl mb-3 text-muted-foreground">
            📚
          </div>
          <h3 className="font-display text-lg font-bold text-foreground">
            No tenés asignaciones asignadas
          </h3>
          <p className="mt-2 font-mono text-xs text-muted-foreground leading-relaxed">
            Aún no se han publicado asignaciones en este curso. Las nuevas asignaciones aparecerán aquí junto con sus fechas de entrega y repositorio asignado.
          </p>
        </div>
      ) : asignacionesFiltradas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-panel p-8 text-center animate-rise">
          <p className="font-mono text-xs text-muted-foreground">
            No hay asignaciones con el estado seleccionado ({filtro}).
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {asignacionesFiltradas.map((asig) => {
            const asigIdNum = Number(asig.id);
            const badge = getBadgeEstado(asig.estadoEntrega);
            const notaMaxima = asig.notaMaxima ?? 10;
            const tieneNota = typeof asig.calificacion === "number";
            const isVencida = asig.fechaLimite ? new Date() > new Date(asig.fechaLimite) : false;
            const isCorreccionesOpen = expandedCorrecciones.has(asigIdNum);
            const asigCorreccion = correccionesPorAsig[asigIdNum];

            return (
              <div
                key={asig.id}
                className="rounded-2xl border border-line bg-panel p-5 shadow-xs space-y-4 transition-all animate-rise"
              >
                {/* Cabecera de la Asignación: Tipo, Fechas, Estado y Calificación */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    {/* Metadatos y Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md border border-line bg-panel2 px-2.5 py-0.5 font-mono text-[11px] font-medium text-foreground">
                        {asig.tipo === "GRUPAL" ? "Grupal" : "Individual"}
                      </span>

                      {/* Badge de Estado de Entrega */}
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 font-mono text-[11px] font-semibold ${badge.classes}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                        <span>{badge.label}</span>
                      </span>

                      {/* Estado CI/CD */}
                      {asig.repoUrl && (
                        <CIStatusBadge estado={asig.estadoCI} />
                      )}

                      {/* Integrantes si es grupal */}
                      {asig.tipo === "GRUPAL" && asig.integrantes && asig.integrantes.length > 0 && (
                        <div className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                          <span>Grupo:</span>
                          <span className="font-semibold text-foreground">
                            {asig.grupoNombre || asig.integrantes.map((i) => `@${i}`).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Título de la Asignación */}
                    <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
                      {asig.titulo}
                    </h3>

                    {/* Descripción */}
                    {asig.descripcion && (
                      <p className="font-mono text-xs text-muted-foreground leading-relaxed max-w-3xl">
                        {asig.descripcion}
                      </p>
                    )}

                    {/* Fechas de Entrega y Límite */}
                    <div className="flex flex-wrap items-center gap-4 pt-1 font-mono text-xs text-muted-foreground">
                      {asig.fechaLimite && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground/80">Fecha límite:</span>
                          <span
                            className={`font-semibold ${
                              isVencida && asig.estadoEntrega === "pendiente"
                                ? "text-destructive font-bold"
                                : "text-foreground"
                            }`}
                          >
                            {asig.fechaLimiteFormatted || formatFechaLegible(asig.fechaLimite)}
                          </span>
                        </div>
                      )}

                      {asig.fechaEntregadaFormatted && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground/80">Entregado el:</span>
                          <span className="font-semibold text-foreground">
                            {asig.fechaEntregadaFormatted}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Panel Lateral: Calificación y Estado de la Nota */}
                  <div className="flex flex-col items-start lg:items-end justify-between self-start shrink-0 rounded-xl border border-line bg-panel2 p-3.5 min-w-[140px] text-left lg:text-right">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Calificación
                    </span>
                    {asig.estadoEntrega === "corregido" && tieneNota ? (
                      <>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span
                            className={`font-suez text-2xl font-bold text-black`}
                          >
                            {asig.calificacion}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">
                            /{notaMaxima}
                          </span>
                        </div>
                        {asig.observaciones ? (
                          <span className="mt-1 font-mono text-[10px] text-primary font-medium inline-flex items-center gap-1">
                            <span>💬 Con devolución</span>
                          </span>
                        ) : (
                          <span className="mt-1 font-mono text-[10px] text-muted-foreground">
                            Sin observaciones
                          </span>
                        )}
                      </>
                    ) : asig.estadoEntrega === "entregado" ? (
                      <div className="flex flex-col items-start lg:items-end mt-1">
                        <span className="font-mono text-xs font-semibold text-sky-600 inline-flex items-center gap-1">
                          <span>En corrección</span>
                        </span>
                        {asig.fechaEntregadaFormatted && (
                          <span className="mt-1 font-mono text-[10px] text-muted-foreground">
                            Entregado: {asig.fechaEntregadaFormatted}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="mt-1 font-mono text-xs text-muted-foreground">
                        Sin entregar
                      </span>
                    )}

                    {asig.fechaUltimoCommit && (
                      <span className="mt-1 font-mono text-[10px] text-muted-foreground">
                        Último commit: {formatFechaLegible(asig.fechaUltimoCommit)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sección de Observaciones y Devolución del Docente */}
                {asig.observaciones && (
                  <div className="p-4 rounded-xl border border-primary/25 bg-primary/5 space-y-2 animate-rise">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-primary">
                        <span>Devolución y observaciones del docente</span>
                      </div>
                      {asig.fechaCalificacion && (
                        <span className="font-mono text-[10px] text-muted-foreground">
                          Calificado el: {formatFechaLegible(asig.fechaCalificacion)}
                        </span>
                      )}
                    </div>
                    <div className="p-3 rounded-lg border border-primary/10 bg-panel font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed shadow-2xs">
                      {asig.observaciones}
                    </div>
                  </div>
                )}

                {/* Sección Desplegable de Correcciones e Issues en GitHub */}
                {cursoId && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => toggleCorrecciones(asigIdNum)}
                      className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
                    >
                      <span className="text-primary font-bold transition-transform duration-150">
                        {isCorreccionesOpen ? "▾" : "▸"}
                      </span>
                      <span className="font-semibold underline decoration-line group-hover:decoration-foreground">
                        {isCorreccionesOpen ? "Ocultar correcciones en GitHub" : "Ver correcciones en GitHub"}
                      </span>
                      {asigCorreccion?.grupo?.issues && (
                        <span className="rounded-full bg-line/60 px-2 py-0.2 text-[10px] text-muted-foreground font-semibold">
                          {asigCorreccion.grupo.issues.length}
                        </span>
                      )}
                    </button>

                    {/* Panel desplegable */}
                    {isCorreccionesOpen && (
                      <div className="mt-3 p-4 rounded-xl border border-line bg-panel2/60 space-y-3 animate-rise">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-line">
                          <div className="flex items-center gap-2 font-mono text-xs font-bold text-foreground">
                            <img src={githubIcon} alt="GitHub" className="w-3.5 h-3.5 opacity-80" />
                            <span>Correcciones del docente en GitHub</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => cargarCorreccionParaAsig(asigIdNum)}
                            disabled={asigCorreccion?.loading}
                            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
                            title="Recargar correcciones desde GitHub"
                          >
                            <svg
                              className={`w-3 h-3 ${asigCorreccion?.loading ? "animate-spin text-primary" : ""}`}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                            </svg>
                            <span>{asigCorreccion?.loading ? "Actualizando..." : "Actualizar"}</span>
                          </button>
                        </div>

                        {asigCorreccion?.loading ? (
                          <div className="flex items-center justify-center py-6 gap-2">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <span className="font-mono text-xs text-muted-foreground">
                              Consultando correcciones en GitHub...
                            </span>
                          </div>
                        ) : asigCorreccion?.error ? (
                          <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/5 text-center font-mono text-xs text-destructive">
                            <span>{asigCorreccion.error}</span>
                          </div>
                        ) : !asigCorreccion?.grupo || asigCorreccion.grupo.issues.length === 0 ? (
                          <div className="p-3.5 rounded-lg border border-line/60 bg-panel text-center font-mono text-xs text-muted-foreground">
                            <span>No tenés correcciones asignadas para esta asignación en GitHub.</span>
                          </div>
                        ) : (
                          <div className="divide-y divide-line/60 rounded-lg border border-line bg-panel overflow-hidden font-mono text-xs">
                            {asigCorreccion.grupo.issues.map((issue) => (
                              <div
                                key={issue.numero}
                                className="p-3 hover:bg-line/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                              >
                                <div className="space-y-1 min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold text-muted-foreground">
                                      #{issue.numero}
                                    </span>
                                    <a
                                      href={issue.htmlUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-semibold text-foreground hover:text-primary hover:underline break-words"
                                    >
                                      {issue.titulo}
                                    </a>
                                    <IssueEstadoBadge estado={issue.estado} />
                                    {issue.tieneCommitsPosteriores && (
                                      <span
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                        title="Tus commits en el repositorio son posteriores a la apertura de este issue"
                                      >
                                        <span>⚡ Commits posteriores detectados</span>
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                                    <span>Por @{issue.autor}</span>
                                    <span>•</span>
                                    <span>Creado: {formatFechaLegible(issue.fechaCreacion)}</span>
                                    {issue.cantComentarios > 0 && (
                                      <>
                                        <span>•</span>
                                        <span className="font-medium text-foreground">
                                          💬 {issue.cantComentarios} comentario(s)
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
                                    className="inline-flex items-center gap-1 rounded-md border border-line bg-panel2 px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-line/40 transition-colors"
                                  >
                                    <span>Ver en GitHub</span>
                                    <span className="text-[10px]">↗</span>
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Acciones y Enlaces de GitHub: Repositorio, Clonar y Entrega */}
                <div className="pt-3 border-t border-line/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Botón de acceso directo al Repositorio */}
                    {asig.repoUrl ? (
                      <>
                        <a
                          href={asig.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel2 px-3 py-1.5 font-mono text-xs font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer shadow-2xs"
                          title="Abrir el repositorio asignado en GitHub"
                        >
                          <img src={githubIcon} alt="GitHub" className="w-3.5 h-3.5 opacity-80" />
                          <span>Ver en GitHub</span>
                          <span className="text-muted-foreground text-[10px]">↗</span>
                        </a>

                        {/* Botón para copiar git clone al portapapeles */}
                        <button
                          type="button"
                          onClick={() => handleCopyClone(asig.id, asig.repoUrl!)}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs font-medium transition-colors cursor-pointer shadow-2xs ${
                            copiedId === asig.id
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 font-semibold"
                              : "border-line bg-panel2 text-foreground hover:bg-line/40"
                          }`}
                          title={`Copiar al portapapeles: git clone ${asig.repoUrl}.git`}
                        >
                          {copiedId === asig.id ? (
                            <>
                              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>¡Copiado!</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                              <span>git clone</span>
                            </>
                          )}
                        </button>

                        {/* Ayuda para alumnos: ¿Cómo clonar el repositorio? */}
                        <div className="relative group/help inline-flex items-center">
                          <button
                            type="button"
                            aria-label="¿Cómo clonar este repositorio?"
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-line bg-panel2 text-muted-foreground hover:text-foreground hover:bg-line/40 font-mono text-xs font-bold transition-colors cursor-help shadow-2xs"
                          >
                            ?
                          </button>

                          {/* Tooltip con guía paso a paso para principiantes */}
                          <div className="pointer-events-none group-hover/help:pointer-events-auto opacity-0 group-hover/help:opacity-100 group-hover/help:translate-y-0 translate-y-1 transition-all duration-150 absolute bottom-full mb-2 left-0 sm:left-1/2 sm:-translate-x-1/2 w-72 sm:w-84 rounded-xl border border-line bg-panel p-4 shadow-xl z-30 text-left font-mono text-xs text-foreground">
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-line text-primary font-bold">
                              <span className="text-sm">💡</span>
                              <span>¿Cómo clonar el repositorio?</span>
                            </div>

                            <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                              Clonar descarga una copia completa del trabajo práctico a tu computadora para que puedas empezar a programar.
                            </p>

                            <ol className="space-y-2 text-[11px] text-muted-foreground list-decimal list-inside leading-relaxed">
                              <li>
                                <span className="text-foreground font-semibold">Copiá el comando</span> haciendo clic en{" "}
                                <span className="text-foreground bg-panel2 px-1 py-0.5 rounded border border-line font-medium">
                                  git clone
                                </span>.
                              </li>
                              <li>
                                <span className="text-foreground font-semibold">Abrí una terminal</span> (Git Bash, PowerShell o terminal de VS Code) en la carpeta donde guardás tus proyectos.
                              </li>
                              <li>
                                <span className="text-foreground font-semibold">Pegá y ejecutá</span> el comando con <kbd className="px-1 py-0.5 rounded bg-panel2 border border-line text-foreground font-mono text-[10px]">Enter</kbd>:
                                <div className="mt-1 p-2 rounded-md bg-background border border-line font-mono text-[10px] text-primary truncate select-all">
                                  git clone {asig.repoUrl}.git
                                </div>
                              </li>
                              <li>
                                <span className="text-foreground font-semibold">¡Listo!</span> Se creará la carpeta con los archivos para empezar a trabajar.
                              </li>
                            </ol>

                            {/* Flecha indicadora */}
                            <div className="absolute top-full left-3.5 sm:left-1/2 sm:-translate-x-1/2 -mt-1 w-2 h-2 bg-panel border-r border-b border-line rotate-45" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <span className="rounded-lg border border-line bg-panel2 px-3 py-1 font-mono text-[11px] text-muted-foreground">
                        Repositorio en proceso de creación...
                      </span>
                    )}
                  </div>

                  {/* Acción de Entrega / Reentrega / Estado */}
                  <div className="flex flex-col sm:items-end gap-1">
                    {asig.estadoEntrega === "pendiente" ? (
                      <div className="flex items-center gap-2">
                        {isVencida ? (
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 font-mono text-xs font-semibold text-destructive">
                            <span>Plazo vencido</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleEntregar(Number(asig.id))}
                            disabled={entregandoId === asig.id}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 font-mono text-xs font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                            title="Marcar esta asignación como entregada"
                          >
                            {entregandoId === asig.id ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                <span>Entregando...</span>
                              </>
                            ) : (
                              <>
                                <span>Entregar</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    ) : asig.estadoEntrega === "entregado" ? (
                      <div className="flex flex-wrap items-center sm:justify-end gap-2 font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-semibold text-xs">
                            <span>Entregado</span>
                          </span>
                          {asig.fechaEntregadaFormatted && (
                            <span className="text-[11px] text-muted-foreground">
                              ({asig.fechaEntregadaFormatted})
                            </span>
                          )}
                        </div>

                        {!isVencida ? (
                          <button
                            type="button"
                            onClick={() => setAsignacionParaReentregar(asig)}
                            disabled={entregandoId === asig.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 px-3 py-1 font-mono text-xs font-semibold transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                            title="Volver a entregar con el último commit del repositorio"
                          >
                            {entregandoId === asig.id ? (
                              <>
                                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                <span>Reentregando...</span>
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-3 h-3"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                                </svg>
                                <span>Reentregar</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground bg-panel2 px-2 py-0.5 rounded border border-line">
                            Plazo cerrado
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold text-xs">
                          <span>Corregido</span>
                        </span>
                        {asig.fechaEntregadaFormatted && (
                          <span className="text-[11px] text-muted-foreground">
                            ({asig.fechaEntregadaFormatted})
                          </span>
                        )}
                      </div>
                    )}

                    {entregaError && entregaError.id === asig.id && (
                      <p className="font-mono text-[11px] text-destructive">
                        {entregaError.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de confirmación para reentrega */}
      <ConfirmarReentregaModal
        open={Boolean(asignacionParaReentregar)}
        onClose={() => setAsignacionParaReentregar(null)}
        asignacionTitulo={asignacionParaReentregar?.titulo || ""}
        repoNombre={asignacionParaReentregar?.repoNombre}
        fechaEntregadaPrevia={asignacionParaReentregar?.fechaEntregadaFormatted}
        fechaLimite={asignacionParaReentregar?.fechaLimiteFormatted}
        isLoading={entregandoId === asignacionParaReentregar?.id}
        onConfirm={async () => {
          if (!asignacionParaReentregar) return;
          const asigId = Number(asignacionParaReentregar.id);
          try {
            await handleEntregar(asigId);
            setAsignacionParaReentregar(null);
          } catch {
            // El error se muestra a través de entregaError
          }
        }}
      />
    </div>
  );
}

