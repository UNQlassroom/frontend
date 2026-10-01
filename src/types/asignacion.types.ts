import type { RepositorioDTO } from "./curso.types";

export type TipoAsignacion = "INDIVIDUAL" | "GRUPAL";

export interface CrearGrupoRequestDTO {
  nombre: string;
  integrantesUsernames: string[];
}

export interface CrearAsignacionRequestDTO {
  titulo: string;
  descripcion?: string;
  tipo: TipoAsignacion;
  templateRepoName: string;
  grupos?: CrearGrupoRequestDTO[];
  fechaLimite?: string | null;
}

export interface GrupoAsignacionResponseDTO {
  id: number;
  nombre: string | null;
  integrantes: string[];
  repositorio?: RepositorioDTO | null;
  entregada: boolean;
  fechaEntregada?: string | null;
  releaseUrl?: string | null;
  calificacion?: number | null;
  observaciones?: string | null;
  fechaCalificacion?: string | null;
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

export interface CalificarAsignacionRequestDTO {
  grupoId?: number;
  alumnoUsername?: string;
  calificacion: number;
  observaciones?: string | null;
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

// Estados y DTOs para Issues y Correcciones
export type EstadoIssue = "PENDIENTE" | "ACTUALIZADO" | "RESUELTO";

export interface IssueResponseDTO {
  numero: number;
  titulo: string;
  htmlUrl: string;
  autor: string;
  estado: EstadoIssue | string;
  tieneCommitsPosteriores: boolean;
  cantComentarios: number;
  fechaCreacion: string;
  fechaActualizacion: string;
  fechaCierre?: string | null;
}

export interface CorreccionGrupoResponseDTO {
  grupoId: number;
  nombre: string | null;
  integrantes: string[];
  repoNombre: string;
  repoHtmlUrl: string;
  issues: IssueResponseDTO[];
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
  observaciones?: string | null;
  fechaCalificacion?: string | null;
  grupoId?: number;
  grupoNombre?: string | null;
  integrantes?: string[];
  repoNombre?: string | null;
  repoUrl?: string | null;
  releaseUrl?: string | null;
  issueFeedbackUrl?: string | null;
  estadoCI?: "success" | "failure" | "pending" | "sin_ci" | string | null;
  ultimoCommit?: string | null;
  fechaUltimoCommit?: string | null;
  fechaUltimaEntrega?: string | null;
  entregada?: boolean;
  fechaEntregada?: string | null;
  fechaEntregadaFormatted?: string;
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
