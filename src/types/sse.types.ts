export type SseEventType =
  | "ASIGNACION_ACTUALIZADA"
  | "PUSH_RECIBIDO"
  | "CI_ACTUALIZADO"
  | "METRICAS_CI_ACTUALIZADAS"
  | "LINTER_ACTUALIZADO"
  | "ENTREGA_REALIZADA"
  | "ISSUE_ACTUALIZADO"
  | "MIEMBRO_ACTIVADO"
  | "TEMPLATES_ACTUALIZADOS";

export interface SseEventDTO {
  type: SseEventType;
  cursoId: number | null;
  asignacionId: number | null;
  grupoId: number | null;
  repoNombre: string | null;
  timestamp: string;
}

export type SseEventListener = (event: SseEventDTO) => void;

