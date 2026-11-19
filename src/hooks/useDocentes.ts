import { useState, useCallback } from "react";
import { obtenerDocentes } from "@/services";
import type { CursoDocentesResponseDTO, DocenteResponseDTO } from "@/types";
import { resolveApiError } from "@/utils";

export const useDocentes = (initialDocentes: DocenteResponseDTO[] = []) => {
  const [docentes, setDocentes] = useState<DocenteResponseDTO[]>(initialDocentes);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cargarDocentes = useCallback(
    async (cursoId: number): Promise<CursoDocentesResponseDTO | null> => {
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
    setError(null);
  }, []);

  return {
    docentes,
    setDocentes,
    isLoading,
    error,
    cargarDocentes,
    limpiar,
  };
};
