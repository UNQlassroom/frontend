/**
 * Datos que espera el backend para un Curso
 */
export interface CursoRequestDTO {
  materia: string;
  anio: number;
  semestre: number;
  comision: number;
}

/**
 * Docente perteneciente al equipo docente de un curso
 */
export interface DocenteResponseDTO {
  id: number;
  username: string;
  nombreCompleto?: string | null;
  email?: string | null;
  dni?: string | null;
}

/**
 * Respuesta que devuelve el backend para un Curso
 */
export interface CursoResponseDTO {
  id: number;
  materia: string;
  anio: number;
  semestre: number;
  comision: number;
  descripcion?: string | null;
  archivado?: boolean;
  docentes: DocenteResponseDTO[];
}

/**
 * Verifica si un username pertenece al equipo docente del curso
 */
export const esDocenteDelCurso = (
  curso?: Pick<CursoResponseDTO, "docentes"> | null,
  username?: string | null
): boolean => {
  if (!curso || !username || !Array.isArray(curso.docentes)) {
    return false;
  }
  const target = username.trim().toLowerCase();
  return curso.docentes.some(
    (d) => d?.username?.trim().toLowerCase() === target
  );
};

/**
 * Petición para agregar docentes al equipo docente de un curso
 */
export interface AgregarDocentesRequestDTO {
  usernames: string[];
}

/**
 * Respuesta del backend al listar o agregar docentes de un curso
 */
export interface CursoDocentesResponseDTO {
  cursoId: number;
  docentes: DocenteResponseDTO[];
}

/**
 * Datos que vienen del formulario CrearCursoModal
 */
export interface CrearCursoFormData {
  materia: string;
  comision: string;
  semestre: string;
}

/**
 * Datos del repositorio de GitHub asociado a una asignación o grupo
 */
export interface RepositorioDTO {
  id?: number | null;
  nombre: string;
  htmlUrl: string;
  ultimoCommit?: string | null;
  fechaUltimoCommit?: string | null;
  rama?: string | null;
  estadoCI?: "sin_ci" | "success" | "failure" | "pending" | string | null;
  ciEtapaFallida?: string | null;
  ciLogError?: string | null;
  ciRunUrl?: string | null;
}

/**
 * Petición para agregar/invitar alumnos al equipo de GitHub de un curso
 */
export interface AgregarAlumnosRequestDTO {
  usernames: string[];
}

/**
 * Alumno perteneciente al curso (sin repositorio directo)
 */
export interface AlumnoResponseDTO {
  id?: number;
  username: string;
  role: string;
  state: "active" | "pending" | string;
  nombreCompleto?: string | null;
  email?: string | null;
  dni?: string | null;
}

/**
 * Respuesta del backend al consultar alumnos
 */
export interface CursoAlumnosResponseDTO {
  cursoId: number;
  alumnos: AlumnoResponseDTO[];
}
