import { useState } from "react";
import type { AsignacionAlumnoDTO } from "@/types";
import {
  GUIA_GIT_TEMAS,
  type GuiaTema,
  type TemaIconoId,
  ComandoCopiable,
  InteractiveTooltip,
} from "../guiaGit";
import githubIcon from "@/assets/github_favicon.svg";

export interface GuiaGitTabProps {
  asignacion: AsignacionAlumnoDTO;
}

function renderTemaIcon(tipo: TemaIconoId, className = "w-4 h-4") {
  switch (tipo) {
    case "conflictos":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="18" cy="18" r="3" />
          <circle cx="6" cy="6" r="3" />
          <path d="M6 9v12" />
          <path d="M18 9a9 9 0 0 0-9 9" />
        </svg>
      );
    case "revertir":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M12 7v5l4 2" />
        </svg>
      );
    case "sincronizar":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
        </svg>
      );
    case "ci":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      );
  }
}

export function GuiaGitTab({ asignacion }: GuiaGitTabProps) {
  const [temaActivoId, setTemaActivoId] = useState<GuiaTema["id"]>("conflictos");

  const temaActivo =
    GUIA_GIT_TEMAS.find((t) => t.id === temaActivoId) ?? GUIA_GIT_TEMAS[0];

  const actionsUrl = asignacion.repoUrl ? `${asignacion.repoUrl}/actions` : null;

  return (
    <div className="space-y-6 animate-rise">
      {/* Encabezado General de la Guía */}
      <section className="rounded-2xl border border-line bg-panel p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-primary shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="18" cy="18" r="3" />
                <circle cx="6" cy="6" r="3" />
                <path d="M6 9v12" />
                <path d="M18 9a9 9 0 0 0-9 9" />
              </svg>
              <h2 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Guía Git y Comandos Frecuentes
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Explicaciones interactivas y comandos recomendados para destrabarte ante
              errores comunes de sincronización y versionado.
            </p>
          </div>

          {actionsUrl && (
            <a
              href={actionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel2 px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-line/40 transition-colors shadow-2xs group shrink-0"
              title="Abrir GitHub Actions de tu repositorio"
            >
              <img src={githubIcon} alt="GitHub" className="w-3.5 h-3.5 opacity-80" />
              <span>Ver Actions en GitHub</span>
              <span className="text-muted-foreground group-hover:text-primary text-[10px] transition-colors">
                ↗
              </span>
            </a>
          )}
        </div>

        {/* Selector de Tópicos (Pills / Tabs temáticas) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {GUIA_GIT_TEMAS.map((tema) => {
            const isActive = tema.id === temaActivoId;
            return (
              <button
                key={tema.id}
                type="button"
                onClick={() => setTemaActivoId(tema.id)}
                className={`flex flex-col items-start gap-2 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? "border-primary/50 bg-primary/10 shadow-2xs"
                    : "border-line bg-panel2/50 hover:bg-panel2 text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-line/60 text-muted-foreground"
                    }`}
                  >
                    {renderTemaIcon(tema.tipoIcono, "w-3.5 h-3.5")}
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive
                        ? "bg-primary/20 text-primary font-bold"
                        : "bg-line/40 text-muted-foreground"
                    }`}
                  >
                    {tema.badge}
                  </span>
                </div>
                <span
                  className={`text-xs font-semibold line-clamp-1 ${
                    isActive ? "text-foreground font-bold" : "text-muted-foreground"
                  }`}
                >
                  {tema.titulo}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Contenido Detallado del Tema Activo */}
      <section className="rounded-2xl border border-line bg-panel p-6 sm:p-7 shadow-xs space-y-6">
        {/* Cabecera del tema actual */}
        <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-line">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                {renderTemaIcon(temaActivo.tipoIcono, "w-4 h-4")}
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground">
                {temaActivo.titulo}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">
              {temaActivo.subtitulo}
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-panel2 px-2.5 py-1 text-xs font-semibold text-foreground">
            <span>{temaActivo.badge}</span>
          </span>
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
          <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
            Pasos recomendados para destrabarte
          </h4>

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
                      <h5 className="text-xs sm:text-sm font-bold text-foreground">
                        {paso.titulo}
                      </h5>

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
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h5 className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400">
                ¿Preferís la interfaz web de GitHub?
              </h5>
              <p className="text-xs text-muted-foreground">
                Podés reejecutar el workflow directamente con el botón de &ldquo;Re-run&rdquo; en GitHub Actions.
              </p>
            </div>
            <a
              href={actionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold hover:bg-primary/90 transition-colors shadow-2xs shrink-0 cursor-pointer"
            >
              <span>Ir a GitHub Actions</span>
              <span className="text-xs">↗</span>
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
