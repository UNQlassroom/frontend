import { get, post } from "@/api";
import type {
  ApiResponse,
  AsignacionResponseDTO,
  CrearAsignacionRequestDTO,
  TemplateRepoResponseDTO,
  CrearTemplateRepoRequestDTO,
} from "@/types";

export const asignacionService = {
  /**
   * Envía la petición POST /cursos/{cursoId}/asignaciones
   * Crea una asignación (individual o grupal) con sus repositorios derivados
   */
  crearAsignacion: (
    cursoId: number,
    data: CrearAsignacionRequestDTO
  ): Promise<ApiResponse<AsignacionResponseDTO>> => {
    return post<AsignacionResponseDTO, CrearAsignacionRequestDTO>(
      `/cursos/${cursoId}/asignaciones`,
      data
    );
  },

  /**
   * Envía la petición GET /cursos/{cursoId}/asignaciones
   * Docente: obtiene todas las asignaciones con todos los grupos.
   * Alumno: obtiene las asignaciones donde participa.
   */
  obtenerAsignaciones: (
    cursoId: number
  ): Promise<ApiResponse<AsignacionResponseDTO[]>> => {
    return get<AsignacionResponseDTO[]>(`/cursos/${cursoId}/asignaciones`);
  },

  /**
   * Envía la petición GET /cursos/{cursoId}/asignaciones/{asignacionId}
   * Obtiene el detalle de la asignación refrescando la info de GitHub
   */
  obtenerAsignacionPorId: (
    cursoId: number,
    asignacionId: number
  ): Promise<ApiResponse<AsignacionResponseDTO>> => {
    return get<AsignacionResponseDTO>(
      `/cursos/${cursoId}/asignaciones/${asignacionId}`
    );
  },

  /**
   * Envía la petición GET /templates
   * Lista los repositorios plantillas disponibles en la organización
   */
  listarTemplates: (): Promise<ApiResponse<TemplateRepoResponseDTO[]>> => {
    return get<TemplateRepoResponseDTO[]>("/templates");
  },

  /**
   * Envía la petición POST /templates
   * Crea un nuevo repositorio plantilla en la organización
   */
  crearTemplate: (
    data: CrearTemplateRepoRequestDTO
  ): Promise<ApiResponse<TemplateRepoResponseDTO>> => {
    return post<TemplateRepoResponseDTO, CrearTemplateRepoRequestDTO>(
      "/templates",
      data
    );
  },
};

export const {
  crearAsignacion,
  obtenerAsignaciones,
  obtenerAsignacionPorId,
  listarTemplates,
  crearTemplate,
} = asignacionService;
