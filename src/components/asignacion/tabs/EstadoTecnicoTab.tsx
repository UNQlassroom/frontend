import { CiTab } from "./CiTab";
import { CoberturaTab } from "./CoberturaTab";
import { BuenasPracticasTab } from "./BuenasPracticasTab";

export type SubSeccionTecnica = "ci" | "cobertura" | "git";

interface EstadoTecnicoTabProps {
  subSeccionActiva: SubSeccionTecnica;
}

export function EstadoTecnicoTab({
  subSeccionActiva,
}: EstadoTecnicoTabProps) {
  return (
    <div className="animate-rise">
      {subSeccionActiva === "ci" && <CiTab />}
      {subSeccionActiva === "cobertura" && <CoberturaTab />}
      {subSeccionActiva === "git" && <BuenasPracticasTab />}
    </div>
  );
}
