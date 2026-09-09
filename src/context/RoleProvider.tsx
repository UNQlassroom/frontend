import { useState, type ReactNode } from "react";
import { RoleContext, type UserRole } from "./role.context";

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole>("profesor");

  const toggleRole = () => {
    setRole((prev) => (prev === "profesor" ? "alumno" : "profesor"));
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        toggleRole,
        isProfesor: role === "profesor",
        isAlumno: role === "alumno",
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};
