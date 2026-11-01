import { useEffect, useRef, useCallback, useMemo, type ReactNode } from "react";
import { fetchEventSource, EventStreamContentType } from "@microsoft/fetch-event-source";
import { API_BASE_URL } from "@/api";
import { useAuth } from "@/hooks/useAuth";
import { SseContext } from "./sse.context";
import type { SseEventDTO, SseEventListener } from "@/types";

class FatalSseError extends Error {}

export const SseProvider = ({ children }: { children: ReactNode }) => {
  const { token, isAuthenticated, logout } = useAuth();
  const listenersRef = useRef<Set<SseEventListener>>(new Set());
  const logoutRef = useRef(logout);

  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  const subscribe = useCallback((listener: SseEventListener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    const abortController = new AbortController();

    void fetchEventSource(`${API_BASE_URL}/sse/eventos`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: EventStreamContentType,
      },
      signal: abortController.signal,
      openWhenHidden: true,
      async onopen(response) {
        if (
          response.ok &&
          response.headers.get("content-type")?.includes(EventStreamContentType)
        ) {
          return;
        }
        if (response.status === 401 || response.status === 403) {
          logoutRef.current();
          throw new FatalSseError("Sesión no autorizada o expirada");
        }
        if (
          response.status >= 400 &&
          response.status < 500 &&
          response.status !== 429
        ) {
          throw new FatalSseError(`Error cliente SSE: ${response.status}`);
        }
      },
      onmessage(msg) {
        // Ignorar eventos de sistema (connected y ping) o mensajes vacíos
        if (msg.event === "connected" || msg.event === "ping" || !msg.data) {
          return;
        }

        // Todos los eventos de negocio vienen por el canal por defecto ("" o "message")
        if (msg.event === "" || msg.event === "message") {
          try {
            const parsed = JSON.parse(msg.data) as SseEventDTO;
            if (parsed && parsed.type) {
              listenersRef.current.forEach((listener) => {
                try {
                  listener(parsed);
                } catch {
                  // Evitar que un error en un listener afecte a los demás
                }
              });
            }
          } catch {
            // Ignorar payloads que no sean JSON válido
          }
        }
      },
      onerror(err) {
        if (err instanceof FatalSseError || abortController.signal.aborted) {
          throw err;
        }
        // Para errores transitorios de red, devolver undefined permite a fetchEventSource reintentar automáticamente
      },
    }).catch(() => {
      // Silenciar rechazo final al abortar o ante error fatal controlado
    });

    return () => {
      abortController.abort();
    };
  }, [isAuthenticated, token]);

  const contextValue = useMemo(() => ({ subscribe }), [subscribe]);

  return (
    <SseContext.Provider value={contextValue}>{children}</SseContext.Provider>
  );
};

