import { post } from "@/api";
import type {
  ApiResponse,
  AuthResponseDTO,
  GitHubLoginRequestDTO,
} from "@/types";

export const authService = {
  /**
   * Envía la petición POST /auth/github con el código devuelto por GitHub
   * y la bandera esDocente para autenticar o registrar al usuario.
   */
  loginConGitHub: (
    data: GitHubLoginRequestDTO
  ): Promise<ApiResponse<AuthResponseDTO>> => {
    return post<AuthResponseDTO, GitHubLoginRequestDTO>("/auth/github", data);
  },
};

export const { loginConGitHub } = authService;
