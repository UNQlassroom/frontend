import { get, put } from "@/api";
import type {
  ApiResponse,
  UsuarioResponseDTO,
  ActualizarNombreRequestDTO,
} from "@/types";

export const usuarioService = {
  /**
   * Obtiene la información del usuario autenticado actual.
   * GET /usuarios/me
   */
  getUsuarioActual: (): Promise<ApiResponse<UsuarioResponseDTO>> => {
    return get<UsuarioResponseDTO>("/usuarios/me");
  },

  /**
   * Actualiza el nombre y apellido del usuario autenticado actual.
   * PUT /usuarios/me/nombre
   */
  actualizarNombre: (
    data: ActualizarNombreRequestDTO
  ): Promise<ApiResponse<UsuarioResponseDTO>> => {
    return put<UsuarioResponseDTO, ActualizarNombreRequestDTO>(
      "/usuarios/me/nombre",
      data
    );
  },
};

export const { getUsuarioActual, actualizarNombre } = usuarioService;
