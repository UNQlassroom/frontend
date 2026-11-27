import { useState, useCallback, useRef, useEffect } from "react";
import { obtenerDocentes } from "@/services";
import type { CursoDocentesResponseDTO, DocenteResponseDTO } from "@/types";
import { resolveApiError } from "@/utils";
import { useSseListener } from "./useSseListener";

export const useDocentes = (initialDocentes: DocenteResponseDTO[] = []) => {
  const [docentes, setDocentes] = useState<DocenteResponseDTO[]>(initialDocentes);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const cursoIdRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      cursoIdRef.current = null;
    };
  }, []);

  const cargarDocentes = useCallback(
    async (cursoId: number): Promise<CursoDocentesResponseDTO | null> => {
      cursoIdRef.current = cursoId;
      setIsLoading(true);
      setError(null);
      try {
        const response = await obtenerDocentes(cursoId);
        setDocentes(response.data.docentes);
        return response.data;
      } catch (err: unknown) {
        const resolved = resolveApiError(err);
        setError(
          resolved?.message || "No se pudo cargar el equipo docente del curso."
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const limpiar = useCallback(() => {
    cursoIdRef.current = null;
    setError(null);
  }, []);

  // Refresco silencioso cuando un docente acepta la invitación en GitHub (MIEMBRO_ACTIVADO)
  useSseListener("MIEMBRO_ACTIVADO", (event) => {
    const activeCursoId = cursoIdRef.current;
    if (!activeCursoId || (event.cursoId !== null && event.cursoId !== activeCursoId)) {
      return;
    }
    obtenerDocentes(activeCursoId, { skipErrorToast: true })
      .then((res) => {
        if (cursoIdRef.current === activeCursoId) {
          setDocentes(res.data.docentes);
        }
      })
      .catch(() => {
        // Ignorar errores en refresco silencioso por SSE
      });
  });

  return {
    docentes,
    setDocentes,
    isLoading,
    error,
    cargarDocentes,
    limpiar,
  };
};
