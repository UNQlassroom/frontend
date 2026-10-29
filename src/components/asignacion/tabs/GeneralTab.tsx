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
  onVerBuenasPracticas,
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

  const advertenciasGit = asignacion.advertenciasGit ?? [];
  const primeraAdvertencia = advertenciasGit[0];

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
              <h2 className="font-mono text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Estado de tu Entrega
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 font-mono text-xs font-semibold ${badge.classes}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                <span>{badge.label}</span>
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
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
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Acción de Entrega / Reentrega */}
          <div>
            {!fueEntregada ? (
              isVencida ? (
                <div className="w-full rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-center font-mono text-xs font-semibold text-destructive">
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
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 font-mono text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 px-4 py-2.5 font-mono text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
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
              <div className="w-full rounded-xl border border-line bg-panel2 px-4 py-2.5 text-center font-mono text-xs text-muted-foreground">
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
              <h2 className="font-mono text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Calificación y Devolución
              </h2>
              {asignacion.fechaCalificacion && (
                <span className="font-mono text-xs text-muted-foreground">
                  {formatFechaLegible(asignacion.fechaCalificacion)}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between rounded-xl border border-line bg-panel2 px-4 py-2.5 font-mono">
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

          <div className="space-y-1.5 font-mono min-w-0">
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

      {/* Tarjeta pedagógica compacta de Calidad de Git (#142 - no bloqueante) */}
      {primeraAdvertencia && (
        <section className="rounded-2xl border border-amber-500/35 bg-amber-500/5 p-5 sm:p-6 shadow-xs font-mono space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-xl border border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300 text-sm shrink-0"
                aria-hidden="true"
              >
                💡
              </span>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-foreground">
                    Sugerencia pedagógica sobre tu último commit
                  </h3>
                  <span className="rounded-md border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                    {primeraAdvertencia.tipo === "MENSAJE_INADECUADO"
                      ? "Conventional Commits"
                      : "Commit no atómico"}
                  </span>
                  {advertenciasGit.length > 1 && (
                    <span className="rounded-full bg-panel border border-line px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      +{advertenciasGit.length - 1} más
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed wrap-break-word">
                  {primeraAdvertencia.mensajeExplicativo}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                  <span className="rounded border border-line bg-panel px-1.5 py-0.5 font-semibold text-foreground">
                    {primeraAdvertencia.commitSha.slice(0, 7)}
                  </span>
                  <span className="truncate max-w-md italic">
                    &ldquo;{primeraAdvertencia.mensajeCommit}&rdquo;
                  </span>
                </div>
              </div>
            </div>

            {onVerBuenasPracticas && (
              <button
                type="button"
                onClick={onVerBuenasPracticas}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/35 bg-panel hover:bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-foreground transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                <span>Ver detalle en Buenas Prácticas</span>
                <span>→</span>
              </button>
            )}
          </div>
        </section>
      )}

      {/* Equipo de Trabajo (solo si es GRUPAL) */}
      {asignacion.tipo === "GRUPAL" && (
        <section className="rounded-2xl border border-line bg-panel p-6 shadow-xs space-y-4 min-w-0">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-line font-mono">
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
                    className="flex items-center justify-between gap-3 rounded-xl border border-line bg-panel2/60 p-3 font-mono text-xs"
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
            <p className="font-mono text-xs text-muted-foreground italic">
              No se encontraron integrantes asociados al grupo.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
