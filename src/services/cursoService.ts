import { post } from "@/api";
import type {
  ApiResponse,
  CursoRequestDTO,
  CursoResponseDTO,
} from "@/types";

export const cursoService = {
  /**
   * Envía la petición POST http://localhost:8080/cursos/crear
   */
  crearCurso: (data: CursoRequestDTO): Promise<ApiResponse<CursoResponseDTO>> => {
    return post<CursoResponseDTO, CursoRequestDTO>("/cursos/crear", data);
  },

  /**
   * Alias de crearCurso
   */
  postTeam: (data: CursoRequestDTO): Promise<ApiResponse<CursoResponseDTO>> => {
    return cursoService.crearCurso(data);
  },
};

export const { crearCurso, postTeam } = cursoService;
