import { get, post, deleteRequest, apiClient } from "@/api";
import { downloadBlob, getFilenameFromContentDisposition } from "@/utils";
import type {
  ApiResponse,
  CursoRequestDTO,
  CursoResponseDTO,
  CursoAlumnosResponseDTO,
  AgregarAlumnosRequestDTO,
} from "@/types";

export const cursoService = {
  /**
   * Envía la petición POST http://localhost:8080/cursos
   */
  crearCurso: (data: CursoRequestDTO): Promise<ApiResponse<CursoResponseDTO>> => {
    return post<CursoResponseDTO, CursoRequestDTO>("/cursos", data);
  },

  /**
   * Envía la petición GET http://localhost:8080/cursos (o GET /cursos?archivados=true)
   */
  obtenerCursos: (archivados?: boolean): Promise<ApiResponse<CursoResponseDTO[]>> => {
    const config = archivados !== undefined ? { params: { archivados } } : {};
    return get<CursoResponseDTO[]>("/cursos", config);
  },

  /**
   * Envía la petición GET http://localhost:8080/cursos/{id}
   */
  obtenerCursoPorId: (id: number): Promise<ApiResponse<CursoResponseDTO>> => {
    return get<CursoResponseDTO>(`/cursos/${id}`);
  },

  /**
   * Envía la petición POST http://localhost:8080/cursos/{id}/archivar
   */
  archivarCurso: (id: number): Promise<ApiResponse<CursoResponseDTO>> => {
    return post<CursoResponseDTO>(`/cursos/${id}/archivar`);
  },

  /**
   * Envía la petición POST http://localhost:8080/cursos/{id}/exportar
   * Descarga la planilla de calificaciones del curso en formato Excel (.xlsx) y retorna el nombre del archivo.
   */
  exportarCurso: async (
    id: number,
    fallbackNombreCurso?: string
  ): Promise<string> => {
    const response = await apiClient.post<Blob>(
      `/cursos/${id}/exportar`,
      null,
      {
        responseType: "blob",
      }
    );

    const safeCursoName = (fallbackNombreCurso || `${id}`)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");
    const defaultFilename = `curso_${safeCursoName}_unqlassroom.xlsx`;

    const disposition = response.headers["content-disposition"] as string | undefined;
    const filename = getFilenameFromContentDisposition(disposition, defaultFilename);

    downloadBlob(response.data, filename);
    return filename;
  },

  /**
   * Envía la petición GET http://localhost:8080/cursos/{id}/alumnos
   */
  obtenerAlumnos: (id: number): Promise<ApiResponse<CursoAlumnosResponseDTO>> => {
    return get<CursoAlumnosResponseDTO>(`/cursos/${id}/alumnos`);
  },

  /**
   * Envía la petición POST http://localhost:8080/cursos/{id}/alumnos
   */
  agregarAlumnos: (
    id: number,
    data: AgregarAlumnosRequestDTO
  ): Promise<ApiResponse<CursoAlumnosResponseDTO>> => {
    return post<CursoAlumnosResponseDTO, AgregarAlumnosRequestDTO>(
      `/cursos/${id}/alumnos`,
      data
    );
  },

  /**
   * Envía la petición DELETE http://localhost:8080/cursos/{cursoId}/alumnos/{username}
   */
  eliminarAlumno: (
    cursoId: number,
    username: string
  ): Promise<ApiResponse<void>> => {
    return deleteRequest<void>(`/cursos/${cursoId}/alumnos/${username}`);
  },
};

export const {
  crearCurso,
  obtenerCursos,
  obtenerCursoPorId,
  archivarCurso,
  exportarCurso,
  obtenerAlumnos,
  agregarAlumnos,
  eliminarAlumno,
} = cursoService;
