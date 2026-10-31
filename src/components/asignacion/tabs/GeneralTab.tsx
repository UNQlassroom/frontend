import { useState } from "react";
import type { AsignacionAlumnoDTO } from "@/types";
import {
  esFechaLimiteVencida,
  formatFechaLegible,
  getBadgeEstadoEntrega,
} from "@/utils";
import githubIcon from "@/assets/github_favicon.svg";

const CARD_FIXED_HEIGHT = 232;

export interface GeneralTabProps {
  asignacion: AsignacionAlumnoDTO;
  currentUsername?: string;
  entregando: boolean;
  onEntregar: () => void;
  onAbrirModalReentrega: () => void;
  onVerBuenasPracticas?: () => void;
}

export function GeneralTab({
  asignacion,
  currentUsername,
  entregando,
  onEntregar,
  onAbrirModalReentrega,
}: GeneralTabProps) {
  const [observacionesExpandidas, setObservacionesExpandidas] = useState(false);

  const badge = getBadgeEstadoEntrega(asignacion.estadoEntrega);
  const notaMaxima = asignacion.notaMaxima ?? 10;
  const tieneNota = typeof asignacion.calificacion === "number";
  const isVencida = esFechaLimiteVencida(asignacion.fechaLimite);
  const fueEntregada =
    Boolean(asignacion.entregada) ||
    asignacion.estadoEntrega === "entregado" ||
    asignacion.estadoEntrega === "corregido";

  const observacionesTexto = asignacion.observaciones?.trim() || "";
  const esObservacionLarga =
    observacionesTexto.length > 75 || observacionesTexto.includes("\n");

  return (
    <div className="space-y-6 animate-rise">
      {/* Grilla de Entrega y Calificación con altura fija idéntica en reposo */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        style={{ alignItems: "start" }}
      >
        {/* Tarjeta: Estado de tu Entrega (altura fija inamovible) */}
        <section
          style={{ height: `${CARD_FIXED_HEIGHT}px` }}
          className="rounded-2xl border border-line bg-panel p-5 sm:p-6 shadow-xs flex flex-col justify-between min-w-0 self-start"
        >
          <div className="space-y-3.5">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-line">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Estado de tu Entrega
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-semibold ${badge.classes}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                <span>{badge.label}</span>
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Fecha límite:</span>
                <span
                  className={`font-semibold ${
                    isVencida && !fueEntregada
                      ? "text-destructive font-bold"
                      : "text-foreground"
                  }`}
                >
                  {asignacion.fechaLimite
                    ? asignacion.fechaLimiteFormatted ||
                      formatFechaLegible(asignacion.fechaLimite)
                    : "Sin fecha límite"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Última entrega:</span>
                <span className="font-semibold text-foreground">
                  {asignacion.fechaEntregadaFormatted || "Sin entregar"}
                </span>
              </div>

              {asignacion.releaseUrl && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Último release:</span>
                  <a
                    href={asignacion.releaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-foreground decoration-muted-foreground/40 hover:decoration-foreground hover:text-primary transition-colors"
                  >
                    <img
                      src={githubIcon}
                      alt="GitHub"
                      className="w-4 h-4 opacity-80"
                    />
                    <span>Ver en GitHub</span>
                    <span className="text-muted-foreground text-[11px]">↗</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Acción de Entrega / Reentrega */}
          <div>
            {!fueEntregada ? (
              isVencida ? (
                <div className="w-full rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-center text-xs font-semibold text-destructive">
                  Plazo de entrega vencido
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onEntregar}
                  disabled={
                    entregando ||
                    !asignacion.repoUrl ||
                    asignacion.estado === "CREANDO"
                  }
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  title={
                    !asignacion.repoUrl || asignacion.estado === "CREANDO"
                      ? "Tu repositorio aún se está generando en GitHub"
                      : "Marcar esta asignación como entregada"
                  }
                >
                  {entregando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Entregando...</span>
                    </>
                  ) : (
                    <span>Entregar asignación</span>
                  )}
                </button>
              )
            ) : !isVencida ? (
              <button
                type="button"
                onClick={onAbrirModalReentrega}
                disabled={entregando}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                title="Volver a entregar con el último commit del repositorio"
              >
                {entregando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Reentregando...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
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
              <div className="w-full rounded-xl border border-line bg-panel2 px-4 py-2.5 text-center text-xs text-muted-foreground">
                Plazo cerrado para reentregas
              </div>
            )}
          </div>
        </section>

        {/* Tarjeta: Calificación y Devolución (misma altura fija en reposo, solo esta crece al expandir) */}
        <section
          style={
            observacionesExpandidas
              ? { minHeight: `${CARD_FIXED_HEIGHT}px` }
              : { height: `${CARD_FIXED_HEIGHT}px` }
          }
          className={`rounded-2xl border border-line bg-panel p-5 sm:p-6 shadow-xs flex flex-col justify-between min-w-0 self-start ${
            observacionesExpandidas ? "gap-4" : ""
          }`}
        >
          <div className="space-y-3.5">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-line">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Calificación y Devolución
              </h2>
              {asignacion.fechaCalificacion && (
                <span className="text-xs text-muted-foreground">
                  {formatFechaLegible(asignacion.fechaCalificacion)}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between rounded-xl border border-line bg-panel2 px-4 py-2.5">
              <span className="text-xs font-semibold text-muted-foreground">
                Nota final
              </span>
              <span className="text-sm font-bold text-foreground">
                {asignacion.estadoEntrega === "corregido" && tieneNota
                  ? `${asignacion.calificacion} / ${notaMaxima}`
                  : "Sin calificar"}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                Observaciones del docente
              </span>
              {esObservacionLarga && (
                <button
                  type="button"
                  onClick={() => setObservacionesExpandidas((prev) => !prev)}
                  className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  {observacionesExpandidas ? "Ver menos ▴" : "Ver más ▾"}
                </button>
              )}
            </div>

            {observacionesTexto ? (
              <div
                onClick={() => {
                  if (esObservacionLarga && !observacionesExpandidas) {
                    setObservacionesExpandidas(true);
                  }
                }}
                className={`px-3.5 py-2.5 rounded-xl border border-primary/20 bg-primary/5 text-xs text-foreground wrap-break-word leading-relaxed transition-all ${
                  observacionesExpandidas
                    ? "whitespace-pre-wrap max-h-64 overflow-y-auto"
                    : `truncate ${esObservacionLarga ? "cursor-pointer hover:border-primary/40" : ""}`
                }`}
                title={
                  !observacionesExpandidas && esObservacionLarga
                    ? "Click para expandir las observaciones"
                    : undefined
                }
              >
                {observacionesTexto}
              </div>
            ) : (
              <div className="px-3.5 py-2.5 rounded-xl border border-line/60 bg-panel2/40 text-xs text-muted-foreground italic truncate">
                {asignacion.estadoEntrega === "corregido"
                  ? "Calificado sin observaciones adicionales."
                  : "Aún no se registraron observaciones para esta entrega."}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Equipo de Trabajo (solo si es GRUPAL) */}
      {asignacion.tipo === "GRUPAL" && (
        <section className="rounded-2xl border border-line bg-panel p-6 shadow-xs space-y-4 min-w-0">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-line">
            <div className="flex items-center gap-2">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Equipo de Trabajo
              </h2>
              {asignacion.grupoNombre && (
                <>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="text-xs font-semibold text-foreground">
                    {asignacion.grupoNombre}
                  </span>
                </>
              )}
            </div>
            <span className="rounded-full bg-panel2 border border-line px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              {asignacion.integrantesDetalle?.length ||
                asignacion.integrantes?.length ||
                0}{" "}
              integrantes
            </span>
          </div>

          {asignacion.integrantesDetalle &&
          asignacion.integrantesDetalle.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {asignacion.integrantesDetalle.map((miembro) => {
                const esUsuarioActual = miembro.username === currentUsername;
                return (
                  <li
                    key={miembro.id ?? miembro.username}
                    className="flex items-center justify-between gap-3 rounded-xl border border-line bg-panel2/60 p-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={`https://github.com/${miembro.username}.png?size=64`}
                        alt={miembro.username}
                        className="w-8 h-8 rounded-full border border-line bg-panel shrink-0 object-cover"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`https://github.com/${miembro.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-foreground hover:text-primary hover:underline truncate"
                          >
                            {miembro.nombreCompleto || `@${miembro.username}`}
                          </a>
                          {esUsuarioActual && (
                            <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                              Vos
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          @{miembro.username}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Colaborador</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No se encontraron integrantes asociados al grupo.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
