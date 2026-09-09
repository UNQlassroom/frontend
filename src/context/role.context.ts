import { createContext } from "react";

export type UserRole = "profesor" | "alumno";

export interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  toggleRole: () => void;
  isProfesor: boolean;
  isAlumno: boolean;
}

export const RoleContext = createContext<RoleContextType | undefined>(undefined);
