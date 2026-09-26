import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks";
import { authService } from "@/services";

export const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Si GitHub retornó un error o no se envió el código, determinamos el error inicial directamente
  const errorInicial = error
    ? errorDescription || "Se canceló o denegó la autorización con GitHub."
    : !code
    ? "No se recibió ningún código de autorización de GitHub."
    : null;

  const [errorMsg, setErrorMsg] = useState<string | null>(errorInicial);
  const [redirigiendoAOrg, setRedirigiendoAOrg] = useState(false);
  const procesadoRef = useRef(false);

  useEffect(() => {
    // Si ya hay un error en los parámetros o ya se procesó, no hacemos la petición
    if (errorInicial || !code) return;
    if (procesadoRef.current) return;
    procesadoRef.current = true;

    // Leemos el rol seleccionado previamente antes de la redirección
    const storedEsDocente = sessionStorage.getItem("oauth_es_docente");
    const esDocente = storedEsDocente ? JSON.parse(storedEsDocente) : false;

    // Enviamos el código al backend para autenticar y obtener el token JWT
    authService
      .loginConGitHub({ code, esDocente })
      .then((response) => {
        if (response.data.requiereUnirseAOrg && response.data.redirectUrl) {
          setRedirigiendoAOrg(true);
          sessionStorage.setItem("oauth_pendiente_org", "true");
          window.location.replace(response.data.redirectUrl);
          return;
        }

        const { token, user } = response.data;
        if (token && user) {
          login(token, user);
          sessionStorage.removeItem("oauth_es_docente");
          sessionStorage.removeItem("oauth_pendiente_org");
          navigate("/home", { replace: true });
        }
      })
      .catch((err) => {
        console.error("Error al autenticar con GitHub:", err);
        const mensaje =
          err?.response?.data?.message ||
          err?.message ||
          "Ocurrió un error al comunicarse con el servidor. Intenta nuevamente.";
        setErrorMsg(mensaje);
      });
  }, [code, errorInicial, login, navigate]);

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-line bg-panel p-8 shadow-xl text-center">
        {redirigiendoAOrg ? (
          <div className="space-y-4">
            <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="font-semibold text-lg text-foreground">
              Redirigiendo a GitHub...
            </h2>
            <p className="text-sm text-muted-foreground">
              Debes unirte a la organización para ingresar a UNQlassroom. Redirigiendo a la invitación...
            </p>
          </div>
        ) : errorMsg ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto text-xl font-bold">
              ✕
            </div>
            <h2 className="font-semibold text-lg text-foreground">
              Error de autenticación
            </h2>
            <p className="text-sm text-muted-foreground bg-rose-500/5 p-3 rounded-lg border border-rose-500/20 text-left">
              {errorMsg}
            </p>
            <Link
              to="/login"
              replace
              className="inline-block w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors cursor-pointer text-sm"
            >
              Volver a la pantalla de inicio
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="font-semibold text-lg text-foreground">
              Autenticando con GitHub...
            </h2>
            <p className="text-sm text-muted-foreground">
              Estamos verificando tus credenciales y preparando tu sesión.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
