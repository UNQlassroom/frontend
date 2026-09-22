import { useAuth } from "@/hooks";
import unqlassroomLogo from "@/assets/unqlassroom_logo.svg";

export const Navbar = () => {
  const { user, isAuthenticated, isProfesor, logout } = useAuth();

  return (
    <header className="border-b border-line bg-panel px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img
          src={unqlassroomLogo}
          alt="UNQlassroom Logo"
          className="w-7 h-7 object-contain"
        />
        <span className="font-suez text-lg tracking-tight">UNQlassroom</span>
      </div>

      {/* Controles de Usuario Autenticado */}
      {isAuthenticated && user && (
        <div className="flex items-center gap-4">
          {/* Badge del rol real */}
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border ${
              isProfesor
                ? "bg-neutral-800 text-neutral-200 border-neutral-700"
                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            }`}
          >
            {isProfesor ? "Docente" : "Alumno"}
          </span>

          {/* Información del usuario de GitHub */}
          <span className="text-sm font-medium text-foreground hidden sm:inline">
            @{user.username}
          </span>

          {/* Botón para cerrar sesión */}
          <button
            type="button"
            onClick={logout}
            className="text-xs font-medium text-muted-foreground hover:text-rose-500 border border-line hover:border-rose-500/30 rounded-md px-2.5 py-1 transition-colors cursor-pointer"
            title="Cerrar sesión"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </header>
  );
};
