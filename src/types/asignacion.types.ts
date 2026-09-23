export interface AsignacionDTO {
  id: string | number;
  titulo: string;
  descripcion: string;
  fechaEntrega?: string;
  repoPlantilla?: string;
  estado?: "activa" | "borrador" | "cerrada";
  entregasCount?: number;
  totalAlumnos?: number;
}

export interface CrearAsignacionFormData {
  titulo: string;
  descripcion: string;
  fechaEntrega: string;
  repoPlantilla: string;
}

export interface MetricaRepoItem {
  id: string;
  alumnoUsername: string;
  repoNombre: string;
  repoUrl: string;
  estadoCI: "success" | "failure" | "pending" | "sin_ci";
  ultimoCommit: string;
  commitHash?: string;
  fechaUltimoCommit: string;
  branch?: string;
}

export interface MetricasResumen {
  totalRepos: number;
  passing: number;
  failing: number;
  pending: number;
  sinCi: number;
  porcentajePassing: number;
}

export type EstadoEntrega = "pendiente" | "entregado" | "corregido";

export interface AsignacionAlumnoDTO {
  id: string | number;
  titulo: string;
  descripcion: string;
  fechaEntrega?: string;
  fechaLimiteFormatted?: string;
  estadoEntrega: EstadoEntrega;
  calificacion?: number | null;
  notaMaxima?: number;
  feedbackDocente?: string | null;
  repoNombre?: string | null;
  repoUrl?: string | null;
  issuesUrl?: string | null;
  issueFeedbackUrl?: string | null;
  estadoCI?: "success" | "failure" | "pending" | "sin_ci";
  fechaUltimaEntrega?: string | null;
}
