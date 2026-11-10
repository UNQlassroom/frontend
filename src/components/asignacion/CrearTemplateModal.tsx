import { useState, type SubmitEvent } from "react";
import { toast } from "react-toastify";
import { crearTemplate } from "@/services";
import type { TemplateRepoResponseDTO } from "@/types";
import { parsearRepoPersonal, resolveApiError } from "@/utils";

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
  const [repoAImportar, setRepoAImportar] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleClose = () => {
    setRepoAImportar("");
    setName("");
    setDescription("");
    setError(null);
    setIsLoading(false);
    onClose();
  };

  const handleRepoChange = (val: string) => {
    setRepoAImportar(val);
    setError(null);

    const parsed = parsearRepoPersonal(val);
    if (parsed) {
      setName(parsed.nombreSugerido);
    }
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const nameClean = name.trim();
    if (!nameClean) {
      setError("Por favor, ingresá un nombre válido para el template.");
      return;
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(nameClean)) {
      setError(
        "El nombre del repositorio solo puede contener letras, números, puntos, guiones y guiones bajos (sin espacios)."
      );
      return;
    }

    let repoUrl: string | undefined = undefined;
    const repoClean = repoAImportar.trim();
    if (repoClean) {
      const parsed = parsearRepoPersonal(repoClean);
      if (!parsed) {
        setError(
          "Ingresá una URL válida de un repositorio de GitHub (ej: https://github.com/usuario/mi-repo)."
        );
        return;
      }
      repoUrl = parsed.urlNormalizada;
    }

    setIsLoading(true);
    try {
      const response = await crearTemplate({
        name: nameClean,
        description: description.trim() || undefined,
        repoAImportar: repoUrl,
      });

      if (repoUrl) {
        toast.info(
          "El repositorio plantilla se está importando en GitHub en segundo plano. Aparecerá en la lista en unos momentos."
        );
      } else {
        toast.success("Repositorio plantilla creado correctamente.");
      }

      onSuccess(response.data);
      handleClose();
    } catch (err: unknown) {
      const resolved = resolveApiError(err);
      if (resolved?.status === 400) {
        setError(
          resolved.message ||
            "Campo de nombre en blanco o formato de repositorio a importar inválido."
        );
      } else if (resolved?.status === 403) {
        setError("Acceso exclusivo para docentes.");
      } else if (resolved?.status === 500 || resolved?.errorCode?.includes("GITHUB")) {
        setError(
          resolved.message ||
            "El repositorio origen es privado, no existe o falló la replicación. Solo se permite importar repositorios públicos."
        );
      } else {
        setError(
          resolved?.message ||
            "Ocurrió un error inesperado al procesar el repositorio plantilla. Intentá nuevamente."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 grid place-items-center bg-background/80 p-4">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-line bg-panel2 p-6 sm:p-7 shadow-2xl flex flex-col space-y-5 animate-rise">
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-line">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">
              GitHub Template
            </p>
            <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Crear repositorio plantilla
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-lg p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-line/40 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo opcional para clonar repo */}
          <div>
            <label
              htmlFor="template-repo-importar"
              className="mb-1.5 block text-xs uppercase tracking-wider font-semibold text-muted-foreground"
            >
              URL del repositorio público a clonar (opcional)
            </label>
            <input
              id="template-repo-importar"
              type="text"
              disabled={isLoading}
              placeholder="Ej: https://github.com/usuario/mi-repo"
              value={repoAImportar}
              onChange={(e) => handleRepoChange(e.target.value)}
              className="w-full rounded-xl border border-line bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Pegá la URL de un repositorio público para clonar su contenido, o dejalo vacío para crear uno en blanco.
            </p>
          </div>

          {/* Nombre del template en la organización */}
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

          {/* Descripción opcional */}
          <div>
            <label
              htmlFor="template-description"
              className="mb-1.5 block text-xs uppercase tracking-wider font-semibold text-muted-foreground"
            >
              Descripción (opcional)
            </label>
            <textarea
              id="template-description"
              rows={2}
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
                  Vas a poder inspeccionar el repositorio y realizar todas las modificaciones o subir el código que creas necesario. La inyección de los flujos de <strong>Integración Continua (CI)</strong> y de las <strong>dependencias faltantes</strong> se realizará automáticamente recién cuando decidas <strong>usar esta plantilla al crear una asignación</strong>, asegurando que quede totalmente configurada para la plataforma antes de que la utilicen los alumnos.
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
              className="rounded-xl px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-line/40 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              )}
              <span>
                {isLoading
                  ? "Procesando..."
                  : repoAImportar.trim()
                  ? "Clonar y crear plantilla"
                  : "Crear plantilla"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
