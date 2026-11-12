export function compararUsuarios<
  T extends { username: string; nombreCompleto?: string | null }
>(a: T, b: T): number {
  const nombreA = a.nombreCompleto?.trim() || a.username;
  const nombreB = b.nombreCompleto?.trim() || b.username;
  return nombreA.localeCompare(nombreB, "es", { sensitivity: "base" });
}

export interface IntegranteInfo {
  username?: string;
  nombreCompleto?: string | null;
}

export interface GrupoComparable<TIntegrante = unknown> {
  nombre?: string | null;
  grupoNombre?: string | null;
  esGrupal?: boolean;
  integrantes?: TIntegrante[];
}

export function compararGrupos<
  TIntegrante,
  T extends GrupoComparable<TIntegrante>
>(
  a: T,
  b: T,
  esGrupalExplicit?: boolean,
  nombreResolver?: (item: TIntegrante) => IntegranteInfo
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

    if (typeof primer === "object" && primer !== null && "username" in primer) {
      const info = primer as IntegranteInfo;
      return info.nombreCompleto?.trim() || info.username || getNombreGrupo(g);
    }

    return String(primer || "").trim() || getNombreGrupo(g);
  };

  return getLabelAlumno(a).localeCompare(getLabelAlumno(b), "es", { sensitivity: "base" });
}
