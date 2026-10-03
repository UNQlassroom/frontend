import { createContext } from "react";
import type { Usuario } from "@/types";

export interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDocente: boolean;
  isAlumno: boolean;
  login: (token: string, user: Usuario) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
