export interface UsuarioResponseDTO {
  id?: number | null;
  username: string;
  esDocente?: boolean;
  email?: string | null;
  nombreCompleto?: string | null;
}

export interface GitHubLoginResponseDTO {
  id: number;
  username: string;
  esDocente: boolean;
  email: string | null;
  nombreCompleto: string | null;
}

export type Usuario = GitHubLoginResponseDTO;

export interface AuthResponseDTO {
  token?: string | null;
  user?: GitHubLoginResponseDTO | null;
  requiereUnirseAOrg?: boolean;
  redirectUrl?: string | null;
}

export interface GitHubLoginRequestDTO {
  code: string;
  esDocente: boolean;
}
