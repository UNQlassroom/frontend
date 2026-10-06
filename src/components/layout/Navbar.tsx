import { useAuth } from "@/hooks";
import unqlassroomLogo from "@/assets/unqlassroom_logo.svg";

export const Navbar = () => {
  const { user, isAuthenticated, isDocente, logout } = useAuth();

  return (
    <header className="border-b border-line bg-panel px-6 py-3.5 flex items-center justify-between">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <img
          src={unqlassroomLogo}
          alt="UNQlassroom Logo"
          className="w-8 h-8 object-contain"
        />
        <span className="font-suez text-xl tracking-tight">UNQlassroom</span>
      </div>

      {/* Controles de Usuario Autenticado */}
      {isAuthenticated && user && (
        <div className="flex items-center gap-4">
          {/* Badge del rol real */}
          <span
            className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold tracking-wide border ${
              isDocente
                ? "bg-neutral-800 text-neutral-200 border-neutral-700"
                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            }`}
          >
            {isDocente ? "Docente" : "Alumno"}
          </span>

          {/* Información del usuario de GitHub */}
          <span className="text-base font-semibold text-foreground hidden sm:inline">
            @{user.username}
          </span>

          {/* Botón para cerrar sesión */}
          <button
            type="button"
            onClick={logout}
            className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-rose-500 border border-line hover:border-rose-500/30 rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
            title="Cerrar sesión"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </header>
  );
};
