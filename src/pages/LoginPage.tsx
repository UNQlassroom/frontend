import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks";
import unqlassroomLogo from "@/assets/unqlassroom_logo.svg";
import githubLogo from "@/assets/github_favicon.svg";

export const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;

  const pendienteOrg = sessionStorage.getItem("oauth_pendiente_org") === "true";
  const invitacionUrl = sessionStorage.getItem("oauth_invitacion_url");

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  const iniciarLoginGitHub = (esDocente: boolean) => {
    sessionStorage.setItem("oauth_es_docente", JSON.stringify(esDocente));
    sessionStorage.removeItem("oauth_pendiente_org");
    sessionStorage.removeItem("oauth_invitacion_url");

    const redirectUri = `${window.location.origin}/oauth/callback`;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=read:user,user:email`;

    window.location.href = githubAuthUrl;
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-line bg-panel p-8 shadow-xl text-center">
        <div className="flex justify-center mb-4">
          <img
            src={unqlassroomLogo}
            alt="UNQlassroom"
            className="w-16 h-16 object-contain"
          />
        </div>
        <h1 className="font-suez text-2xl tracking-tight mb-2">
          Bienvenido a UNQlassroom
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Inicia sesión o regístrate utilizando tu cuenta de GitHub seleccionando tu rol.
        </p>

        {pendienteOrg && (
          <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-left space-y-2">
            <h3 className="text-sm font-semibold text-amber-500">
              Invitación a la organización pendiente
            </h3>
            <p className="text-xs text-muted-foreground">
              Debes unirte a la organización para ingresar. Acepta la invitación en GitHub y luego pulsa el botón correspondiente a tu rol para finalizar tu ingreso.
            </p>
            {invitacionUrl && (
              <div className="pt-1">
                <a
                  href={invitacionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-600 dark:text-amber-400 font-medium text-xs transition-colors"
                >
                  <span>Abrir invitación en GitHub</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => iniciarLoginGitHub(true)}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors border border-neutral-700 cursor-pointer shadow-sm"
          >
            <img src={githubLogo} alt="" className="w-5 h-5 invert" />
            <span>Ingresar como Docente</span>
          </button>

          <button
            type="button"
            onClick={() => iniciarLoginGitHub(false)}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors cursor-pointer shadow-sm"
          >
            <img src={githubLogo} alt="" className="w-5 h-5 invert" />
            <span>Ingresar como Alumno</span>
          </button>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Al iniciar sesión, autorizas a UNQlassroom a acceder a tu perfil público de GitHub para gestionar tus cursos.
        </p>
      </div>
    </div>
  );
};
