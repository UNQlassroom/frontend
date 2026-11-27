import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth, useDatosPersonalesForm } from "@/hooks";
import { usuarioService } from "@/services";
import unqlassroomLogo from "@/assets/unqlassroom_circled_logo.svg";
import { DatosPersonalesInputs } from "./DatosPersonalesInputs";
import {
  validarDatosUsuario,
  formatearNombreCompleto,
  NOMBRE_MAX_LENGTH,
  resolveApiError,
  notifyApiError,
} from "@/utils";

export function BienvenidaModal() {
  const { user, isAuthenticated, actualizarUsuario } = useAuth();
  const {
    nombre,
    setNombre,
    apellido,
    setApellido,
    email,
    setEmail,
    dni,
    setDni,
    perfil,
    setPerfil,
    cargando,
  } = useDatosPersonalesForm(user);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Se muestra si al usuario autenticado le falta nombreCompleto, email o DNI en el backend
  const shouldShow =
    isAuthenticated &&
    Boolean(user) &&
    !cargando &&
    (!perfil?.nombreCompleto?.trim() ||
      !perfil?.email?.trim() ||
      !perfil?.dni?.trim());

  if (!shouldShow || !user) return null;

  const trimmedNombre = nombre.trim();
  const trimmedApellido = apellido.trim();
  const trimmedEmail = email.trim();
  const trimmedDni = dni.trim();

  const previewLength =
    trimmedApellido && trimmedNombre
      ? formatearNombreCompleto(trimmedNombre, trimmedApellido).length
      : 0;
  const isExceeded = previewLength > NOMBRE_MAX_LENGTH;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

      setPerfil(response.data);
      toast.success(`¡Bienvenido/a a UNQlassroom, ${nuevoNombreCompleto}!`);
    } catch (err: unknown) {
      const resolved = resolveApiError(err);
      const msg =
        resolved?.message || "Ocurrió un error al registrar tus datos.";
      setError(msg);
      if (resolved) {
        notifyApiError(resolved);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bienvenida-title"
      className="fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm p-4"
    >
      <form
        noValidate
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl border border-line bg-panel2 p-7 sm:p-8 shadow-2xl animate-rise flex flex-col gap-6"
      >
        {/* Header con Logo y Colores de UNQlassroom */}
        <div className="flex flex-col items-center text-center pb-4 border-b border-line gap-3">
          <div className="flex justify-center">
            <img
              src={unqlassroomLogo}
              alt="UNQlassroom Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <div>
            <h2
              id="bienvenida-title"
              className="font-suez text-2xl sm:text-3xl tracking-tight text-foreground"
            >
              ¡Te damos la bienvenida a UNQlassroom!
            </h2>
          </div>
        </div>

        {/* Explicación amigable del requerimiento */}
        <p className="text-sm text-muted-foreground leading-relaxed text-center sm:text-left">
          Para que los docentes y tus compañeros puedan identificarte fácilmente
          en los cursos y asignaciones sin confundirte por tu usuario de GitHub (
          <span className="font-semibold text-emerald-500">@{user.username}</span>
          ), por favor completá tus datos personales.
        </p>

        {/* Formulario de datos personales compartido */}
        <DatosPersonalesInputs
          idPrefix="bienvenida"
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

        {/* Botón de acción */}
        <div className="flex items-center justify-end pt-2 border-t border-line">
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
            className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <span>Guardar</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
