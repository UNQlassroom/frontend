import type { AsignacionAlumnoDTO } from "@/types";
import {
  GUIA_GIT_TEMAS,
  type SubSeccionGuiaGit,
  ComandoCopiable,
  InteractiveTooltip,
} from "../guiaGit";
import githubIcon from "@/assets/github_favicon.svg";

export type { SubSeccionGuiaGit };

export interface GuiaGitTabProps {
  subSeccionActiva: SubSeccionGuiaGit;
  asignacion: AsignacionAlumnoDTO;
}

export function GuiaGitTab({ subSeccionActiva, asignacion }: GuiaGitTabProps) {
  const temaActivo =
    GUIA_GIT_TEMAS.find((t) => t.id === subSeccionActiva) ?? GUIA_GIT_TEMAS[0];

  const actionsUrl = asignacion.repoUrl ? `${asignacion.repoUrl}/actions` : null;

  return (
    <div className="space-y-6 animate-rise">
      {/* Contenido Detallado del Tema Activo */}
      <section className="rounded-2xl border border-line bg-panel p-6 sm:p-7 shadow-xs space-y-6">
        {/* Cabecera del tema actual */}
        <div className="pb-4 border-b border-line space-y-1">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
            Guía Git
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {temaActivo.titulo}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">
            {temaActivo.subtitulo}
          </p>
        </div>

        {/* Resumen explicativo y Cuándo Ocurre */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-line bg-panel2/40 p-4 space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
              ¿Qué es?
            </span>
            <p className="text-xs text-foreground leading-relaxed">
              {temaActivo.resumen}
            </p>
          </div>

          <div className="rounded-xl border border-line bg-panel2/40 p-4 space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
              ¿Cuándo te va a pasar?
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {temaActivo.cuandoOcurre}
            </p>
          </div>
        </div>

        {/* Pasos a seguir */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
            Pasos recomendados para destrabarte
          </h3>

          <div className="space-y-4">
            {temaActivo.pasos.map((paso) => (
              <div
                key={paso.numero}
                className="rounded-xl border border-line bg-panel2/30 p-4.5 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 font-bold text-xs">
                    {paso.numero}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-foreground">
                        {paso.titulo}
                      </h4>

                      {paso.tooltipExplicativo && (
                        <InteractiveTooltip
                          title={paso.tooltipExplicativo.titulo}
                          content={paso.tooltipExplicativo.contenido}
                          position="top"
                        />
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {paso.descripcion}
                    </p>
                  </div>
                </div>

                {/* Nota o bloque especial (ej: marcadores de conflicto) */}
                {paso.nota && (
                  <div className="rounded-lg border border-line bg-background p-3 font-mono text-xs text-muted-foreground whitespace-pre-wrap select-all">
                    {paso.nota}
                  </div>
                )}

                {/* Comando copiable interactivo */}
                {paso.comando && (
                  <ComandoCopiable
                    comando={paso.comando}
                    flags={paso.flags}
                    className="mt-2"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Consejo Pro o Abortar si existe */}
        {temaActivo.consejoPro && (
          <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4.5 space-y-2.5">
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-semibold text-xs sm:text-sm">
              <svg className="w-4 h-4 shrink-0 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>{temaActivo.consejoPro.titulo}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {temaActivo.consejoPro.texto}
            </p>
            {temaActivo.consejoPro.comando && (
              <ComandoCopiable
                comando={temaActivo.consejoPro.comando}
                className="mt-1"
              />
            )}
          </div>
        )}

        {/* Advertencia si existe */}
        {temaActivo.advertencia && (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4.5 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-semibold text-xs sm:text-sm">
              <svg className="w-4 h-4 shrink-0 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>{temaActivo.advertencia.titulo}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {temaActivo.advertencia.texto}
            </p>
          </div>
        )}

        {/* Footer de CI si estamos en ese tema */}
        {temaActivo.id === "ci" && actionsUrl && (
          <div className="rounded-xl border border-line bg-panel2/60 p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-semibold text-foreground">
                ¿Preferís la interfaz web de GitHub?
              </h4>
              <p className="text-xs text-muted-foreground">
                Podés reejecutar el workflow directamente con el botón de &ldquo;Re-run&rdquo; en la pestaña Actions de tu repositorio.
              </p>
            </div>
            <a
              href={actionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-line/40 transition-colors shrink-0 shadow-2xs cursor-pointer"
            >
              <img
                src={githubIcon}
                alt="GitHub"
                className="w-4 h-4 opacity-80"
              />
              <span>GitHub Actions</span>
              <span className="text-muted-foreground text-xs">↗</span>
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
