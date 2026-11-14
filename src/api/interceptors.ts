import axios, { type AxiosInstance } from "axios";
import { resolveApiError, notifyApiError } from "@/utils";

type UnauthorizedHandler = () => void;

let onUnauthorizedCallback: UnauthorizedHandler | null = null;

/**
 * Permite a la capa de contexto de autenticación (AuthProvider) registrar
 * la acción de logout ante una respuesta 401 de sesión expirada.
 */
export const setUnauthorizedHandler = (handler: UnauthorizedHandler | null): void => {
  onUnauthorizedCallback = handler;
};

/**
 * Configura el interceptor global de respuestas en la instancia de Axios.
 * Atrapa los errores del servidor, resuelve el mensaje legible por errorCode
 * o por el mensaje del backend, emite el toast correspondiente y gestiona
 * el cierre de sesión si el token ha expirado.
 */
export const setupResponseInterceptor = (instance: AxiosInstance): void => {
  instance.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      const isAxios = axios.isAxiosError(error);
      const skipToast = isAxios && Boolean(error.config?.skipErrorToast);

      const resolved = resolveApiError(error);

      // Si no fue cancelado y no tiene el flag skipErrorToast, emitimos el toast
      if (resolved && !skipToast) {
        notifyApiError(resolved);
      }

      // Si el backend notificó expiración de sesión (UNAUTHORIZED), cerramos la sesión silenciosamente
      if (resolved?.isUnauthorizedSession && onUnauthorizedCallback) {
          onUnauthorizedCallback();
      }

      // Propagamos el error para que los llamadores puedan manejar flujos específicos si lo desean
      return Promise.reject(error);
    }
  );
};
