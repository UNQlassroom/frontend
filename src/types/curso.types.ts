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
