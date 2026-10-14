import { useState, useCallback } from "react";
import { obtenerAlumnos } from "@/services";
import type { CursoAlumnosResponseDTO } from "@/types";

export const useAlumnos = () => {
  const [alumnosData, setAlumnosData] = useState<CursoAlumnosResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRecargando, setIsRecargando] = useState<boolean>(false);
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

  const recargarAlumnos = useCallback(async (cursoId: number): Promise<CursoAlumnosResponseDTO | null> => {
    setIsRecargando(true);
    setError(null);
    try {
      // Garantizamos un tiempo mínimo de 600ms para que la animación de recarga sea perceptible
      const [response] = await Promise.all([
        obtenerAlumnos(cursoId),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]);
      setAlumnosData(response.data);
      return response.data;
    } catch {
      setError("No se pudo recargar el listado de alumnos.");
      return null;
    } finally {
      setIsRecargando(false);
    }
  }, []);

  const limpiar = useCallback(() => {
    setAlumnosData(null);
    setError(null);
  }, []);

  return {
    alumnosData,
    isLoading,
    isRecargando,
    error,
    cargarAlumnos,
    recargarAlumnos,
    limpiar,
  };
};
