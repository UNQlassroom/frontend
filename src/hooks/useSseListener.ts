import { useContext, useEffect, useRef } from "react";
import { SseContext } from "@/context/sse.context";
import type { SseEventDTO, SseEventType } from "@/types";

/**
 * Suscribe un callback a uno o varios tipos de eventos Server-Sent Events (SSE).
 * Mantiene siempre actualizada la referencia del callback sin re-suscribir en cada render.
 */
export const useSseListener = (
  types: SseEventType | SseEventType[],
  onEvent: (event: SseEventDTO) => void
): void => {
  const context = useContext(SseContext);
  const onEventRef = useRef(onEvent);
  const typesRef = useRef(types);

  useEffect(() => {
    onEventRef.current = onEvent;
    typesRef.current = types;
  });

  useEffect(() => {
    if (!context) return;

    const unsubscribe = context.subscribe((event) => {
      const currentTypes = typesRef.current;
      const matches = Array.isArray(currentTypes)
        ? currentTypes.includes(event.type)
        : currentTypes === event.type;

      if (matches) {
        onEventRef.current(event);
      }
    });

    return unsubscribe;
  }, [context]);
};

