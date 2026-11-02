import { useState, useEffect, useCallback } from "react";
import { obtenerCursoPorId } from "@/services";
import type { CursoResponseDTO } from "@/types";

export const useCursoDetalle = (cursoId: number | undefined) => {
  const [curso, setCurso] = useState<CursoResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cargarCurso = useCallback(async () => {
    if (!cursoId || isNaN(cursoId)) {
      setError("Identificador de curso inválido.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await obtenerCursoPorId(cursoId);
      setCurso(response.data);
    } catch {
      setError("El curso solicitado no existe o no se encuentra disponible.");
    } finally {
      setIsLoading(false);
    }
  }, [cursoId]);

  useEffect(() => {
    if (!cursoId || isNaN(cursoId)) {
      return;
    }
    let ignore = false;
    obtenerCursoPorId(cursoId)
      .then((res) => {
        if (!ignore) setCurso(res.data);
      })
      .catch(() => {
        if (!ignore) setError("El curso solicitado no existe o no se encuentra disponible.");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [cursoId]);

  return {
    curso,
    isLoading,
    error,
    cargarCurso,
    setCurso,
  };
};
