import { useState, useCallback } from "react";
import { obtenerAlumnos, sincronizarAlumnos as sincronizarAlumnosService } from "@/services";
import type { AlumnosDeUnCursoResponseDTO } from "@/types";

export const useAlumnos = () => {
  const [alumnosData, setAlumnosData] = useState<AlumnosDeUnCursoResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cargarAlumnos = useCallback(async (cursoId: number): Promise<AlumnosDeUnCursoResponseDTO | null> => {
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
          setError("Error de conexión.");
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

  const sincronizarAlumnos = useCallback(async (cursoId: number): Promise<AlumnosDeUnCursoResponseDTO | null> => {
    setIsSyncing(true);
    setError(null);
    try {
      const response = await sincronizarAlumnosService(cursoId);
      setAlumnosData(response.data);
      return response.data;
    } catch (err: unknown) {
      console.error("Error al sincronizar alumnos con GitHub:", err);
      if (typeof err === "object" && err !== null && "message" in err) {
        const apiErr = err as { message: string; code?: string };
        if (apiErr.message === "Network Error" || apiErr.code === "ERR_NETWORK") {
          setError("Error de conexión al sincronizar con GitHub.");
        } else {
          setError(`Error al sincronizar: ${apiErr.message}`);
        }
      } else {
        setError("Ocurrió un error inesperado al sincronizar con GitHub.");
      }
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const limpiar = useCallback(() => {
    setAlumnosData(null);
    setError(null);
  }, []);

  return {
    alumnosData,
    isLoading,
    isSyncing,
    error,
    cargarAlumnos,
    sincronizarAlumnos,
    limpiar,
  };
};
