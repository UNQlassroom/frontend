import { Link } from "react-router-dom";
import { useAuth } from "@/hooks";
import unqlassroomLogo from "@/assets/unqlassroom_logo.svg";
import { UserMenu } from "./UserMenu";

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
          className="w-8 h-8 object-contain"
        />
        <span className="font-suez text-xl tracking-tight">UNQlassroom</span>
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

          {/* Submenú desplegable de usuario */}
          <UserMenu />
        </div>
      )}
    </header>
  );
};
