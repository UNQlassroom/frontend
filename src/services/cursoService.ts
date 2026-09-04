import { get, post } from "@/api";
import type {
  ApiResponse,
  CursoRequestDTO,
  CursoResponseDTO,
  ObtenerAlumnosResponseDTO,
  AgregarAlumnosRequestDTO,
  AgregarAlumnosResponseDTO,
} from "@/types";

export const cursoService = {
  /**
   * Envía la petición POST http://localhost:8080/cursos/crear
   */
  crearCurso: (data: CursoRequestDTO): Promise<ApiResponse<CursoResponseDTO>> => {
    return post<CursoResponseDTO, CursoRequestDTO>("/cursos/crear", data);
  },

  /**
   * Envía la petición GET http://localhost:8080/cursos
   */
  obtenerCursos: (): Promise<ApiResponse<CursoResponseDTO[]>> => {
    return get<CursoResponseDTO[]>("/cursos");
  },

  /**
   * Envía la petición GET http://localhost:8080/cursos/{id}/alumnos
   */
  obtenerAlumnos: (id: number): Promise<ApiResponse<ObtenerAlumnosResponseDTO>> => {
    return get<ObtenerAlumnosResponseDTO>(`/cursos/${id}/alumnos`);
  },

  /**
   * Envía la petición POST http://localhost:8080/cursos/{id}/alumnos
   */
  agregarAlumnos: (
    id: number,
    data: AgregarAlumnosRequestDTO
  ): Promise<ApiResponse<AgregarAlumnosResponseDTO>> => {
    return post<AgregarAlumnosResponseDTO, AgregarAlumnosRequestDTO>(
      `/cursos/${id}/alumnos`,
      data
    );
  },
};

export const { crearCurso, obtenerCursos, obtenerAlumnos, agregarAlumnos } = cursoService;
