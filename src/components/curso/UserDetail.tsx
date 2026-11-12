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

export function compararUsuarios<
  T extends { username: string; nombreCompleto?: string | null }
>(a: T, b: T): number {
  const nombreA = a.nombreCompleto?.trim() || a.username;
  const nombreB = b.nombreCompleto?.trim() || b.username;
  return nombreA.localeCompare(nombreB, "es", { sensitivity: "base" });
}

export interface GrupoComparable {
  nombre?: string | null;
  grupoNombre?: string | null;
  esGrupal?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  integrantes?: any[];
}

export function compararGrupos<T extends GrupoComparable>(
  a: T,
  b: T,
  esGrupalExplicit?: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nombreResolver?: (item: any) => {
    username?: string;
    nombreCompleto?: string | null;
  }
): number {
  const esGrupal =
    esGrupalExplicit ??
    a.esGrupal ??
    b.esGrupal ??
    Boolean(
      (a.nombre && (a.integrantes?.length ?? 0) > 1) ||
      (b.nombre && (b.integrantes?.length ?? 0) > 1)
    );

  const getNombreGrupo = (g: T) => (g.grupoNombre || g.nombre || "").trim();

  if (esGrupal && (getNombreGrupo(a) || getNombreGrupo(b))) {
    return getNombreGrupo(a).localeCompare(getNombreGrupo(b), "es", { sensitivity: "base" });
  }

  const getLabelAlumno = (g: T) => {
    const primer = g.integrantes?.[0];
    if (!primer) return getNombreGrupo(g);

    if (nombreResolver) {
      const res = nombreResolver(primer);
      return res.nombreCompleto?.trim() || res.username || getNombreGrupo(g);
    }

    if (typeof primer === "object" && primer !== null) {
      return primer.nombreCompleto?.trim() || primer.username || getNombreGrupo(g);
    }

    return String(primer || "").trim() || getNombreGrupo(g);
  };

  return getLabelAlumno(a).localeCompare(getLabelAlumno(b), "es", { sensitivity: "base" });
}
