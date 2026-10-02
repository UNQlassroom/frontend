export type EstadoCI = "success" | "failure" | "pending" | "sin_ci";

export interface EstadoCIInfo {
  label: string;
  badgeClass: string;
  dotClass: string;
  type: EstadoCI;
}
