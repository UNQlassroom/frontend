import type { AsignacionAlumnoDTO } from "@/types";
import { CiTab } from "./CiTab";
import { CoberturaTab } from "./CoberturaTab";
import { BuenasPracticasTab } from "./BuenasPracticasTab";

export type SubSeccionTecnica = "ci" | "cobertura" | "git";

interface EstadoTecnicoTabProps {
  asignacion?: AsignacionAlumnoDTO;
  subSeccionActiva: SubSeccionTecnica;
}

export function EstadoTecnicoTab({
  asignacion,
  subSeccionActiva,
}: EstadoTecnicoTabProps) {
  return (
    <div className="animate-rise">
      {subSeccionActiva === "ci" && <CiTab asignacion={asignacion} />}
      {subSeccionActiva === "cobertura" && <CoberturaTab asignacion={asignacion} />}
      {subSeccionActiva === "git" && <BuenasPracticasTab asignacion={asignacion} />}
    </div>
  );
}
