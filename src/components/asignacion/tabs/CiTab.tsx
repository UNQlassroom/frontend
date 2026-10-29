import { useState } from "react";
import type { AsignacionAlumnoDTO, DiagnosticoCIResponseDTO } from "@/types";
import { CIStatusBadge } from "@/components/common";
import { formatearFechaCommit, obtenerPrimerLineaCommit } from "@/utils";
import githubIcon from "@/assets/github_favicon.svg";

export interface CiTabProps {
  asignacion: AsignacionAlumnoDTO;
  diagnosticoCI: DiagnosticoCIResponseDTO | null;
  isLoading?: boolean;
}

export function CiTab({
  asignacion,
  diagnosticoCI,
  isLoading = false,
}: CiTabProps) {
  const [detalleAbierto, setDetalleAbierto] = useState(true);
  const [copiado, setCopiado] = useState(false);

  const estadoCI = (
    diagnosticoCI?.estadoCI ??
    asignacion.estadoCI ??
    "sin_ci"
  ).toLowerCase();

  const etapaFallida =
    diagnosticoCI?.etapaFallida ?? asignacion.ciEtapaFallida ?? null;
  const logError = diagnosticoCI?.logError ?? asignacion.ciLogError ?? null;
  const runUrl =
    diagnosticoCI?.runUrl ??
    asignacion.ciRunUrl ??
    (asignacion.repoUrl ? `${asignacion.repoUrl}/actions` : null);

  const commitUrl = (() => {
    if (!asignacion.repoUrl) return null;
    const ultimoCommit = asignacion.ultimoCommit?.trim();
    if (ultimoCommit && /^[0-9a-f]{7,40}$/i.test(ultimoCommit)) {
      return `${asignacion.repoUrl}/commit/${ultimoCommit}`;
    }
    const shaAdvertencia = asignacion.advertenciasGit?.[0]?.commitSha;
    if (shaAdvertencia) {
      return `${asignacion.repoUrl}/commit/${shaAdvertencia}`;
    }
    return `${asignacion.repoUrl}/commits`;
  })();

  const esFallo = estadoCI === "failure";
  const esExitoso = estadoCI === "success";
  const esPendiente = estadoCI === "pending";

  const handleCopyLog = () => {
    if (!logError) return;
    navigator.clipboard.writeText(logError).then(() => {
      setCopiado(true);
      setTimeout(() => {
        setCopiado(false);
      }, 2000);
    });
  };

  return (
    <section className="rounded-2xl border border-line bg-panel p-6 sm:p-7 shadow-xs space-y-6 animate-rise font-mono">
      {/* Encabezado de la sección */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-line">
        <div className="space-y-1">
          <h2 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
            Integración Continua (CI/CD)
          </h2>
          <p className="text-xs text-muted-foreground">
            Estado de compilación y ejecución del pipeline de GitHub Actions.
          </p>
        </div>

        <CIStatusBadge estado={estadoCI} />
      </div>

      {/* Información del último commit analizado y acceso a GitHub Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-line bg-panel2/60 p-4">
        <div className="space-y-1.5 min-w-0 flex-1">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
            Último commit analizado por CI
          </span>
          {asignacion.ultimoCommit ? (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {commitUrl ? (
                <a
                  href={commitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-line bg-panel px-2 py-0.5 font-semibold text-foreground hover:text-primary hover:border-primary/40 transition-colors inline-flex items-center gap-1.5 group"
                  title="Ver commit en GitHub"
                >
                  <span>{obtenerPrimerLineaCommit(asignacion.ultimoCommit)}</span>
                  <span className="text-muted-foreground group-hover:text-primary text-[10px] transition-colors">
                    ↗
                  </span>
                </a>
              ) : (
                <span className="rounded border border-line bg-panel px-2 py-0.5 font-semibold text-foreground">
                  {obtenerPrimerLineaCommit(asignacion.ultimoCommit)}
                </span>
              )}
              {asignacion.fechaUltimoCommit && (
                <>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="text-muted-foreground">
                    {formatearFechaCommit(asignacion.fechaUltimoCommit)}
                  </span>
                </>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Sin commits registrados recientemente.
            </p>
          )}
        </div>

        {runUrl && (
          <a
            href={runUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-line/40 transition-colors shrink-0 self-start sm:self-center shadow-2xs"
          >
            <img
              src={githubIcon}
              alt="GitHub"
              className="w-4 h-4 opacity-80"
            />
            <span>GitHub Actions</span>
            <span className="text-muted-foreground text-xs">↗</span>
          </a>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 gap-2.5">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs sm:text-sm text-muted-foreground">
            Consultando diagnóstico del pipeline...
          </span>
        </div>
      ) : esFallo ? (
        /* SUBTASK #145: Estado de falla de CI + Etapa fallida + Acordeón con extracto del log */
        <div className="space-y-4">
          {/* Tarjeta principal de alerta de falla y etapa */}
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl border border-rose-500/30 bg-rose-500/15 text-rose-600 flex items-center justify-center shrink-0 font-bold text-base">
                  ✕
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400">
                      El pipeline de CI falló
                    </h3>
                    {diagnosticoCI?.runId && (
                      <span className="rounded-md border border-rose-500/25 bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-rose-600">
                        Run #{diagnosticoCI.runId}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botón de Acordeón */}
              <button
                type="button"
                onClick={() => setDetalleAbierto((prev) => !prev)}
                aria-expanded={detalleAbierto}
                className="inline-flex items-center justify-between sm:justify-center gap-2 rounded-xl border border-rose-500/35 bg-panel hover:bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-700 dark:text-rose-300 transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                <span className="text-[11px] transition-transform duration-150">
                  {detalleAbierto ? "Achicar ▴" : "Expandir ▾"}
                </span>
              </button>
            </div>

            {/* Contenido colapsable del acordeón */}
            {detalleAbierto && (
              <div className="space-y-3 pt-1 animate-rise">
                {/* Bloque de código con sintaxis oscura y botón de copiar al portapapeles */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 overflow-hidden shadow-inner">
                  <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/90 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="inline-flex gap-1.5" aria-hidden="true">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      </span>
                      <span className="text-zinc-400 font-semibold truncate ml-1">
                        {etapaFallida
                          ? `log — ${etapaFallida}`
                          : "log — GitHub Actions"}
                      </span>
                    </div>

                    {logError && (
                      <button
                        type="button"
                        onClick={handleCopyLog}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                          copiado
                            ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                            : "border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                        }`}
                        title="Copiar extracto del log al portapapeles"
                      >
                        {copiado ? (
                          <>
                            <svg
                              className="w-3.5 h-3.5 text-emerald-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-3.5 h-3.5 text-zinc-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                            <span>Copiar log</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {logError ? (
                    <pre className="p-4 text-xs leading-relaxed text-zinc-100 overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap wrap-break-word selection:bg-rose-500/30">
                      <code>{logError}</code>
                    </pre>
                  ) : (
                    <div className="p-5 text-xs text-zinc-400 italic">
                      No se encontró un extracto de texto del log para esta
                      corrida. Podés inspeccionar la salida completa directamente
                      en GitHub Actions.
                    </div>
                  )}
                </div>

                {/* Pie del acordeón con enlace directo a la corrida completa */}
                {runUrl && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <a
                      href={runUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
                    >
                      <span>Ver detalle</span>
                      <span>↗</span>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : esExitoso ? (
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-6 flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-lg">
            ✓
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
              Pipeline ejecutado correctamente
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tu último push superó todas las etapas de compilación y verificación
              en GitHub Actions sin registrar errores.
            </p>
          </div>
        </div>
      ) : esPendiente ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 flex items-center gap-4">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400">
              Pipeline en ejecución
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              GitHub Actions está ejecutando las pruebas para tu último commit.
              Podés actualizar la asignación en unos instantes para ver el
              resultado.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-line/70 bg-panel2/40 p-8 text-center space-y-2">
          <p className="text-sm font-semibold text-foreground">
            Sin ejecuciones de CI registradas
          </p>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Aún no se registraron corridas de GitHub Actions para este
            repositorio. Asegurate de realizar un{" "}
            <code className="px-1.5 py-0.5 rounded bg-panel border border-line text-foreground">
              git push
            </code>{" "}
            para disparar el flujo de integración continua.
          </p>
        </div>
      )}
    </section>
  );
}
