import { post } from "@/api";
import type {
  ApiResponse,
  AuthResponseDTO,
  GitHubLoginRequestDTO,
} from "@/types";

export const authService = {
  loginConGitHub: (
    data: GitHubLoginRequestDTO
  ): Promise<ApiResponse<AuthResponseDTO>> => {
    return post<AuthResponseDTO, GitHubLoginRequestDTO>("/auth/github", data);
  },
};

export const { loginConGitHub } = authService;
