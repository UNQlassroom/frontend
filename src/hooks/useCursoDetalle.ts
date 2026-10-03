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
      } catch (err: unknown) {
        console.error("Error al cargar detalle del curso:", err);
        if (typeof err === "object" && err !== null && "message" in err) {
          const apiErr = err as { message: string; code?: string };
          if (apiErr.message === "Network Error" || apiErr.code === "ERR_NETWORK") {
            setError("Error de conexión con el servidor.");
          } else {
            setError(`No se pudo cargar el curso (${apiErr.message}).`);
          }
        } else {
          setError("Ocurrió un error al cargar el curso.");
        }
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
      .catch((err: unknown) => {
        if (isMounted) {
          console.error("Error al cargar detalle del curso:", err);
          if (typeof err === "object" && err !== null && "message" in err) {
            const apiErr = err as { message: string; code?: string };
            if (apiErr.message === "Network Error" || apiErr.code === "ERR_NETWORK") {
              setError("Error de conexión con el servidor.");
            } else {
              setError(`No se pudo cargar el curso (${apiErr.message}).`);
            }
          } else {
            setError("Ocurrió un error al cargar el curso.");
          }
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
