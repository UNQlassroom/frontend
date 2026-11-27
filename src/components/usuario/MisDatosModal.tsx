import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth, useDatosPersonalesForm } from "@/hooks";
import { usuarioService } from "@/services";
import { DatosPersonalesInputs } from "./DatosPersonalesInputs";
import {
  validarDatosUsuario,
  formatearNombreCompleto,
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
  if (!open) return null;

  return <MisDatosModalContent onClose={onClose} onSuccess={onSuccess} />;
}

function MisDatosModalContent({
  onClose,
  onSuccess,
}: Omit<MisDatosModalProps, "open">) {
  const { user, actualizarUsuario } = useAuth();
  const {
    nombre,
    setNombre,
    apellido,
    setApellido,
    email,
    setEmail,
    dni,
    setDni,
  } = useDatosPersonalesForm(user);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  const trimmedNombre = nombre.trim();
  const trimmedApellido = apellido.trim();
  const trimmedEmail = email.trim();
  const trimmedDni = dni.trim();

  const previewLength =
    trimmedApellido && trimmedNombre
      ? formatearNombreCompleto(trimmedNombre, trimmedApellido).length
      : 0;
  const isExceeded = previewLength > NOMBRE_MAX_LENGTH;

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validacion = validarDatosUsuario(nombre, apellido, email, dni);
    if (!validacion.valido) {
      setError(validacion.error);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await usuarioService.actualizarDatos({
        nombre: trimmedNombre,
        apellido: trimmedApellido,
        email: trimmedEmail,
        dni: trimmedDni,
      });

      const nuevoNombreCompleto =
        response.data.nombreCompleto ??
        formatearNombreCompleto(trimmedNombre, trimmedApellido);

      actualizarUsuario({
        nombreCompleto: nuevoNombreCompleto,
      });

      toast.success("Datos actualizados correctamente");
      onSuccess?.(nuevoNombreCompleto);
      onClose();
    } catch (err: unknown) {
      const resolved = resolveApiError(err);
      const msg =
        resolved?.message || "Ocurrió un error al actualizar tus datos.";
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mis-datos-title"
      className="fixed inset-0 z-50 grid place-items-center bg-background/60 backdrop-blur-[2px] p-4"
      onClick={handleClose}
    >
      <form
        noValidate
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
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              El usuario de GitHub está vinculado a tu autenticación y no puede modificarse.
            </p>
          </div>

          {/* Formulario de datos personales compartido */}
          <DatosPersonalesInputs
            idPrefix="misdatos"
            nombre={nombre}
            setNombre={setNombre}
            apellido={apellido}
            setApellido={setApellido}
            email={email}
            setEmail={setEmail}
            dni={dni}
            setDni={setDni}
            disabled={isLoading}
            onFieldChange={() => {
              if (error) setError(null);
            }}
          />

          {/* Error general del formulario */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 animate-rise"
            >
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}
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
            disabled={
              isLoading ||
              isExceeded ||
              !trimmedNombre ||
              !trimmedApellido ||
              !trimmedEmail ||
              !trimmedDni
            }
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
