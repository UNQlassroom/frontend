import type { RepositorioDTO } from "./curso.types";

export type TipoAsignacion = "INDIVIDUAL" | "GRUPAL";

export interface CrearGrupoRequestDTO {
  nombre: string;
  integrantesUsernames: string[];
}

export interface CrearAsignacionRequestDTO {
  titulo: string;
  descripcion?: string | null;
  tipo: TipoAsignacion;
  templateRepoName: string;
  fechaLimite?: string | null;
  grupos?: CrearGrupoRequestDTO[] | null;
}

export interface GrupoAsignacionResponseDTO {
  id: number;
  nombre: string | null;
  integrantes: string[];
  repositorio?: RepositorioDTO | null;
}

export interface AsignacionResponseDTO {
  id: number;
  cursoId: number;
  titulo: string;
  descripcion: string | null;
  tipo: TipoAsignacion;
  templateRepoName: string;
  fechaLimite: string | null;
  grupos: GrupoAsignacionResponseDTO[];
}

export interface TemplateRepoResponseDTO {
  name: string;
  fullName: string;
  htmlUrl: string;
  description: string | null;
}

export interface CrearTemplateRepoRequestDTO {
  name: string;
  description?: string;
}

// Interfaz para la vista de Alumno
export type EstadoEntrega = "pendiente" | "entregado" | "corregido";

export interface AsignacionAlumnoDTO {
  id: string | number;
  titulo: string;
  descripcion: string | null;
  tipo: TipoAsignacion;
  templateRepoName?: string;
  fechaLimite?: string | null;
  fechaLimiteFormatted?: string;
  estadoEntrega: EstadoEntrega;
  calificacion?: number | null;
  notaMaxima?: number;
  feedbackDocente?: string | null;
  grupoNombre?: string | null;
  integrantes?: string[];
  repoNombre?: string | null;
  repoUrl?: string | null;
  issuesUrl?: string | null;
  issueFeedbackUrl?: string | null;
  estadoCI?: "success" | "failure" | "pending" | "sin_ci" | string | null;
  ultimoCommit?: string | null;
  fechaUltimoCommit?: string | null;
  fechaUltimaEntrega?: string | null;
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
