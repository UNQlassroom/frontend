import { get, post } from "@/api";
import type {
  ApiResponse,
  CursoRequestDTO,
  CursoResponseDTO,
  AlumnosDeUnCursoResponseDTO,
  AgregarAlumnosRequestDTO,
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
  obtenerAlumnos: (id: number): Promise<ApiResponse<AlumnosDeUnCursoResponseDTO>> => {
    return get<AlumnosDeUnCursoResponseDTO>(`/cursos/${id}/alumnos`);
  },

  /**
   * Envía la petición POST http://localhost:8080/cursos/{id}/alumnos
   */
  agregarAlumnos: (
    id: number,
    data: AgregarAlumnosRequestDTO
  ): Promise<ApiResponse<AlumnosDeUnCursoResponseDTO>> => {
    return post<AlumnosDeUnCursoResponseDTO, AgregarAlumnosRequestDTO>(
      `/cursos/${id}/alumnos`,
      data
    );
  },
};

export const {
  crearCurso,
  obtenerCursos,
  obtenerCursoPorId,
  obtenerAlumnos,
  agregarAlumnos,
} = cursoService;

