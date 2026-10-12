import type { AxiosResponse } from "axios";

export interface ApiResponse<T = unknown> {
  headers: AxiosResponse["headers"];
  status: number;
  statusText: string;
  data: T;
}

export interface ApiErrorResponse {
  code?: string;
  message: string;
  response?: AxiosResponse;
}

export type ErrorSeverity = "error" | "warning" | "info";

/**
 * Payload estructurado que responde el backend en caso de excepción
 */
export interface ApiErrorPayload {
  status: number;
  error: string;
  message?: string | null;
  errorCode?: string | null;
  path?: string | null;
  timestamp?: string;
}

declare module "axios" {
  export interface AxiosRequestConfig {
    /**
     * Si es true, el interceptor global no emitirá toast para esta petición.
     * Útil para peticiones con fallback o pre-chequeos silenciosos.
     */
    skipErrorToast?: boolean;
  }
}
