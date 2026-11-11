import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks";
import { usuarioService } from "@/services";
import {
  validarNombreCompleto,
  NOMBRE_MAX_LENGTH,
  resolveApiError,
  notifyApiError,
} from "@/utils";

export interface MisDatosModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (nuevoNombre: string) => void;
}

export function MisDatosModal({
  open,
  onClose,
  onSuccess,
}: MisDatosModalProps) {
  const { user, isDocente, actualizarUsuario } = useAuth();
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setNombre(user?.nombreCompleto || "");
      setError(null);
      setIsLoading(false);
    }
  }, [open, user?.nombreCompleto]);

  if (!open || !user) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validacion = validarNombreCompleto(nombre);
    if (!validacion.valido) {
      setError(validacion.error);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const trimmedNombre = nombre.trim();
      const response = await usuarioService.actualizarNombre({
        nombreCompleto: trimmedNombre,
      });

      const nuevoNombre = response.data.nombreCompleto ?? trimmedNombre;
      actualizarUsuario({ nombreCompleto: nuevoNombre });
      toast.success("Nombre y apellido actualizado correctamente");
      onSuccess?.(nuevoNombre);
      onClose();
    } catch (err: unknown) {
      const resolved = resolveApiError(err);
      const msg =
        resolved?.message ||
        "Ocurrió un error al actualizar el nombre y apellido.";
      setError(msg);
      if (resolved) {
        notifyApiError(resolved);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setError(null);
    onClose();
  };

  const isExceeded = nombre.length > NOMBRE_MAX_LENGTH;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mis-datos-title"
      className="fixed inset-0 z-50 grid place-items-center bg-background/60 backdrop-blur-[2px] p-4"
      onClick={handleClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-line bg-panel2 p-6 sm:p-7 shadow-xl animate-rise flex flex-col gap-5"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-line">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] font-semibold text-muted-foreground">
              Configuración de cuenta
            </p>
            <h2
              id="mis-datos-title"
              className="mt-0.5 font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground"
            >
              Mis datos
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

        {/* Campos del perfil */}
        <div className="space-y-4">
          {/* Usuario de GitHub */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              Usuario de GitHub
            </label>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-panel/70 px-4 py-2.5 text-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={`https://github.com/${user.username}.png?size=64`}
                  alt={user.username}
                  className="w-6 h-6 rounded-full border border-line bg-line/30 object-cover shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <span className="font-semibold text-foreground truncate">
                  @{user.username}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                    isDocente
                      ? "bg-neutral-800 text-neutral-200 border-neutral-700"
                      : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  }`}
                >
                  {isDocente ? "Docente" : "Alumno"}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              El usuario de GitHub está vinculado a tu autenticación y no puede modificarse.
            </p>
          </div>

          {/* Nombre y apellido (Editable) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="nombre-completo-input"
                className="text-xs uppercase tracking-wider font-semibold text-foreground"
              >
                Nombre y apellido
              </label>
              <span
                className={`text-xs tabular-nums font-medium ${
                  isExceeded ? "text-rose-500 font-bold" : "text-muted-foreground"
                }`}
              >
                {nombre.length} / {NOMBRE_MAX_LENGTH}
              </span>
            </div>

            <input
              id="nombre-completo-input"
              type="text"
              disabled={isLoading}
              autoFocus
              maxLength={NOMBRE_MAX_LENGTH + 10}
              placeholder="Ej: Juan Carlos Pérez"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                if (error) setError(null);
              }}
              className={`w-full rounded-xl border bg-background px-4 py-2.5 text-base text-foreground placeholder:text-muted-foreground/50 transition-colors focus:outline-none ${
                error || isExceeded
                  ? "border-destructive focus:border-destructive"
                  : "border-line focus:border-primary"
              }`}
            />

            <p className="text-xs text-muted-foreground">
              Este es el nombre visible para docentes y compañeros en cursos y asignaciones.
              Máximo {NOMBRE_MAX_LENGTH} caracteres.
            </p>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 animate-rise"
              >
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-line">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-xl border border-line bg-panel px-4 py-2 text-sm font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading || isExceeded}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <span>Guardar cambios</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
