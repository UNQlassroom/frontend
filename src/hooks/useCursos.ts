import { useState, useEffect, useCallback } from "react";
import { crearCurso, obtenerCursos, archivarCurso } from "@/services";
import type {
  CursoResponseDTO,
  CrearCursoFormData,
} from "@/types";
import { useSseListener } from "./useSseListener";

export const useCursos = (archivados: boolean = false) => {
  const [cursos, setCursos] = useState<CursoResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successCurso, setSuccessCurso] = useState<CursoResponseDTO | null>(null);

  const cargarCursos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await obtenerCursos(archivados ? true : undefined);
      setCursos(response.data);
    } catch {
      setError(
        archivados
          ? "No se pudieron cargar los cursos archivados del servidor."
          : "No se pudieron cargar los cursos del servidor."
      );
    } finally {
      setIsLoading(false);
    }
  }, [archivados]);

  useEffect(() => {
    let ignore = false;
    obtenerCursos(archivados ? true : undefined)
      .then((response) => {
        if (!ignore) setCursos(response.data);
      })
      .catch(() => {
        if (!ignore) {
          setError(
            archivados
              ? "No se pudieron cargar los cursos archivados del servidor."
              : "No se pudieron cargar los cursos del servidor."
          );
        }
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [archivados]);

  // Refresco silencioso de cursos ante activación de membresía o actualización de asignación
  useSseListener(["MIEMBRO_ACTIVADO", "ASIGNACION_ACTUALIZADA"], () => {
    obtenerCursos(archivados ? true : undefined)
      .then((response) => {
        setCursos(response.data);
      })
      .catch(() => {
        // Ignorar errores en refresco silencioso por SSE
      });
  });

  const crearNuevoCurso = async (formData: CrearCursoFormData): Promise<CursoResponseDTO | null> => {
    setIsLoading(true);
    setError(null);
    setSuccessCurso(null);

    try {
      const comisionNum = parseInt(formData.comision.replace(/\D/g, ""), 10) || 1;
      const semestreNum = parseInt(formData.semestre.replace(/\D/g, ""), 10) || 1;
      const anio = new Date().getFullYear();

      const response = await crearCurso({
        materia: formData.materia.trim(),
        anio,
        semestre: semestreNum,
        comision: comisionNum,
      });

      const nuevoCurso = response.data;
      
      setCursos((prev) => [nuevoCurso, ...prev]);
      setSuccessCurso(nuevoCurso);
      return nuevoCurso;
    } catch {
      // El interceptor global de Axios notifica el error mediante Toast
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const archivarCursoExistente = async (cursoId: number): Promise<CursoResponseDTO | null> => {
    try {
      const response = await archivarCurso(cursoId);
      setCursos((prev) => prev.filter((c) => c.id !== cursoId));
      return response.data;
    } catch {
      // El interceptor global de Axios notifica el error mediante Toast
      return null;
    }
  };

  const removerCursoDeLista = useCallback((cursoId: number) => {
    setCursos((prev) => prev.filter((c) => c.id !== cursoId));
  }, []);

  const limpiarEstado = () => {
    setError(null);
    setSuccessCurso(null);
  };

  return {
    cursos,
    isLoading,
    error,
    successCurso,
    crearNuevoCurso,
    archivarCursoExistente,
    removerCursoDeLista,
    cargarCursos,
    limpiarEstado,
  };
};
