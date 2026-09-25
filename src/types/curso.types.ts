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
 * Respuesta que devuelve el backend para un Curso
 */
export interface CursoResponseDTO {
  id: number;
  materia: string;
  anio: number;
  semestre: number;
  comision: number;
  descripcion?: string | null;
  ownerUsername?: string | null;
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
  estadoCI?: "sin_ci" | "success" | "failure" | "pending" | string | null;
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
export interface AlumnoMiembroDeUnCursoDTO {
  username: string;
  role: string;
  state: "active" | "pending" | string;
}

/**
 * Respuesta del backend al consultar/sincronizar alumnos
 */
export interface AlumnosDeUnCursoResponseDTO {
  cursoId: number;
  alumnos: AlumnoMiembroDeUnCursoDTO[];
}
