import type { RepositorioDTO } from "./curso.types";
import type { UsuarioResponseDTO } from "./auth.types";

export type TipoAsignacion = "INDIVIDUAL" | "GRUPAL";

export type EstadoAsignacion = "CREANDO" | "LISTA" | "ERROR";

export type SeccionDetalle = "general" | "tecnico" | "correcciones";

export interface CrearGrupoRequestDTO {
  nombre: string;
  integrantesUsernames: string[];
}

export interface ModificarAsignacionRequestDTO {
  descripcion?: string | null;
  fechaLimite?: string | null;
}

export interface CrearAsignacionRequestDTO {
  titulo: string;
  descripcion?: string;
  tipo: TipoAsignacion;
  templateRepoName: string;
  grupos?: CrearGrupoRequestDTO[];
  fechaLimite?: string | null;
}

export type TipoAdvertenciaGit = "COMMIT_NO_ATOMICO" | "MENSAJE_INADECUADO";

export interface AdvertenciaGitResponseDTO {
  id: number | null;
  commitSha: string;
  mensajeCommit: string;
  tipo: TipoAdvertenciaGit;
  mensajeExplicativo: string;
  archivosModificados: number;
  lineasModificadas: number;
  lineasAgregadas: number;
  lineasEliminadas: number;
  autorUsername: string | null;
  fechaCommit: string | null;
}

export interface DiagnosticoCIResponseDTO {
  repoNombre: string;
  estadoCI: string | null;
  etapaFallida: string | null;
  logError: string | null;
  runUrl: string | null;
  runId: number | null;
}

export interface MetricasCIResponseDTO {
  id: number | null;
  repoNombre: string;
  commitSha: string | null;
  coberturaLineas: number;
  lineasCubiertas: number;
  lineasPerdidas: number;
  umbralCobertura: number;
  cumpleUmbralCobertura: boolean;
  testsEjecutados: number;
  testsPasados: number;
  testsFallados: number;
  testsSalteados: number;
  autorUsername: string | null;
  runId: number | null;
  fechaActualizacion: string | null;
}

export type SeveridadLinter = "ERROR" | "WARNING";

export interface IncidenciaLinterResponseDTO {
  id: number | null;
  archivo: string;
  linea: number;
  columna: number | null;
  severidad: SeveridadLinter;
  regla: string;
  mensaje: string | null;
}

export interface ReporteLinterResponseDTO {
  id: number | null;
  repoNombre: string;
  commitSha: string | null;
  herramienta: string | null;
  totalIncidencias: number;
  cantidadErrores: number;
  cantidadAdvertencias: number;
  incidencias: IncidenciaLinterResponseDTO[];
  autorUsername: string | null;
  runId: number | null;
  fechaActualizacion: string | null;
}

export interface GrupoAsignacionResponseDTO {
  id: number;
  nombre: string | null;
  integrantes: UsuarioResponseDTO[];
  repositorio?: RepositorioDTO | null;
  entregada: boolean;
  fechaEntregada?: string | null;
  releaseUrl?: string | null;
  calificacion?: number | null;
  observaciones?: string | null;
  fechaCalificacion?: string | null;
  advertenciasGit?: AdvertenciaGitResponseDTO[];
}

export interface AsignacionResponseDTO {
  id: number;
  cursoId: number;
  titulo: string;
  descripcion: string | null;
  tipo: TipoAsignacion;
  templateRepoName: string;
  fechaLimite: string | null;
  estado: EstadoAsignacion;
  grupos: GrupoAsignacionResponseDTO[];
}

export interface CalificarAsignacionRequestDTO {
  grupoId: number;
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
  estado?: EstadoAsignacion;
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
  integrantesDetalle?: UsuarioResponseDTO[];
  repoNombre?: string | null;
  repoUrl?: string | null;
  releaseUrl?: string | null;
  issueFeedbackUrl?: string | null;
  estadoCI?: "success" | "failure" | "pending" | "sin_ci" | string | null;
  ciEtapaFallida?: string | null;
  ciLogError?: string | null;
  ciRunUrl?: string | null;
  advertenciasGit?: AdvertenciaGitResponseDTO[];
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
