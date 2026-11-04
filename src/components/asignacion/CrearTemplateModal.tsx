import { useState, type SubmitEvent } from "react";
import { crearTemplate } from "@/services";
import type { TemplateRepoResponseDTO } from "@/types";
import githubIcon from "@/assets/github_favicon.svg";

export interface CrearTemplateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (nuevoTemplate: TemplateRepoResponseDTO) => void;
}

export function CrearTemplateModal({
  open,
  onClose,
  onSuccess,
}: CrearTemplateModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templateCreado, setTemplateCreado] = useState<TemplateRepoResponseDTO | null>(null);

  if (!open) return null;

  const handleClose = () => {
    setName("");
    setDescription("");
    setError(null);
    setTemplateCreado(null);
    setIsLoading(false);
    onClose();
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const nameClean = name.trim();
    if (!nameClean) {
      setError("El nombre del repositorio plantilla es obligatorio.");
      return;
    }

    // Validación básica de nombre de repositorio en GitHub (sin espacios)
    if (!/^[a-zA-Z0-9._-]+$/.test(nameClean)) {
      setError("El nombre del repositorio solo puede contener letras, números, puntos, guiones y guiones bajos (sin espacios).");
      return;
    }

    setIsLoading(true);
    try {
      const response = await crearTemplate({
        name: nameClean,
        description: description.trim() || undefined,
      });
      setTemplateCreado(response.data);
    } catch {
      setError("Ocurrió un error generando el repositorio.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsarTemplate = () => {
    if (templateCreado) {
      onSuccess(templateCreado);
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-60 grid place-items-center bg-background/70 backdrop-blur-[2px] p-4 animate-rise">
      <div className="w-full max-w-xl rounded-2xl border border-line bg-panel2 p-6 sm:p-7 shadow-2xl flex flex-col space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-line">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">
              GitHub Template
            </p>
            <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {templateCreado ? "Repositorio plantilla creado" : "Crear repositorio plantilla"}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-line/40 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Vista si ya fue creado exitosamente */}
        {templateCreado ? (
          <div className="space-y-5 py-2">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">✅</span>
                <h3 className="font-display text-lg font-bold text-foreground">
                  {templateCreado.name}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                El repositorio se creó exitosamente en la organización de GitHub como plantilla.
                Ya podés abrirlo para clonarlo y subir el código inicial.
              </p>

              {/* Botón destacado con el link de GitHub para subir cosas al repo */}
              <div className="pt-2">
                <a
                  href={templateCreado.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 w-full rounded-xl border border-line bg-panel text-foreground py-3 px-4 text-sm font-semibold hover:bg-line/40 transition-colors shadow-xs cursor-pointer"
                  title="Abrir repositorio en GitHub para subir código"
                >
                  <img
                    src={githubIcon}
                    alt="GitHub"
                    className="w-5 h-5 opacity-80"
                  />
                  <span>Abrir en GitHub para subir archivos</span>
                </a>
              </div>

              {/* Recordatorio sobre inyección de dependencias y CI */}
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3.5 text-xs text-muted-foreground flex items-start gap-2.5">
                <span className="text-sm shrink-0 mt-0.5">ℹ️</span>
                <p className="leading-relaxed">
                  <strong className="text-foreground font-semibold">Configuración previa:</strong> Podés subir tu código y hacer todos los cambios que creas necesarios en GitHub. Al <strong>usar esta plantilla al crear una asignación</strong>, la plataforma inyectará automáticamente el CI y las dependencias que hagan falta para habilitar las métricas y correcciones.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-line flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-line/40 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleUsarTemplate}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              >
                Usar en esta asignación
              </button>
            </div>
          </div>
        ) : (
          /* Formulario de creación */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="template-name"
                className="mb-1.5 block text-xs uppercase tracking-wider font-semibold text-muted-foreground"
              >
                Nombre del repositorio plantilla *
              </label>
              <input
                id="template-name"
                type="text"
                required
                disabled={isLoading}
                placeholder="Ej: tp-algebra-template"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                className="w-full rounded-xl border border-line bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Se creará en la organización como repositorio marcado como plantilla de GitHub.
              </p>
            </div>

            <div>
              <label
                htmlFor="template-description"
                className="mb-1.5 block text-xs uppercase tracking-wider font-semibold text-muted-foreground"
              >
                Descripción (opcional)
              </label>
              <textarea
                id="template-description"
                rows={3}
                disabled={isLoading}
                placeholder="Ej: este repositorio tiene como objetivo..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-line bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            {/* Advertencia sobre inyección de dependencias y CI */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 sm:p-4 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5">
                <svg
                  className="w-4 h-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="space-y-1">
                  <p className="font-semibold text-amber-700 dark:text-amber-300">
                    Aviso sobre el uso de la plantilla
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Vas a poder clonar el repositorio y realizar todas las modificaciones o subir el código que creas necesario. La inyección de los flujos de <strong>Integración Continua (CI)</strong> y de las <strong>dependencias faltantes</strong> se realizará automáticamente recién cuando decidas <strong>usar esta plantilla al crear una asignación</strong>, asegurando que quede totalmente configurada para la plataforma antes de que la utilicen los alumnos.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3">
                <p className="text-xs sm:text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="pt-3 border-t border-line flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="rounded-xl px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-line/40 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isLoading ? "Creando en GitHub..." : "Crear plantilla"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
