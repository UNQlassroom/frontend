import type { AsignacionAlumnoDTO, MetricasCIResponseDTO } from "@/types";
import { formatFechaLegible, obtenerPrimerLineaCommit } from "@/utils";

export interface CoberturaTabProps {
  asignacion: AsignacionAlumnoDTO;
  metricas: MetricasCIResponseDTO | null;
  isLoading?: boolean;
}

export function CoberturaTab({
  asignacion,
  metricas,
  isLoading = false,
}: CoberturaTabProps) {
  const sinDatosRegistrados =
    !metricas ||
    (metricas.id === null &&
      metricas.testsEjecutados === 0 &&
      metricas.lineasCubiertas === 0 &&
      metricas.lineasPerdidas === 0);

  const porcentaje = Math.min(
    100,
    Math.max(0, Number(metricas?.coberturaLineas ?? 0))
  );
  const umbral = Number(metricas?.umbralCobertura ?? 80);
  const cumpleUmbral = Boolean(
    metricas?.cumpleUmbralCobertura ?? porcentaje >= umbral
  );

  const lineasCubiertas = metricas?.lineasCubiertas ?? 0;
  const lineasPerdidas = metricas?.lineasPerdidas ?? 0;
  const totalLineas = lineasCubiertas + lineasPerdidas;

  const testsEjecutados = metricas?.testsEjecutados ?? 0;
  const testsPasados = metricas?.testsPasados ?? 0;
  const testsFallados = metricas?.testsFallados ?? 0;
  const testsSalteados = metricas?.testsSalteados ?? 0;

  const tasaTestsPasados =
    testsEjecutados > 0 ? Math.round((testsPasados / testsEjecutados) * 100) : 0;

  const commitSha =
    metricas?.commitSha?.trim() ||
    (asignacion.ultimoCommit &&
    /^[0-9a-f]{7,40}$/i.test(asignacion.ultimoCommit.trim())
      ? asignacion.ultimoCommit.trim()
      : null) ||
    asignacion.advertenciasGit?.[0]?.commitSha ||
    null;

  const commitUrl = (() => {
    if (!asignacion.repoUrl || !commitSha) return null;
    if (/^[0-9a-f]{7,40}$/i.test(commitSha)) {
      return `${asignacion.repoUrl}/commit/${commitSha}`;
    }
    const shaAdvertencia = asignacion.advertenciasGit?.[0]?.commitSha;
    if (shaAdvertencia) {
      return `${asignacion.repoUrl}/commit/${shaAdvertencia}`;
    }
    return `${asignacion.repoUrl}/commits`;
  })();

  const nombreCommit = asignacion.ultimoCommit
    ? obtenerPrimerLineaCommit(asignacion.ultimoCommit)
    : commitSha
      ? commitSha.slice(0, 7)
      : null;

  // Parámetros del gráfico circular SVG
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (porcentaje / 100) * circumference;

  const colorCoberturaStroke = sinDatosRegistrados
    ? "stroke-muted-foreground/30"
    : cumpleUmbral
      ? "stroke-emerald-500"
      : porcentaje >= umbral * 0.65
        ? "stroke-amber-500"
        : "stroke-rose-500";

  const colorBarraLineal = sinDatosRegistrados
    ? "bg-muted-foreground/30"
    : cumpleUmbral
      ? "bg-emerald-500"
      : porcentaje >= umbral * 0.65
        ? "bg-amber-500"
        : "bg-rose-500";

  return (
    <section className="rounded-2xl border border-line bg-panel p-6 sm:p-7 shadow-xs space-y-6 animate-rise font-mono">
      {/* Encabezado general */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-line">
        <div className="space-y-1">
          <h2 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
            Cobertura de Tests y Métricas
          </h2>
          <p className="text-xs text-muted-foreground">
            Porcentaje de líneas cubiertas por pruebas unitarias y resultado de
            ejecución de la suite.
          </p>
        </div>

        {/* Semáforo de umbral sugerido por la cátedra */}
        {!sinDatosRegistrados ? (
          <span
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
              cumpleUmbral
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                cumpleUmbral ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            <span>
              {cumpleUmbral
                ? `Umbral alcanzado (≥ ${umbral}%)`
                : `Debajo del umbral sugerido (${umbral}%)`}
            </span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel2 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/60" />
            <span>Umbral sugerido: {umbral}%</span>
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 gap-2.5">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs sm:text-sm text-muted-foreground">
            Consultando métricas de cobertura y tests...
          </span>
        </div>
      ) : sinDatosRegistrados ? (
        <div className="rounded-xl border border-line/70 bg-panel2/40 p-8 text-center space-y-2">
          <p className="text-sm font-semibold text-foreground">
            Aún no se registraron métricas de cobertura ni tests
          </p>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Cuando el pipeline de GitHub Actions ejecute tus pruebas (JUnit) y
            genere el reporte de cobertura (JaCoCo), verás aquí el porcentaje de
            líneas cubiertas frente al umbral sugerido del{" "}
            <strong className="text-foreground">{umbral}%</strong>.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Bloque principal: Dos Cards equilibradas (50% / 50% en desktop) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* CARD 1: Widget de Cobertura de Líneas */}
            <div className="rounded-2xl border border-line bg-panel2/50 p-6 flex flex-col justify-between space-y-6">
              {/* Encabezado Card 1 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    Cobertura de Código
                  </h3>
                  <span className="rounded-md border border-line bg-panel px-2.5 py-1 text-xs font-bold text-foreground shrink-0">
                    Meta: {umbral}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Porcentaje de líneas cubiertas por pruebas unitarias.
                </p>
              </div>

              {/* Gráfico circular + Barra de progreso */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Progreso Circular SVG */}
                <div className="relative flex items-center justify-center shrink-0">
                  <svg
                    className="w-32 h-32 -rotate-90 transform"
                    viewBox="0 0 128 128"
                  >
                    <circle
                      cx="64"
                      cy="64"
                      r={radius}
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="10"
                      className="text-line/70"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r={radius}
                      fill="transparent"
                      strokeWidth="10"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className={`${colorCoberturaStroke} transition-all duration-500`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-bold text-foreground">
                      {porcentaje.toFixed(1)}%
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Cobertura
                    </span>
                  </div>
                </div>

                {/* Barra lineal */}
                <div className="flex-1 w-full space-y-2.5 min-w-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">
                      Progreso global
                    </span>

                  </div>

                  {/* Barra de progreso lineal con marcador de umbral */}
                  <div className="relative h-3.5 w-full rounded-full bg-line/70 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${colorBarraLineal}`}
                      style={{ width: `${porcentaje}%` }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-foreground/70"
                      style={{ left: `${Math.min(100, Math.max(0, umbral))}%` }}
                      title={`Umbral mínimo sugerido: ${umbral}%`}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Línea divisoria marca el objetivo de la cátedra ({umbral}%).
                  </p>
                </div>
              </div>

              {/* Subcards de líneas: Cubiertas, Perdidas, Total Líneas */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl border border-line bg-panel p-3.5 sm:p-4 space-y-1 shadow-2xs">
                  <span className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Líneas Cubiertas
                  </span>
                  <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 block">
                    {lineasCubiertas}
                  </span>
                </div>
                <div className="rounded-xl border border-line bg-panel p-3.5 sm:p-4 space-y-1 shadow-2xs">
                  <span className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Líneas Perdidas
                  </span>
                  <span className="text-xl sm:text-2xl font-extrabold text-rose-600 dark:text-rose-400 block">
                    {lineasPerdidas}
                  </span>
                </div>
                <div className="rounded-xl border border-line bg-panel p-3.5 sm:p-4 space-y-1 shadow-2xs">
                  <span className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Líneas Totales
                  </span>
                  <span className="text-xl sm:text-2xl font-extrabold text-foreground block">
                    {totalLineas}
                  </span>
                </div>
              </div>

            </div>

            {/* CARD 2: Resumen de Estado de Tests JUnit */}
            <div className="rounded-2xl border border-line bg-panel2/50 p-6 flex flex-col justify-between space-y-6">
              {/* Encabezado Card 2 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    Estado de Pruebas
                  </h3>
                  <span className="rounded-md border border-line bg-panel px-2.5 py-1 text-xs font-bold text-foreground shrink-0">
                    {tasaTestsPasados}% exitosos
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Resumen de casos de prueba ejecutados en la corrida.
                </p>
              </div>

              {/* 4 Subcards en cuadrícula 2x2 que se expanden proporcionalmente */}
              <div className="grid grid-cols-2 gap-3.5 sm:gap-4 flex-1">
                {/* Ejecutados */}
                <div className="rounded-xl border border-line bg-panel p-4 sm:p-5 flex flex-col justify-between space-y-2 shadow-2xs">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block">
                    Ejecutados
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-foreground block">
                    {testsEjecutados}
                  </span>
                </div>

                {/* Pasados */}
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 sm:p-5 flex flex-col justify-between space-y-2 shadow-2xs">
                  <span className="text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold block">
                    Pasados ✓
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 block">
                    {testsPasados}
                  </span>
                </div>

                {/* Fallados */}
                <div
                  className={`rounded-xl border p-4 sm:p-5 flex flex-col justify-between space-y-2 shadow-2xs ${
                    testsFallados > 0
                      ? "border-rose-500/30 bg-rose-500/5"
                      : "border-line bg-panel"
                  }`}
                >
                  <span
                    className={`text-xs uppercase tracking-wider font-semibold block ${
                      testsFallados > 0
                        ? "text-rose-700 dark:text-rose-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    Fallados ✕
                  </span>
                  <span
                    className={`text-2xl sm:text-3xl font-extrabold block ${
                      testsFallados > 0
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-foreground"
                    }`}
                  >
                    {testsFallados}
                  </span>
                </div>

                {/* Salteados */}
                <div className="rounded-xl border border-line bg-panel p-4 sm:p-5 flex flex-col justify-between space-y-2 shadow-2xs">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block">
                    Salteados
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-muted-foreground block">
                    {testsSalteados}
                  </span>
                </div>
              </div>

              {/* Metadatos del reporte: Commit (link estilo CI) y Actualizado */}
              <div className="pt-3 border-t border-line flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                {nombreCommit ? (
                  <div className="inline-flex items-center gap-1.5 min-w-0">
                    <span className="shrink-0">Commit:</span>
                    {commitUrl ? (
                      <a
                        href={commitUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded border border-line bg-panel px-2 py-0.5 font-semibold text-foreground hover:text-primary hover:border-primary/40 transition-colors inline-flex items-center gap-1.5 group max-w-xs sm:max-w-md truncate"
                        title="Ver commit en GitHub"
                      >
                        <span className="truncate">{nombreCommit}</span>
                        <span className="text-muted-foreground group-hover:text-primary text-[10px] font-bold transition-colors shrink-0">
                          ↗
                        </span>
                      </a>
                    ) : (
                      <span className="rounded border border-line bg-panel px-2 py-0.5 font-semibold text-foreground truncate max-w-xs sm:max-w-md">
                        {nombreCommit}
                      </span>
                    )}
                  </div>
                ) : null}
                {metricas?.fechaActualizacion ? (
                  <span className="shrink-0">
                    Actualizado:{" "}
                    <strong className="text-foreground">
                      {formatFechaLegible(metricas.fechaActualizacion)}
                    </strong>
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
