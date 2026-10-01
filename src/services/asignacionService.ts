import { get, post } from "@/api";
import type {
  ApiResponse,
  AsignacionResponseDTO,
  CrearAsignacionRequestDTO,
  CalificarAsignacionRequestDTO,
  TemplateRepoResponseDTO,
  CrearTemplateRepoRequestDTO,
  CorreccionGrupoResponseDTO,
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
   * Envía la petición POST /cursos/{cursoId}/asignaciones/{asignacionId}/entregar
   * Marca la asignación como entregada por el alumno o docente
   */
  entregarAsignacion: (
    cursoId: number,
    asignacionId: number,
    grupoId?: number
  ): Promise<ApiResponse<AsignacionResponseDTO>> => {
    return post<AsignacionResponseDTO, { grupoId?: number } | undefined>(
      `/cursos/${cursoId}/asignaciones/${asignacionId}/entregar`,
      grupoId ? { grupoId } : undefined
    );
  },

  /**
   * Envía la petición POST /cursos/{cursoId}/asignaciones/{asignacionId}/grupos/calificar
   * Docente: Califica la asignación de un grupo o alumno con nota y observaciones
   */
  calificarAsignacion: (
    cursoId: number,
    asignacionId: number,
    data: CalificarAsignacionRequestDTO
  ): Promise<ApiResponse<AsignacionResponseDTO>> => {
    return post<AsignacionResponseDTO, CalificarAsignacionRequestDTO>(
      `/cursos/${cursoId}/asignaciones/${asignacionId}/grupos/calificar`,
      data
    );
  },

  /**
   * Envía la petición GET /cursos/{cursoId}/asignaciones/{asignacionId}/correcciones
   * Docente: Obtiene los grupos con sus issues calculados (PENDIENTE, ACTUALIZADO, RESUELTO).
   * Alumno: Obtiene únicamente su grupo con sus issues calculados.
   */
  obtenerCorrecciones: (
    cursoId: number,
    asignacionId: number
  ): Promise<ApiResponse<CorreccionGrupoResponseDTO[]>> => {
    return get<CorreccionGrupoResponseDTO[]>(
      `/cursos/${cursoId}/asignaciones/${asignacionId}/correcciones`
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
  entregarAsignacion,
  calificarAsignacion,
  obtenerCorrecciones,
  listarTemplates,
  crearTemplate,
} = asignacionService;
