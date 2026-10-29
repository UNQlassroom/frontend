import { useState, useMemo } from "react";
import type {
  AsignacionAlumnoDTO,
  ReporteLinterResponseDTO,
  SeveridadLinter,
} from "@/types";
import { formatFechaLegible } from "@/utils";

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
  const advertenciasGit = asignacion.advertenciasGit ?? [];

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

  return (
    <div className="space-y-6 animate-rise font-mono">
      {/* =====================================================================
          SECCIÓN 1: Alertas y Diagnóstico de Calidad de Git (Subtask #142)
      ===================================================================== */}
      <section className="rounded-2xl border border-line bg-panel p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-line">
          <div className="space-y-1">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              Calidad de Git y Commits
            </h2>
            <p className="text-xs text-muted-foreground">
              Diagnóstico pedagógico sobre atomicidad y convenciones de mensajes
              en tus commits.
            </p>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold ${
              advertenciasGit.length > 0
                ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                : "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                advertenciasGit.length > 0 ? "bg-amber-500" : "bg-emerald-500"
              }`}
            />
            <span>
              {advertenciasGit.length === 0
                ? "Sin advertencias de Git"
                : `${advertenciasGit.length} ${
                    advertenciasGit.length === 1
                      ? "sugerencia activa"
                      : "sugerencias activas"
                  }`}
            </span>
          </span>
        </div>

        {advertenciasGit.length === 0 ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-base">
              ✓
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                Buenas prácticas de Git al día
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                No se detectaron alertas de atomicidad ni de formato en los
                mensajes de tus commits recientes.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {advertenciasGit.map((adv, index) => {
              const esMensajeInadecuado = adv.tipo === "MENSAJE_INADECUADO";
              const key = adv.id ?? `${adv.commitSha}-${adv.tipo}-${index}`;

              return (
                <article
                  key={key}
                  className="rounded-xl border border-amber-500/35 bg-amber-500/5 p-5 space-y-4"
                >
                  {/* Encabezado de la tarjeta de alerta */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/35 bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300">
                        <span>💡</span>
                        <span>
                          {esMensajeInadecuado
                            ? "Sugerencia de Conventional Commits"
                            : "Alerta de Commit no atómico"}
                        </span>
                      </span>

                      <span className="rounded-md border border-line bg-panel px-2 py-0.5 text-xs font-semibold text-foreground">
                        SHA: {adv.commitSha.slice(0, 7)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {adv.autorUsername && <span>Por @{adv.autorUsername}</span>}
                      {adv.fechaCommit && (
                        <>
                          <span>•</span>
                          <span>{formatFechaLegible(adv.fechaCommit)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Mensaje del commit analizado y métricas de archivos/líneas */}
                  <div className="rounded-lg border border-line bg-panel p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                        Mensaje del commit registrado
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-foreground wrap-break-word">
                        &ldquo;{adv.mensajeCommit}&rdquo;
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs shrink-0">
                      <span className="rounded-md border border-line bg-panel2 px-2.5 py-1 text-muted-foreground">
                        <strong className="text-foreground">
                          {adv.archivosModificados}
                        </strong>{" "}
                        {adv.archivosModificados === 1 ? "archivo" : "archivos"}
                      </span>
                      <span className="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 font-semibold text-emerald-700 dark:text-emerald-400">
                        +{adv.lineasAgregadas}
                      </span>
                      <span className="rounded-md border border-rose-500/25 bg-rose-500/10 px-2 py-1 font-semibold text-rose-700 dark:text-rose-400">
                        -{adv.lineasEliminadas}
                      </span>
                    </div>
                  </div>

                  {/* Mensaje explicativo recomendado y guía no bloqueante */}
                  <div className="rounded-lg border border-amber-500/25 bg-panel/90 p-4 space-y-2.5">
                    <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <span> Diagnóstico y recomendación pedagógica:</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap wrap-break-word">
                      {adv.mensajeExplicativo}
                    </p>

                    {esMensajeInadecuado ? (
                      <div className="pt-2 border-t border-line/70 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          Formato sugerido (Conventional Commits):
                        </span>
                        <code className="px-1.5 py-0.5 rounded bg-panel2 border border-line text-foreground">
                          feat: agregar validación
                        </code>
                        <code className="px-1.5 py-0.5 rounded bg-panel2 border border-line text-foreground">
                          fix: corregir cálculo
                        </code>
                        <code className="px-1.5 py-0.5 rounded bg-panel2 border border-line text-foreground">
                          test: sumar pruebas unitarias
                        </code>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-line/70 text-[11px] text-muted-foreground">
                        <strong className="text-foreground">Consejo:</strong>{" "}
                        Realizá commits más pequeños y frecuentes enfocados en un
                        único cambio lógico para facilitar la revisión y el
                        diagnóstico de errores.
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* =====================================================================
          SECCIÓN 2: Lista Colapsable y Contador de Incidencias de Linter (#150)
      ===================================================================== */}
      <section className="rounded-2xl border border-line bg-panel p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-line">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Análisis Estático de Código (Linter)
              </h2>
              {reporteLinter?.herramienta && (
                <span className="rounded-md border border-line bg-panel2 px-2 py-0.5 text-[11px] font-semibold text-foreground">
                  {reporteLinter.herramienta}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Resumen de estilo, convenciones y posibles defectos detectados en
              el código fuente.
            </p>
          </div>

          {/* Contador general diferenciando errores y advertencias */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                cantidadErrores > 0
                  ? "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                  : "border-line bg-panel2 text-muted-foreground"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  cantidadErrores > 0
                    ? "bg-rose-500"
                    : "bg-muted-foreground/50"
                }`}
              />
              <span>
                {cantidadErrores} {cantidadErrores === 1 ? "Error" : "Errores"}
              </span>
            </span>

            <span
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                cantidadAdvertencias > 0
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                  : "border-line bg-panel2 text-muted-foreground"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  cantidadAdvertencias > 0
                    ? "bg-amber-500"
                    : "bg-muted-foreground/50"
                }`}
              />
              <span>
                {cantidadAdvertencias}{" "}
                {cantidadAdvertencias === 1 ? "Advertencia" : "Advertencias"}
              </span>
            </span>
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
                        ? "▾ Ocultar detalle de infracciones"
                        : "▸ Ver detalle de infracciones"}
                    </span>
                    <span className="rounded-full bg-line/70 px-2.5 py-0.5 text-xs text-muted-foreground font-semibold">
                      {incidenciasFiltradas.length}
                    </span>
                  </button>

                  {filtroSeveridad !== "TODAS" && (
                    <button
                      type="button"
                      onClick={() => setFiltroSeveridad("TODAS")}
                      className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Mostrar todas ({incidencias.length})
                    </button>
                  )}
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
                              {/* Archivo afectado + Línea exacta */}
                              <div className="flex flex-wrap items-center gap-2 min-w-0">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold shrink-0 ${
                                    esError
                                      ? "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                                      : "border-amber-500/30 bg-amber-500/15 text-amber-800 dark:text-amber-300"
                                  }`}
                                >
                                  <span>{esError ? "✕ ERROR" : "⚠ WARNING"}</span>
                                </span>

                                <span
                                  className="text-xs sm:text-sm font-bold text-foreground break-all"
                                  title={item.archivo}
                                >
                                  {item.archivo}
                                </span>

                                <span className="rounded-md border border-line bg-panel px-2 py-0.5 text-xs font-semibold text-primary shrink-0">
                                  Línea {item.linea}
                                  {typeof item.columna === "number"
                                    ? `:${item.columna}`
                                    : ""}
                                </span>
                              </div>

                              {/* Regla violada (ej: unused import) */}
                              <span
                                className="inline-flex items-center gap-1 rounded-md border border-line bg-panel px-2.5 py-0.5 text-xs font-semibold text-foreground shrink-0"
                                title={`Regla violada: ${item.regla}`}
                              >
                                <span className="text-muted-foreground">
                                  Regla:
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
          </div>
        )}
      </section>
    </div>
  );
}
