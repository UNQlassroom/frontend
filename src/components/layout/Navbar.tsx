import { Link } from "react-router-dom";
import { useAuth } from "@/hooks";
import unqlassroomLogo from "@/assets/unqlassroom_circled_logo.svg";
import { UserMenu } from "./UserMenu";
import { BienvenidaModal } from "@/components/usuario";

export const Navbar = () => {
  const { user, isAuthenticated } = useAuth();

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
          {/* Submenú desplegable de usuario */}
          <UserMenu />
        </div>
      )}

      {/* Modal de bienvenida al iniciar sesión por primera vez */}
      <BienvenidaModal />
    </header>
  );
};
