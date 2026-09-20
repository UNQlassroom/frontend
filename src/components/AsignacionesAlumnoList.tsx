import { useState } from "react";
import type { AsignacionAlumnoDTO, EstadoEntrega } from "@/types";
import { CIStatusBadge } from "./CIStatusBadge";
import githubIcon from "@/assets/github_favicon.svg";

interface AsignacionesAlumnoListProps {
  asignaciones: AsignacionAlumnoDTO[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onToggleDemoEmptyState?: () => void;
}

export function AsignacionesAlumnoList({
  asignaciones,
  isLoading,
  error,
  onRetry,
  onToggleDemoEmptyState,
}: AsignacionesAlumnoListProps) {
  const [filtro, setFiltro] = useState<EstadoEntrega | "todas">("todas");

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
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm text-destructive font-medium mb-3">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-destructive px-4 py-2 font-mono text-xs font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer"
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra superior con filtros y control de demo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-panel p-4 rounded-xl border border-line">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFiltro("todas")}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-colors cursor-pointer ${
              filtro === "todas"
                ? "bg-primary text-primary-foreground"
                : "border border-line bg-panel2 text-muted-foreground hover:text-foreground"
            }`}
          >
            Todas ({conteo.todas})
          </button>

          <button
            type="button"
            onClick={() => setFiltro("pendiente")}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-colors cursor-pointer ${
              filtro === "pendiente"
                ? "bg-amber-600 text-white"
                : "border border-line bg-panel2 text-muted-foreground hover:text-foreground"
            }`}
          >
            Pendientes ({conteo.pendiente})
          </button>

          <button
            type="button"
            onClick={() => setFiltro("entregado")}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-colors cursor-pointer ${
              filtro === "entregado"
                ? "bg-sky-600 text-white"
                : "border border-line bg-panel2 text-muted-foreground hover:text-foreground"
            }`}
          >
            Entregadas ({conteo.entregado})
          </button>

          <button
            type="button"
            onClick={() => setFiltro("corregido")}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-colors cursor-pointer ${
              filtro === "corregido"
                ? "bg-emerald-600 text-white"
                : "border border-line bg-panel2 text-muted-foreground hover:text-foreground"
            }`}
          >
            Corregidas ({conteo.corregido})
          </button>
        </div>

        {onToggleDemoEmptyState && (
          <button
            type="button"
            onClick={onToggleDemoEmptyState}
            className="rounded-lg border border-line bg-panel2 px-3 py-1.5 font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
            title="Alternar entre listado con datos simulados y estado vacío"
          >
            {asignaciones.length > 0 ? "Probar estado vacío" : "Restablecer datos demo"}
          </button>
        )}
      </div>

      {/* Estado vacío cuando no hay asignaciones en general */}
      {asignaciones.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-panel p-12 text-center max-w-lg mx-auto my-8 animate-rise">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-line/40 border border-line flex items-center justify-center text-2xl mb-4 text-foreground shadow-xs">
            📚
          </div>
          <h3 className="font-display text-xl font-bold text-foreground tracking-tight">
            No tenés asignaciones asignadas
          </h3>
          <p className="mt-2 font-mono text-xs text-muted-foreground leading-relaxed">
            Aún no se han publicado trabajos prácticos en este curso. Los nuevos TPs aparecerán aquí junto con sus fechas de entrega y repositorio asignado.
          </p>
          {onToggleDemoEmptyState && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={onToggleDemoEmptyState}
                className="rounded-lg bg-primary px-4 py-2 font-mono text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              >
                Cargar asignaciones de prueba
              </button>
            </div>
          )}
        </div>
      ) : asignacionesFiltradas.length === 0 ? (
        /* Estado vacío del filtro seleccionado */
        <div className="rounded-2xl border border-line bg-panel p-8 text-center text-muted-foreground font-mono text-xs my-6">
          No hay asignaciones en estado <span className="font-semibold text-foreground">"{filtro}"</span>.
        </div>
      ) : (
        /* Tarjetas de Asignaciones para el Alumno */
        <div className="grid gap-5">
          {asignacionesFiltradas.map((asig) => {
            const badge = getBadgeEstado(asig.estadoEntrega);
            const notaMaxima = asig.notaMaxima ?? 10;
            const tieneNota = typeof asig.calificacion === "number";
            const esAprobado = tieneNota && asig.calificacion! >= 4;

            return (
              <div
                key={asig.id}
                className="rounded-2xl border border-line bg-panel p-6 shadow-xs flex flex-col justify-between hover:border-foreground/20 transition-colors animate-rise space-y-5"
              >
                {/* Cabecera de la tarjeta: Título, Estado de entrega, Calificación y CI */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {/* Badge de Estado de Entrega */}
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 font-mono text-[11px] font-medium ${badge.classes}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                        <span>{badge.label}</span>
                      </span>

                      {/* Badge de CI */}
                      {asig.estadoCI && (
                        <CIStatusBadge estado={asig.estadoCI} showIcon={true} />
                      )}

                      {/* Indicador de Fecha Límite */}
                      {asig.fechaLimiteFormatted && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-line bg-panel2 px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                          <span>⏰ Vence:</span>
                          <span className="font-semibold text-foreground">
                            {asig.fechaLimiteFormatted}
                          </span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-xl font-bold text-foreground">
                      {asig.titulo}
                    </h3>
                    <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                      {asig.descripcion}
                    </p>
                  </div>

                  {/* Panel de Calificación Obtenida */}
                  <div className="shrink-0 bg-panel2 border border-line rounded-xl p-3.5 flex flex-col items-start lg:items-end justify-center min-w-[170px]">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Calificación
                    </span>
                    {asig.estadoEntrega === "corregido" && tieneNota ? (
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span
                          className={`font-suez text-2xl font-bold ${
                            esAprobado ? "text-emerald-600" : "text-destructive"
                          }`}
                        >
                          {asig.calificacion}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          /{notaMaxima}
                        </span>
                        <span
                          className={`ml-1.5 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase ${
                            esAprobado
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {esAprobado ? "Aprobado" : "Desaprobado"}
                        </span>
                      </div>
                    ) : asig.estadoEntrega === "entregado" ? (
                      <span className="mt-1 font-mono text-xs font-semibold text-sky-600 inline-flex items-center gap-1">
                        <span>⏳ En corrección</span>
                      </span>
                    ) : (
                      <span className="mt-1 font-mono text-xs text-muted-foreground">
                        Sin calificar
                      </span>
                    )}

                    {asig.fechaUltimaEntrega && (
                      <span className="mt-1 font-mono text-[10px] text-muted-foreground">
                        Última entrega: {formatFechaLegible(asig.fechaUltimaEntrega)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sección de Feedback docente / Comentarios de corrección */}
                {asig.feedbackDocente && (
                  <div className="rounded-xl border border-line bg-panel2/60 p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-semibold text-foreground inline-flex items-center gap-1.5">
                        <span>💬</span>
                        <span>Devolución docente</span>
                      </span>
                      {asig.issueFeedbackUrl && (
                        <a
                          href={asig.issueFeedbackUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[11px] text-primary underline hover:opacity-80 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Ver en GitHub Issue</span>
                          <span>↗</span>
                        </a>
                      )}
                    </div>
                    <p className="font-mono text-xs text-muted-foreground leading-relaxed italic">
                      "{asig.feedbackDocente}"
                    </p>
                  </div>
                )}

                {/* Acciones y Enlaces de GitHub: Repositorio e Issues */}
                <div className="pt-3 border-t border-line/60 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Botón de acceso directo al Repositorio del Alumno */}
                    {asig.repoUrl ? (
                      <a
                        href={asig.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel2 px-3.5 py-1.5 font-mono text-xs font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer shadow-2xs"
                        title="Ir al repositorio de tu entrega en GitHub"
                      >
                        <img src={githubIcon} alt="GitHub" className="w-3.5 h-3.5 opacity-80" />
                        <span>Mi repositorio</span>
                        <span className="text-muted-foreground text-[10px]">↗</span>
                      </a>
                    ) : (
                      <span className="rounded-lg border border-line bg-panel2 px-3 py-1 font-mono text-[11px] text-muted-foreground">
                        Sin repositorio asignado
                      </span>
                    )}

                    {/* Botón de acceso directo a la sección de Issues */}
                    {asig.issuesUrl ? (
                      <a
                        href={asig.issueFeedbackUrl || asig.issuesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel2 px-3.5 py-1.5 font-mono text-xs font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer shadow-2xs"
                        title="Ir a los Issues y Feedback de GitHub"
                      >
                        <svg
                          className="w-3.5 h-3.5 opacity-80 shrink-0"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                        >
                          <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                          <path
                            fillRule="evenodd"
                            d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Issues & Feedback</span>
                        <span className="text-muted-foreground text-[10px]">↗</span>
                      </a>
                    ) : null}
                  </div>

                  {/* Estado / Acción de entrega */}
                  <div className="font-mono text-xs text-muted-foreground">
                    {asig.estadoEntrega === "pendiente" ? (
                      <span className="inline-flex items-center gap-1.5 text-amber-600 font-semibold text-[11px]">
                        <span>⚠️</span>
                        <span>Recordá realizar push a tu rama principal antes de la fecha límite</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground text-[11px]">
                        <span>✓</span>
                        <span>Entrega registrada</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
