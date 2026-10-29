import { useState, useMemo } from "react";
import type {
  AsignacionAlumnoDTO,
  ReporteLinterResponseDTO,
  SeveridadLinter,
} from "@/types";
import { formatFechaLegible, obtenerPrimerLineaCommit } from "@/utils";

export interface BuenasPracticasTabProps {
  asignacion: AsignacionAlumnoDTO;
  reporteLinter: ReporteLinterResponseDTO | null;
  isLoadingLinter?: boolean;
}

export function BuenasPracticasTab({
  asignacion,
  reporteLinter,
  isLoadingLinter = false,
}: BuenasPracticasTabProps) {
  const advertenciasGit = useMemo(
    () => asignacion.advertenciasGit ?? [],
    [asignacion.advertenciasGit]
  );

  const storageKey = `unqlassroom_git_descartadas_${asignacion.id ?? "general"}`;

  const [descartadas, setDescartadas] = useState<Set<string>>(() => {
    try {
      const guardadas = localStorage.getItem(storageKey);
      if (guardadas) {
        return new Set(JSON.parse(guardadas) as string[]);
      }
    } catch {
      // Ignorar errores al acceder a localStorage
    }
    return new Set<string>();
  });

  const [listaLinterAbierta, setListaLinterAbierta] = useState(true);
  const [filtroSeveridad, setFiltroSeveridad] = useState<
    "TODAS" | SeveridadLinter
  >("TODAS");

  const totalIncidencias = reporteLinter?.totalIncidencias ?? 0;
  const cantidadErrores = reporteLinter?.cantidadErrores ?? 0;
  const cantidadAdvertencias = reporteLinter?.cantidadAdvertencias ?? 0;
  const incidencias = useMemo(
    () => reporteLinter?.incidencias ?? [],
    [reporteLinter?.incidencias]
  );

  const incidenciasFiltradas = useMemo(() => {
    if (filtroSeveridad === "TODAS") return incidencias;
    return incidencias.filter((inc) => inc.severidad === filtroSeveridad);
  }, [incidencias, filtroSeveridad]);

  const sinReporteLinter =
    !reporteLinter ||
    (reporteLinter.id === null &&
      totalIncidencias === 0 &&
      incidencias.length === 0);

  const commitShaLinter =
    reporteLinter?.commitSha?.trim() ||
    (asignacion.ultimoCommit &&
    /^[0-9a-f]{7,40}$/i.test(asignacion.ultimoCommit.trim())
      ? asignacion.ultimoCommit.trim()
      : null) ||
    asignacion.advertenciasGit?.[0]?.commitSha ||
    null;

  const commitUrlLinter = (() => {
    if (!asignacion.repoUrl || !commitShaLinter) return null;
    if (/^[0-9a-f]{7,40}$/i.test(commitShaLinter)) {
      return `${asignacion.repoUrl}/commit/${commitShaLinter}`;
    }
    const shaAdvertencia = asignacion.advertenciasGit?.[0]?.commitSha;
    if (shaAdvertencia) {
      return `${asignacion.repoUrl}/commit/${shaAdvertencia}`;
    }
    return `${asignacion.repoUrl}/commits`;
  })();

  const nombreCommitLinter = asignacion.ultimoCommit
    ? obtenerPrimerLineaCommit(asignacion.ultimoCommit)
    : commitShaLinter
      ? commitShaLinter.slice(0, 7)
      : null;

  const sugerenciasActivas = useMemo(() => {
    return advertenciasGit.filter((adv, index) => {
      const key =
        adv.id?.toString() ?? `${adv.commitSha}-${adv.tipo}-${index}`;
      return !descartadas.has(key);
    });
  }, [advertenciasGit, descartadas]);

  const handleDescartar = (key: string) => {
    setDescartadas((prev) => {
      const next = new Set(prev);
      next.add(key);
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
      } catch {
        // Fallback seguro
      }
      return next;
    });
  };

  const handleRestablecer = () => {
    setDescartadas(new Set());
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Fallback seguro
    }
  };

  return (
    <div className="space-y-6 animate-rise font-mono">
      {/* =====================================================================
          SECCIÓN 1: Análisis Estático de Código (Linter)
      ===================================================================== */}
      <section className="rounded-2xl border border-line bg-panel p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-line">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Análisis Estático de Código
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Resumen de estilo, convenciones y posibles defectos detectados en
              el código fuente.
            </p>
          </div>


        </div>

        {isLoadingLinter ? (
          <div className="flex items-center justify-center py-10 gap-2.5">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs sm:text-sm text-muted-foreground">
              Consultando reporte del linter...
            </span>
          </div>
        ) : sinReporteLinter ? (
          <div className="rounded-xl border border-line/70 bg-panel2/40 p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-foreground">
              Sin reporte de linter registrado
            </p>
            <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Aún no se recibieron reportes de análisis estático para este
              repositorio. Se actualizará automáticamente tras ejecutarse el
              workflow de CI.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tarjetas de Contador General de Incidencias */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <button
                type="button"
                onClick={() => setFiltroSeveridad("TODAS")}
                className={`text-left rounded-xl border p-4 transition-all cursor-pointer ${
                  filtroSeveridad === "TODAS"
                    ? "border-foreground/40 bg-panel2 shadow-2xs"
                    : "border-line bg-panel2/50 hover:bg-panel2"
                }`}
              >
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
                  Total Incidencias
                </span>
                <span className="text-2xl font-bold text-foreground mt-1 block">
                  {totalIncidencias}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFiltroSeveridad("ERROR")}
                className={`text-left rounded-xl border p-4 transition-all cursor-pointer ${
                  filtroSeveridad === "ERROR"
                    ? "border-rose-500/50 bg-rose-500/10 shadow-2xs"
                    : "border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10"
                }`}
              >
                <span className="text-[11px] uppercase tracking-wider text-rose-700 dark:text-rose-400 font-semibold block">
                  Errores
                </span>
                <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 block">
                  {cantidadErrores}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFiltroSeveridad("WARNING")}
                className={`text-left rounded-xl border p-4 transition-all cursor-pointer ${
                  filtroSeveridad === "WARNING"
                    ? "border-amber-500/50 bg-amber-500/10 shadow-2xs"
                    : "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10"
                }`}
              >
                <span className="text-[11px] uppercase tracking-wider text-amber-700 dark:text-amber-300 font-semibold block">
                  Advertencias
                </span>
                <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
                  {cantidadAdvertencias}
                </span>
              </button>
            </div>

            {incidencias.length === 0 ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-base">
                  ✓
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    ¡Código limpio! 0 infracciones detectadas
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    El análisis del linter finalizó sin encontrar errores ni
                    advertencias en los archivos del repositorio.
                  </p>
                </div>
              </div>
            ) : (
              /* Lista colapsable de infracciones */
              <div className="rounded-xl border border-line bg-panel2/30 overflow-hidden">
                {/* Cabecera del colapsable */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-line bg-panel2">
                  <button
                    type="button"
                    onClick={() => setListaLinterAbierta((prev) => !prev)}
                    aria-expanded={listaLinterAbierta}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    <span>
                      {listaLinterAbierta
                        ? "▾ Ocultar detalle"
                        : "▸ Ver detalle"}
                    </span>
                    <span className="rounded-full bg-line/70 px-2.5 py-0.5 text-xs text-muted-foreground font-semibold">
                      {incidenciasFiltradas.length}
                    </span>
                  </button>
                </div>

                {listaLinterAbierta && (
                  <div className="divide-y divide-line/60 max-h-112 overflow-y-auto animate-rise">
                    {incidenciasFiltradas.length === 0 ? (
                      <div className="p-6 text-center text-xs text-muted-foreground">
                        No hay infracciones para la severidad seleccionada.
                      </div>
                    ) : (
                      incidenciasFiltradas.map((item, idx) => {
                        const esError = item.severidad === "ERROR";
                        const itemKey =
                          item.id ??
                          `${item.archivo}-${item.linea}-${item.regla}-${idx}`;

                        return (
                          <div
                            key={itemKey}
                            className="p-4 hover:bg-line/15 transition-colors space-y-2"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                                    esError
                                      ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30"
                                      : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                                  }`}
                                >
                                  {esError ? "ERROR" : "ADVERTENCIA"}
                                </span>
                                <span className="font-semibold text-xs text-foreground">
                                  {item.archivo}:{item.linea}
                                  {item.columna !== null &&
                                    `:${item.columna}`}
                                </span>
                              </div>

                              <span
                                className="inline-flex items-center gap-1 rounded-md border border-line bg-panel px-2.5 py-0.5 text-xs font-semibold text-foreground shrink-0"
                                title={`Regla violada: ${item.regla}`}
                              >
                                <span className="text-muted-foreground">
                                  Regla violada:
                                </span>
                                <code>{item.regla}</code>
                              </span>
                            </div>

                            {item.mensaje && (
                              <p className="text-xs text-muted-foreground leading-relaxed pl-1 wrap-break-word">
                                {item.mensaje}
                              </p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Metadatos del reporte del linter (igual que en CiTab y Cobertura) */}
            {(nombreCommitLinter || reporteLinter?.fechaActualizacion) && (
              <div className="pt-3 border-t border-line flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                {nombreCommitLinter ? (
                  <div className="inline-flex items-center gap-1.5 min-w-0">
                    <span className="shrink-0">Commit:</span>
                    {commitUrlLinter ? (
                      <a
                        href={commitUrlLinter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded border border-line bg-panel px-2 py-0.5 font-semibold text-foreground hover:text-primary hover:border-primary/40 transition-colors inline-flex items-center gap-1.5 group max-w-xs sm:max-w-md truncate"
                        title="Ver commit en GitHub"
                      >
                        <span className="truncate">{nombreCommitLinter}</span>
                        <span className="text-muted-foreground group-hover:text-primary text-[10px] font-bold transition-colors shrink-0">
                          ↗
                        </span>
                      </a>
                    ) : (
                      <span className="rounded border border-line bg-panel px-2 py-0.5 font-semibold text-foreground truncate max-w-xs sm:max-w-md">
                        {nombreCommitLinter}
                      </span>
                    )}
                  </div>
                ) : null}
                {reporteLinter?.fechaActualizacion ? (
                  <span className="shrink-0">
                    Actualizado:{" "}
                    <strong className="text-foreground">
                      {formatFechaLegible(reporteLinter.fechaActualizacion)}
                    </strong>
                  </span>
                ) : null}
              </div>
            )}
          </div>
        )}
      </section>

      {/* =====================================================================
          SECCIÓN 2: Sugerencias de Git (Buenas Prácticas)
      ===================================================================== */}
      <section className="rounded-2xl border border-line bg-panel p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-line">
          <div className="space-y-1">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              Sugerencias de Git
            </h2>
            <p className="text-xs text-muted-foreground">
              Recomendaciones y buenas prácticas para mantener un historial limpio.
            </p>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold ${
              sugerenciasActivas.length > 0
                ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                : "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                sugerenciasActivas.length > 0 ? "bg-amber-500" : "bg-emerald-500"
              }`}
            />
            <span>
              {sugerenciasActivas.length > 0
                ? `${sugerenciasActivas.length} ${
                    sugerenciasActivas.length === 1
                      ? "Sugerencia activa"
                      : "Sugerencias activas"
                  }`
                : "Sin sugerencias pendientes"}
            </span>
          </span>
        </div>

        {sugerenciasActivas.length === 0 ? (
          <div className="rounded-xl border border-line/70 bg-panel2/40 p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full border border-emerald-500/30 bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto font-bold text-base">
              ✓
            </div>
            <p className="text-sm font-semibold text-foreground">
              Todo en orden con tus commits
            </p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              ¡Tus commits vienen respetando las buenas prácticas!
            </p>
            {descartadas.size > 0 && (
              <button
                type="button"
                onClick={handleRestablecer}
                className="pt-2 text-xs font-semibold text-primary hover:underline cursor-pointer block mx-auto"
              >
                Volver a ver sugerencias descartadas ({descartadas.size})
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {sugerenciasActivas.map((adv, index) => {
              const esMensajeInadecuado = adv.tipo === "MENSAJE_INADECUADO";
              const key =
                adv.id?.toString() ?? `${adv.commitSha}-${adv.tipo}-${index}`;

              const commitUrl =
                asignacion.repoUrl && adv.commitSha
                  ? `${asignacion.repoUrl}/commit/${adv.commitSha}`
                  : asignacion.repoUrl
                    ? `${asignacion.repoUrl}/commits`
                    : null;

              return (
                <article
                  key={key}
                  className="rounded-xl border border-line bg-panel2/40 hover:bg-panel2/70 p-4 transition-colors space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <span
                        className="text-base select-none shrink-0 mt-0.5"
                        aria-hidden="true"
                      >
                        💡
                      </span>
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xs sm:text-sm font-bold text-foreground">
                            {esMensajeInadecuado
                              ? "Formato del mensaje"
                              : "Commit con muchos cambios"}
                          </h3>
                          {adv.mensajeCommit && (
                            commitUrl ? (
                              <a
                                href={commitUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-md border border-line bg-panel px-2 py-0.5 text-[11px] font-semibold text-foreground hover:text-primary hover:border-primary/40 transition-colors group truncate max-w-md"
                                title="Ver commit en GitHub"
                              >
                                <span className="truncate italic">
                                  &ldquo;{adv.mensajeCommit}&rdquo;
                                </span>
                                <span className="text-muted-foreground group-hover:text-primary text-[11px] font-bold transition-colors shrink-0">
                                  ↗
                                </span>
                              </a>
                            ) : (
                              <span className="rounded-md border border-line bg-panel px-2 py-0.5 text-[11px] text-muted-foreground italic truncate max-w-md">
                                &ldquo;{adv.mensajeCommit}&rdquo;
                              </span>
                            )
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {esMensajeInadecuado
                            ? "Te sugerimos usar prefijos descriptivos (como feat:, fix: o docs:) para que se entienda el propósito del cambio a primera vista."
                            : "Este commit reúne muchos cambios a la vez. Tratá de hacer commits más pequeños y enfocados para que el historial sea más fácil de revisar."}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDescartar(key)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-line/70 bg-panel px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-line/40 transition-colors cursor-pointer shrink-0 shadow-2xs"
                      title="Descartar sugerencia"
                    >
                      <span>Descartar</span>
                      <span className="text-[11px]">✕</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
