import { createContext } from "react";
import type { SseEventListener } from "@/types";

export interface SseContextType {
  subscribe: (listener: SseEventListener) => () => void;
}

export const SseContext = createContext<SseContextType | undefined>(undefined);

