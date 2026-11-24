import type { HTMLAttributes } from "react";

export interface UserDetailProps extends HTMLAttributes<HTMLDivElement> {
  username: string;
  nombreCompleto?: string | null;
  activo?: boolean;
  esUsuarioActual?: boolean;
  layout?: "stacked" | "inline";
  nameClassName?: string;
  usernameClassName?: string;
}

export function UserDetail({
  username,
  nombreCompleto,
  activo = true,
  esUsuarioActual = false,
  layout = "stacked",
  className = "",
  nameClassName = "",
  usernameClassName = "",
  ...props
}: UserDetailProps) {
  const actualUsername =
    typeof username === "object" && username !== null
      ? (username as unknown as { username?: string }).username || ""
      : String(username || "");

  const actualNombreCompleto =
    nombreCompleto ||
    (typeof username === "object" && username !== null
      ? (username as unknown as { nombreCompleto?: string | null }).nombreCompleto
      : null);

  const esInactivo = !activo;

  const renderBadgeVos = () => {
    if (!esUsuarioActual) return null;
    return (
      <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary shrink-0">
        Vos
      </span>
    );
  };

  const renderBadgeBaja = () => {
    if (!esInactivo) return null;
    return (
      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-line/80 text-muted-foreground border border-line shrink-0">
        Dado de baja
      </span>
    );
  };

  if (actualNombreCompleto) {
    if (layout === "inline") {
      return (
        <div
          className={`inline-flex items-center gap-1.5 text-xs ${
            esInactivo ? "opacity-60 grayscale" : ""
          } ${className}`}
          {...props}
        >
          <span
            className={`font-semibold ${
              esInactivo ? "text-muted-foreground" : "text-foreground"
            } ${nameClassName}`}
          >
            {actualNombreCompleto}
          </span>
          {renderBadgeVos()}
          <a
            href={`https://github.com/${actualUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-muted-foreground hover:text-foreground transition-colors ${usernameClassName}`}
            title={`Ver perfil de GitHub de @${actualUsername}`}
          >
            @{actualUsername}
          </a>
          {renderBadgeBaja()}
        </div>
      );
    }

    return (
      <div
        className={`flex flex-col justify-center min-w-0 ${
          esInactivo ? "opacity-60 grayscale" : ""
        } ${className}`}
        {...props}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`font-semibold truncate ${
              esInactivo ? "text-muted-foreground" : "text-foreground"
            } ${nameClassName || "text-sm"}`}
          >
            {actualNombreCompleto}
          </span>
          {renderBadgeVos()}
          {renderBadgeBaja()}
        </div>
        <a
          href={`https://github.com/${actualUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-xs text-muted-foreground hover:text-foreground transition-colors truncate ${usernameClassName}`}
          title={`Ver perfil de GitHub de @${actualUsername}`}
        >
          @{actualUsername}
        </a>
      </div>
    );
  }

  return (
    <div
      className={`min-w-0 ${esInactivo ? "opacity-60 grayscale" : ""} ${className}`}
      {...props}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <a
          href={`https://github.com/${actualUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`font-semibold transition-colors truncate block ${
            esInactivo
              ? "text-muted-foreground hover:text-foreground"
              : "text-foreground hover:text-muted-foreground"
          } ${layout === "stacked" ? "text-sm" : "text-xs"} ${usernameClassName}`}
          title={`Ver perfil de GitHub de @${actualUsername}`}
        >
          @{actualUsername}
        </a>
        {renderBadgeVos()}
        {renderBadgeBaja()}
      </div>
    </div>
  );
}
