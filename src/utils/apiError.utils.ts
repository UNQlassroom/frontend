import axios, { type AxiosResponse } from "axios";
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

  const isAxios = axios.isAxiosError(error);
  const isObject = error !== null && typeof error === "object";

  const response: AxiosResponse | undefined = isAxios
    ? error.response
    : isObject && "response" in error
    ? (error as { response?: AxiosResponse }).response
    : undefined;

  // 1. Falla de conexión o servidor caído (sin respuesta HTTP)
  if (!response) {
    const isTimeout =
      (isAxios && error.code === "ECONNABORTED") ||
      (isObject &&
        "code" in error &&
        (error as { code?: string }).code === "ECONNABORTED");

    return {
      message: isTimeout
        ? "La solicitud tardó demasiado tiempo en responder (timeout)."
        : "No se pudo conectar con el servidor. Verificá tu conexión a internet.",
      severity: "error",
      isUnauthorizedSession: false,
    };
  }

  // 2. Respuesta del backend (con status y ApiError)
  const { status, data, config } = response;
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
    isUnauthorizedSession:
      errorCode === BACKEND_ERROR_CODES.UNAUTHORIZED || status === 401,
  };
};
