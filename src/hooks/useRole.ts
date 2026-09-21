import { useAuth } from "./useAuth";

export const useRole = () => {
  const { isProfesor, isAlumno, user } = useAuth();
  const role = isProfesor ? "profesor" : "alumno";

  return {
    role,
    isProfesor,
    isAlumno,
    user,
  };
};
