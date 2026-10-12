import { useState, useEffect, useCallback } from "react";
import { obtenerCursoPorId } from "@/services";
import type { CursoResponseDTO } from "@/types";

export const useCursoDetalle = (cursoId: number | undefined) => {
  const [curso, setCurso] = useState<CursoResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurso = useCallback(
    async (id: number) => {
      try {
        const response = await obtenerCursoPorId(id);
        setCurso(response.data);
      } catch {
        setError("El curso solicitado no existe o no se encuentra disponible.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const cargarCurso = useCallback(async () => {
    if (!cursoId || isNaN(cursoId)) {
      setError("Identificador de curso inválido.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    await fetchCurso(cursoId);
  }, [cursoId, fetchCurso]);

  useEffect(() => {
    if (!cursoId || isNaN(cursoId)) {
      return;
    }
    let isMounted = true;

    obtenerCursoPorId(cursoId)
      .then((response) => {
        if (isMounted) {
          setCurso(response.data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("El curso solicitado no existe o no se encuentra disponible.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
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
