import { useState, useCallback, useRef } from "react";
import { obtenerAlumnos } from "@/services";
import type { CursoAlumnosResponseDTO } from "@/types";
import { useSseListener } from "./useSseListener";

export const useAlumnos = () => {
  const [alumnosData, setAlumnosData] = useState<CursoAlumnosResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRecargando, setIsRecargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const cursoIdRef = useRef<number | null>(null);

  const cargarAlumnos = useCallback(async (cursoId: number): Promise<CursoAlumnosResponseDTO | null> => {
    cursoIdRef.current = cursoId;
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
    cursoIdRef.current = cursoId;
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
    cursoIdRef.current = null;
    setAlumnosData(null);
    setError(null);
  }, []);

  // Refresco silencioso cuando un alumno acepta la invitación en GitHub (MIEMBRO_ACTIVADO)
  useSseListener("MIEMBRO_ACTIVADO", (event) => {
    const activeCursoId = cursoIdRef.current;
    if (!activeCursoId || (event.cursoId !== null && event.cursoId !== activeCursoId)) {
      return;
    }
    obtenerAlumnos(activeCursoId)
      .then((res) => {
        if (cursoIdRef.current === activeCursoId) {
          setAlumnosData(res.data);
        }
      })
      .catch(() => {
        // Ignorar errores en refresco silencioso por SSE
      });
  });

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
