import axios from "axios";
import type { ErrorSeverity } from "@/types";
import { ERROR_MESSAGES, BACKEND_ERROR_CODES } from "@/constants";

export interface ResolvedApiError {
  message: string;
  severity: ErrorSeverity;
  errorCode?: string;
  status?: number;
  url?: string;
  method?: string;
  isUnauthorizedSession: boolean;
}

export const resolveApiError = (error: unknown): ResolvedApiError | null => {
  if (axios.isCancel(error)) return null;

  // 1. Falla de conexión o servidor caído (sin respuesta HTTP)
  if (!axios.isAxiosError(error) || !error.response) {
    const isTimeout = axios.isAxiosError(error) && error.code === "ECONNABORTED";
    return {
      message: isTimeout
        ? "La solicitud tardó demasiado tiempo en responder (timeout)."
        : "No se pudo conectar con el servidor. Verificá tu conexión a internet.",
      severity: "error",
      isUnauthorizedSession: false,
    };
  }

  // 2. Respuesta del backend (con status y ApiError)
  const { status, data, config } = error.response;
  const errorCode = data?.errorCode || undefined;
  const dict = errorCode ? ERROR_MESSAGES[errorCode] : undefined;

  return {
    message:
      dict?.message ||
      data?.message ||
      "Ocurrió un error inesperado al procesar la solicitud.",
    severity: dict?.severity || (status >= 500 ? "error" : "warning"),
    errorCode,
    status,
    url: config?.url,
    method: config?.method?.toUpperCase(),
    isUnauthorizedSession: errorCode === BACKEND_ERROR_CODES.UNAUTHORIZED,
  };
};
