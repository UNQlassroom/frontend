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
  descripcion: string;
  githubTeamId?: number | null;
  githubTeamSlug?: string | null;
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
 * Alumno miembro de un equipo en GitHub
 */
export interface AlumnoTeamMemberDTO {
  username: string;
  role: string;
  state: string;
}

/**
 * Respuesta que devuelve el backend con los alumnos de un curso
 */
export interface ObtenerAlumnosResponseDTO {
  cursoId: number;
  teamSlug: string;
  alumnos: AlumnoTeamMemberDTO[];
}

/**
 * Petición para agregar/invitar alumnos al equipo de GitHub de un curso
 */
export interface AgregarAlumnosRequestDTO {
  usernames: string[];
}

/**
 * Membresía de un alumno en el equipo de GitHub
 */
export interface AlumnoTeamMembershipDTO {
  username: string;
  role: string;
  state: string;
}

/**
 * Respuesta del backend al agregar alumnos
 */
export interface AgregarAlumnosResponseDTO {
  cursoId: number;
  teamSlug: string;
  alumnos: AlumnoTeamMembershipDTO[];
}
