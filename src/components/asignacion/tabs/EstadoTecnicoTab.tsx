import type {
  AsignacionAlumnoDTO,
  DiagnosticoCIResponseDTO,
  MetricasCIResponseDTO,
  ReporteLinterResponseDTO,
} from "@/types";
import { CiTab } from "./CiTab";
import { CoberturaTab } from "./CoberturaTab";
import { BuenasPracticasTab } from "./BuenasPracticasTab";

export type SubSeccionTecnica = "ci" | "cobertura" | "git";

interface EstadoTecnicoTabProps {
  subSeccionActiva: SubSeccionTecnica;
  asignacion: AsignacionAlumnoDTO;
  diagnosticoCI: DiagnosticoCIResponseDTO | null;
  metricasCI: MetricasCIResponseDTO | null;
  reporteLinter: ReporteLinterResponseDTO | null;
  isLoadingTecnico?: boolean;
}

export function EstadoTecnicoTab({
  subSeccionActiva,
  asignacion,
  diagnosticoCI,
  metricasCI,
  reporteLinter,
  isLoadingTecnico = false,
}: EstadoTecnicoTabProps) {
  return (
    <div className="animate-rise">
      {subSeccionActiva === "ci" && (
        <CiTab
          asignacion={asignacion}
          diagnosticoCI={diagnosticoCI}
          isLoading={isLoadingTecnico}
        />
      )}
      {subSeccionActiva === "cobertura" && (
        <CoberturaTab
          asignacion={asignacion}
          metricas={metricasCI}
          isLoading={isLoadingTecnico}
        />
      )}
      {subSeccionActiva === "git" && (
        <BuenasPracticasTab
          asignacion={asignacion}
          reporteLinter={reporteLinter}
          isLoadingLinter={isLoadingTecnico}
        />
      )}
    </div>
  );
}
