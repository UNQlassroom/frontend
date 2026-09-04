import { useState, useCallback } from "react";
import { obtenerAlumnos } from "@/services";
import type { ObtenerAlumnosResponseDTO } from "@/types";

export const useAlumnos = () => {
  const [alumnosData, setAlumnosData] = useState<ObtenerAlumnosResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cargarAlumnos = useCallback(async (cursoId: number): Promise<ObtenerAlumnosResponseDTO | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await obtenerAlumnos(cursoId);
      setAlumnosData(response.data);
      return response.data;
    } catch (err: unknown) {
      console.error("Error al obtener alumnos:", err);
      if (typeof err === "object" && err !== null && "message" in err) {
        const apiErr = err as { message: string; code?: string };
        if (apiErr.message === "Network Error" || apiErr.code === "ERR_NETWORK") {
          setError(
            "Error de conexión."
          );
        } else {
          setError(`Error al obtener alumnos: ${apiErr.message}`);
        }
      } else {
        setError("Ocurrió un error inesperado al conectar con el servidor.");
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const limpiar = useCallback(() => {
    setAlumnosData(null);
    setError(null);
  }, []);

  return {
    alumnosData,
    isLoading,
    error,
    cargarAlumnos,
    limpiar,
  };
};
