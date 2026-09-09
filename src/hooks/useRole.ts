import { useContext } from "react";
import { RoleContext } from "@/context/role.context";

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole debe ser usado dentro de un RoleProvider");
  }
  return context;
};
