import { useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {Archive, BookOpen, ChevronDown, Circle, LogOut, Moon, Sun, User} from "lucide-react";
import { useAuth, useTheme } from "@/hooks";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui";
import { MisDatosModal } from "@/components/usuario";

export const UserMenu = () => {
  const { user, isDocente, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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

  const displayName = user.nombreCompleto?.trim() || `@${user.username}`;
  const hasName = Boolean(user.nombreCompleto?.trim());

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
              {displayName}
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
              {displayName}
            </p>
            {hasName && (
              <p className="text-xs text-muted-foreground truncate">
                @{user.username}
              </p>
            )}
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
                <span>Mis cursos</span>
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
                <span>Cursos archivados</span>
              </button>
            </div>
          )}

          {/* Opción Alternar modo (Claro / Oscuro) */}
          <div className="py-1.5 border-b border-line/70 space-y-0.5">
            <button
              type="button"
              onClick={toggleTheme}
              role="switch"
              aria-checked={theme === "dark"}
              aria-label="Alternar modo"
              className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-foreground hover:bg-line/40 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {theme === "dark" ? (
                  <Moon className="w-4 h-4 text-sky-400 shrink-0 transition-transform duration-200" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500 shrink-0 transition-transform duration-200" />
                )}
                <span className="truncate">Alternar modo</span>
              </div>
              <div
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
                  theme === "dark" ? "bg-indigo-600" : "bg-neutral-300 dark:bg-neutral-700"
                }`}
              >
                <span
                  className={`inline-flex h-3.5 w-3.5 items-center justify-center transform rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out ${
                    theme === "dark" ? "translate-x-4.5" : "translate-x-1"
                  }`}
                >
                  {theme === "dark" ? (
                    <Circle className="w-2.5 h-2.5 text-indigo-600" />
                  ) : (
                    <Circle className="w-2.5 h-2.5 text-amber-500" />
                  )}
                </span>
              </div>
            </button>
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
