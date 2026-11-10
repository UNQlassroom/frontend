import { get, post, put, deleteRequest } from "@/api";
import type {
  ApiResponse,
  AsignacionResponseDTO,
  CrearAsignacionRequestDTO,
  ModificarAsignacionRequestDTO,
  CalificarAsignacionRequestDTO,
  TemplateRepoResponseDTO,
  CrearTemplateRepoRequestDTO,
  CorreccionGrupoResponseDTO,
  DiagnosticoCIResponseDTO,
  MetricasCIResponseDTO,
  ReporteLinterResponseDTO,
} from "@/types";

const buildGrupoQuery = (grupoId?: number): string =>
  grupoId !== undefined && grupoId !== null ? `?grupo=${grupoId}` : "";

export const asignacionService = {
  /**
   * Envía la petición POST /cursos/{cursoId}/asignaciones
   * Registra la asignación en estado CREANDO (202 Accepted) y dispara en segundo plano
   * la creación asíncrona de los repositorios derivados en GitHub.
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
   * Obtiene el detalle de la asignación.
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
   * Marca la asignación como entregada por el alumno o docente.
   * El parámetro de query ?grupo={grupoId} es opcional en el backend (grupo: Long?).
   */
  entregarAsignacion: (
    cursoId: number,
    asignacionId: number,
    grupoId?: number
  ): Promise<ApiResponse<AsignacionResponseDTO>> => {
    const query = buildGrupoQuery(grupoId);
    return post<AsignacionResponseDTO, undefined>(
      `/cursos/${cursoId}/asignaciones/${asignacionId}/entregar${query}`,
      undefined
    );
  },

  /**
   * Envía la petición POST /cursos/{cursoId}/asignaciones/{asignacionId}/calificar
   * Docente: Califica la asignación de un grupo con nota y observaciones
   */
  calificarAsignacion: (
    cursoId: number,
    asignacionId: number,
    data: CalificarAsignacionRequestDTO
  ): Promise<ApiResponse<AsignacionResponseDTO>> => {
    return post<AsignacionResponseDTO, CalificarAsignacionRequestDTO>(
      `/cursos/${cursoId}/asignaciones/${asignacionId}/calificar`,
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
   * Envía la petición GET /cursos/{cursoId}/asignaciones/{asignacionId}/diagnostico-ci
   * Obtiene el diagnóstico detallado del último pipeline de CI (etapa fallida, extracto de log y link).
   */
  obtenerDiagnosticoCI: (
    cursoId: number,
    asignacionId: number,
    grupoId?: number
  ): Promise<ApiResponse<DiagnosticoCIResponseDTO>> => {
    const query = buildGrupoQuery(grupoId);
    return get<DiagnosticoCIResponseDTO>(
      `/cursos/${cursoId}/asignaciones/${asignacionId}/diagnostico-ci${query}`
    );
  },

  /**
   * Envía la petición GET /cursos/{cursoId}/asignaciones/{asignacionId}/metricas
   * Obtiene las métricas de cobertura (JaCoCo) y estado de tests (JUnit) del grupo.
   */
  obtenerMetricasCI: (
    cursoId: number,
    asignacionId: number,
    grupoId?: number
  ): Promise<ApiResponse<MetricasCIResponseDTO>> => {
    const query = buildGrupoQuery(grupoId);
    return get<MetricasCIResponseDTO>(
      `/cursos/${cursoId}/asignaciones/${asignacionId}/metricas${query}`
    );
  },

  /**
   * Envía la petición GET /cursos/{cursoId}/asignaciones/{asignacionId}/linter
   * Obtiene el resumen y listado de incidencias del linter para el repositorio del grupo.
   */
  obtenerReporteLinter: (
    cursoId: number,
    asignacionId: number,
    grupoId?: number
  ): Promise<ApiResponse<ReporteLinterResponseDTO>> => {
    const query = buildGrupoQuery(grupoId);
    return get<ReporteLinterResponseDTO>(
      `/cursos/${cursoId}/asignaciones/${asignacionId}/linter${query}`
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
   * Crea o importa un nuevo repositorio plantilla en la organización con blindaje automático
   */
  crearTemplate: (
    data: CrearTemplateRepoRequestDTO
  ): Promise<ApiResponse<TemplateRepoResponseDTO>> => {
    return post<TemplateRepoResponseDTO, CrearTemplateRepoRequestDTO>(
      "/templates",
      data,
      { timeout: 60000 }
    );
  },

  /**
   * Envía la petición DELETE /cursos/{cursoId}/asignaciones/{asignacionId}
   * Dispara la eliminación asincrónica de la asignación y de los repositorios en GitHub.
   */
  eliminarAsignacion: (
    cursoId: number,
    asignacionId: number
  ): Promise<ApiResponse<void>> => {
    return deleteRequest<void>(
      `/cursos/${cursoId}/asignaciones/${asignacionId}`
    );
  },

  /**
   * Envía la petición PUT /cursos/{cursoId}/asignaciones/{asignacionId}
   * Modifica la descripción y/o fecha límite de una asignación.
   */
  modificarAsignacion: (
    cursoId: number,
    asignacionId: number,
    data: ModificarAsignacionRequestDTO
  ): Promise<ApiResponse<AsignacionResponseDTO>> => {
    return put<AsignacionResponseDTO, ModificarAsignacionRequestDTO>(
      `/cursos/${cursoId}/asignaciones/${asignacionId}`,
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
  obtenerDiagnosticoCI,
  obtenerMetricasCI,
  obtenerReporteLinter,
  listarTemplates,
  crearTemplate,
  eliminarAsignacion,
  modificarAsignacion,
} = asignacionService;
