import { useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Archive, BookOpen, ChevronDown, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui";
import { MisDatosModal } from "@/components/usuario";

export const UserMenu = () => {
  const { user, isDocente, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMisDatosOpen, setIsMisDatosOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  if (!user) return null;

  const handleNavigate = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  const isHomePath = location.pathname === "/home";
  const isCursosArchivadosView =
    isHomePath && searchParams.get("archivados") === "true";
  const isMisCursosView = isHomePath && !isCursosArchivadosView;

  return (
    <>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Menú de usuario"
            aria-expanded={menuOpen}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel2 px-3.5 py-1.5 text-sm font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer"
          >
            <img
              src={`https://github.com/${user.username}.png?size=64`}
              alt={user.username}
              className="w-6 h-6 rounded-full border border-line bg-line/30 object-cover shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="truncate max-w-[140px] sm:max-w-[180px]">
              {user.nombreCompleto?.trim() || `@${user.username}`}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-64 p-2 rounded-2xl border border-line bg-panel shadow-xl"
        >
          {/* Encabezado de cuenta */}
          <div className="px-3 py-2.5 border-b border-line/70">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Cuenta conectada
            </p>
            <p className="mt-0.5 text-sm font-bold text-foreground truncate">
              {user.nombreCompleto?.trim() || `@${user.username}`}
            </p>
            {Boolean(user.nombreCompleto?.trim()) && (
              <p className="text-xs text-muted-foreground truncate">
                @{user.username}
              </p>
            )}
          </div>

          {/* Opción Mis datos */}
          <div className="py-1.5 border-b border-line/70 space-y-0.5">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setIsMisDatosOpen(true);
              }}
              className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-foreground hover:bg-line/40 transition-colors cursor-pointer text-left"
            >
              <User className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Mis datos</span>
            </button>
          </div>

          {/* Opciones de navegación y configuración para docentes */}
          {isDocente && (
            <div className="py-1.5 border-b border-line/70 space-y-0.5">
              <button
                type="button"
                onClick={() => handleNavigate("/home")}
                className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors cursor-pointer text-left ${
                  isMisCursosView
                    ? "bg-line/50 text-foreground font-semibold"
                    : "text-foreground hover:bg-line/40"
                }`}
              >
                <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>Mis Cursos</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavigate("/home?archivados=true")}
                className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors cursor-pointer text-left ${
                  isCursosArchivadosView
                    ? "bg-line/50 text-foreground font-semibold"
                    : "text-foreground hover:bg-line/40"
                }`}
              >
                <Archive className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>Cursos Archivados</span>
              </button>
            </div>
          )}

          {/* Acción de cierre de sesión */}
          <div className="pt-1.5">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <MisDatosModal
        open={isMisDatosOpen}
        onClose={() => setIsMisDatosOpen(false)}
      />
    </>
  );
};
