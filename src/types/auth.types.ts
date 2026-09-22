export interface Usuario {
  id: number;
  username: string;
  esDocente: boolean;
  email: string | null;
  nombreCompleto: string | null;
}

export interface AuthResponseDTO {
  token: string;
  user: Usuario;
}

export interface GitHubLoginRequestDTO {
  code: string;
  esDocente: boolean;
}
