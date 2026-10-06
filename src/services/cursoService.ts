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
   * Envía la petición GET http://localhost:8080/cursos
   */
  obtenerCursos: (): Promise<ApiResponse<CursoResponseDTO[]>> => {
    return get<CursoResponseDTO[]>("/cursos");
  },

  /**
   * Envía la petición GET http://localhost:8080/cursos/{id}
   * Con fallback a obtenerCursos si el backend aún no expone el endpoint individual
   */
  obtenerCursoPorId: async (id: number): Promise<ApiResponse<CursoResponseDTO>> => {
    try {
      return await get<CursoResponseDTO>(`/cursos/${id}`);
    } catch (err: unknown) {
      try {
        const todos = await get<CursoResponseDTO[]>("/cursos");
        const encontrado = todos.data.find((c) => c.id === id);
        if (encontrado) {
          return {
            headers: todos.headers,
            status: todos.status,
            statusText: todos.statusText,
            data: encontrado,
          };
        }
      } catch {
        // Ignorar y lanzar el error original
      }
      throw err;
    }
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
   * Envía la petición POST http://localhost:8080/cursos/{id}/alumnos/sync
   * Sincroniza con GitHub el estado de las invitaciones pendientes
   */
  sincronizarAlumnos: (id: number): Promise<ApiResponse<CursoAlumnosResponseDTO>> => {
    return post<CursoAlumnosResponseDTO, Record<string, never>>(
      `/cursos/${id}/alumnos/sync`,
      {}
    );
  },
};

export const {
  crearCurso,
  obtenerCursos,
  obtenerCursoPorId,
  obtenerAlumnos,
  agregarAlumnos,
  sincronizarAlumnos,
} = cursoService;
