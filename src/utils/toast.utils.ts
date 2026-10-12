import { toast, type ToastOptions } from "react-toastify";
import type { ResolvedApiError } from "./apiError.utils";

/**
 * Muestra una notificación toast amigable según la severidad del error.
 * Utiliza un `toastId` predecible para evitar que ráfagas de llamadas concurrentes
 * llenen la pantalla de toasts idénticos.
 */
export const notifyApiError = (
  errorInfo: ResolvedApiError,
  customOptions?: ToastOptions
): void => {
  const { message, severity, errorCode, status, url, method } = errorInfo;

  // Generamos un toastId basado en el código de error o en la combinación método + URL + status
  const keyIdentifier =
    errorCode || `${method || "REQ"}_${url || "unknown"}_${status || "ERR"}`;
  const toastId = `api_err_${keyIdentifier}`;

  const options: ToastOptions = {
    toastId,
    autoClose: severity === "warning" ? 6000 : 7000,
    ...customOptions,
  };

  switch (severity) {
    case "warning":
      toast.warning(message, options);
      break;
    case "info":
      toast.info(message, options);
      break;
    case "error":
    default:
      toast.error(message, options);
      break;
  }
};
