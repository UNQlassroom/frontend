import type { HTMLAttributes } from "react";

export interface UserDetailProps extends HTMLAttributes<HTMLDivElement> {
  username: string;
  nombreCompleto?: string | null;
  layout?: "stacked" | "inline";
  nameClassName?: string;
  usernameClassName?: string;
}

export function UserDetail({
  username,
  nombreCompleto,
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

  if (actualNombreCompleto) {
    if (layout === "inline") {
      return (
        <div
          className={`inline-flex items-center gap-1.5 text-xs ${className}`}
          {...props}
        >
          <span className={`font-semibold text-foreground ${nameClassName}`}>
            {actualNombreCompleto}
          </span>
          <a
            href={`https://github.com/${actualUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-muted-foreground hover:text-foreground transition-colors ${usernameClassName}`}
            title={`Ver perfil de GitHub de @${actualUsername}`}
          >
            @{actualUsername}
          </a>
        </div>
      );
    }

    return (
      <div
        className={`flex flex-col justify-center min-w-0 ${className}`}
        {...props}
      >
        <span
          className={`font-semibold text-foreground truncate ${
            nameClassName || "text-sm"
          }`}
        >
          {actualNombreCompleto}
        </span>
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
    <div className={`min-w-0 ${className}`} {...props}>
      <a
        href={`https://github.com/${actualUsername}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`font-semibold text-foreground hover:text-muted-foreground transition-colors truncate block ${
          layout === "stacked" ? "text-sm" : "text-xs"
        } ${usernameClassName}`}
        title={`Ver perfil de GitHub de @${actualUsername}`}
      >
        @{actualUsername}
      </a>
    </div>
  );
}
