import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks";
import { usuarioService } from "@/services";
import {
  validarNombreCompleto,
  NOMBRE_MAX_LENGTH,
  resolveApiError,
  notifyApiError,
} from "@/utils";

export const BIENVENIDA_STORAGE_KEY = "unqlassroom_bienvenida_dismissed";

export function BienvenidaModal() {
  const { user, isAuthenticated, actualizarUsuario } = useAuth();
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem(BIENVENIDA_STORAGE_KEY) === "true";
  });

  const shouldShow =
    isAuthenticated &&
    Boolean(user) &&
    (!user?.nombreCompleto || user.nombreCompleto.trim() === "") &&
    !dismissed;

  if (!shouldShow || !user) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(BIENVENIDA_STORAGE_KEY, "true");
    setDismissed(true);
    toast.info(
      "Podés ingresar tu nombre y apellido en cualquier momento desde Mis datos en la esquina superior derecha."
    );
  };

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
      sessionStorage.removeItem(BIENVENIDA_STORAGE_KEY);
      toast.success(`¡Bienvenido/a a UNQlassroom, ${nuevoNombre}!`);
    } catch (err: unknown) {
      const resolved = resolveApiError(err);
      const msg =
        resolved?.message ||
        "Ocurrió un error al registrar tu nombre y apellido.";
      setError(msg);
      if (resolved) {
        notifyApiError(resolved);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isExceeded = nombre.length > NOMBRE_MAX_LENGTH;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bienvenida-title"
      className="fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm p-4"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl border border-line bg-panel2 p-7 sm:p-8 shadow-2xl animate-rise flex flex-col gap-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-line">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-emerald-500">
              Primer inicio de sesión
            </p>
            <h2
              id="bienvenida-title"
              className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground"
            >
              ¡Te damos la bienvenida a UNQlassroom!
            </h2>
          </div>
        </div>

        {/* Explicación amigable del requerimiento */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          Para que los docentes y tus compañeros puedan identificarte fácilmente
          en los cursos y asignaciones sin confundirte por tu usuario de GitHub (
          <span className="font-semibold text-foreground">@{user.username}</span>
          ), por favor ingresá tu nombre y apellido.
        </p>

        {/* Input y contador */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="bienvenida-nombre-input"
              className="text-xs uppercase tracking-wider font-semibold text-muted-foreground"
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
            id="bienvenida-nombre-input"
            data-testid="bienvenida-nombre-input"
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
            className={`w-full rounded-xl border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/50 transition-colors focus:outline-none ${
              error || isExceeded
                ? "border-destructive focus:border-destructive"
                : "border-line focus:border-primary"
            }`}
          />

          <p className="text-xs text-muted-foreground">
            Permite letras, tildes, espacios intermedios, apóstrofes y guiones.
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

        {/* Botones de acción */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2 border-t border-line">
          <button
            type="button"
            onClick={handleDismiss}
            disabled={isLoading}
            className="w-full sm:w-auto rounded-xl border border-line bg-panel px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-line/40 transition-colors cursor-pointer disabled:opacity-50 text-center"
          >
            Hacerlo más tarde
          </button>
          <button
            type="submit"
            disabled={isLoading || isExceeded}
            className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <span>Guardar y comenzar</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
