/**
 * Datos que espera el backend en POST /cursos/crear
 */
export interface CursoRequestDTO {
  materia: string;
  anio: number;
  semestre: number;
  comision: number;
}

/**
 * Respuesta que devuelve el backend en POST /cursos/crear
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
 * Datos que vienen del formulario CreateCourseDialog
 */
export interface CreateCourseFormData {
  materia: string;
  comision: string;
  semestre: string;
}
