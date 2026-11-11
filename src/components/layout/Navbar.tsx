import { Link } from "react-router-dom";
import { useAuth } from "@/hooks";
import unqlassroomLogo from "@/assets/unqlassroom_logo.svg";
import { UserMenu } from "./UserMenu";
import { BienvenidaModal } from "@/components/usuario";

export const Navbar = () => {
  const { user, isAuthenticated, isDocente } = useAuth();

  return (
    <header className="border-b border-line bg-panel px-6 py-3.5 flex items-center justify-between">
      {/* Brand / Logo */}
      <Link
        to={isAuthenticated ? "/home" : "/login"}
        className="flex items-center gap-3 hover:opacity-90 transition-opacity"
      >
        <img
          src={unqlassroomLogo}
          alt="UNQlassroom Logo"
          className="w-9 h-9 sm:w-10 sm:h-10 object-contain"
        />
        <span className="font-suez text-2xl sm:text-[1.65rem] tracking-tight">
          UNQlassroom
        </span>
      </Link>

      {/* Controles de Usuario Autenticado */}
      {isAuthenticated && user && (
        <div className="flex items-center gap-3">
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

          {/* Submenú desplegable de usuario (incluye la opción para modificar nombre) */}
          <UserMenu />
        </div>
      )}

      {/* Modal de bienvenida al iniciar sesión por primera vez */}
      <BienvenidaModal />
    </header>
  );
};
