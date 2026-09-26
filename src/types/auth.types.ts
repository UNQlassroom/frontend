export interface Usuario {
  id: number;
  username: string;
  esDocente: boolean;
  email: string | null;
  nombreCompleto: string | null;
}

export interface AuthResponseDTO {
  token?: string | null;
  user?: Usuario | null;
  requiereUnirseAOrg?: boolean;
  redirectUrl?: string | null;
}

export interface GitHubLoginRequestDTO {
  code: string;
  esDocente: boolean;
}
