import { useState, useCallback } from "react";
import { obtenerAlumnos, sincronizarAlumnos as sincronizarAlumnosService } from "@/services";
import type { CursoAlumnosResponseDTO } from "@/types";

export const useAlumnos = () => {
  const [alumnosData, setAlumnosData] = useState<CursoAlumnosResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cargarAlumnos = useCallback(async (cursoId: number): Promise<CursoAlumnosResponseDTO | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await obtenerAlumnos(cursoId);
      setAlumnosData(response.data);
      return response.data;
    } catch {
      setError("No se pudo cargar el listado de alumnos.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sincronizarAlumnos = useCallback(async (cursoId: number): Promise<CursoAlumnosResponseDTO | null> => {
    setIsSyncing(true);
    try {
      const response = await sincronizarAlumnosService(cursoId);
      setAlumnosData(response.data);
      return response.data;
    } catch {
      // El interceptor global de Axios muestra el toast con el error correspondiente (ej: rate limit)
      setError("Error al sincronizar alumnos con GitHub");
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
