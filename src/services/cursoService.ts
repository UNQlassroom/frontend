import { get, post } from "@/api";
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
};

export const {
  crearCurso,
  obtenerCursos,
  obtenerCursoPorId,
  archivarCurso,
  obtenerAlumnos,
  agregarAlumnos,
} = cursoService;
