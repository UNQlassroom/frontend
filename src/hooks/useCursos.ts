import { useState } from "react";
import { crearCurso } from "@/services";
import type {
  CursoResponseDTO,
  CreateCourseFormData,
} from "@/types";

export const useCursos = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successCurso, setSuccessCurso] = useState<CursoResponseDTO | null>(null);

  /**
   * Parsea los datos del formulario y le pega a POST /cursos/crear
   */
  const crearNuevoCurso = async (formData: CreateCourseFormData): Promise<CursoResponseDTO | null> => {
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
      setSuccessCurso(nuevoCurso);
      return nuevoCurso;
    } catch (err: unknown) {
      console.error("Error al crear curso:", err);
      if (typeof err === "object" && err !== null && "message" in err) {
        const apiErr = err as { message: string; code?: string };
        if (apiErr.message === "Network Error" || apiErr.code === "ERR_NETWORK") {
          setError(
            "Error de conexión o CORS. Verifica que el backend esté en localhost:8080 con CORS habilitado."
          );
        } else {
          setError(`Error al crear curso: ${apiErr.message}`);
        }
      } else {
        setError("Ocurrió un error inesperado al conectar con el servidor.");
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const limpiarEstado = () => {
    setError(null);
    setSuccessCurso(null);
  };

  return {
    isLoading,
    error,
    successCurso,
    crearNuevoCurso,
    limpiarEstado,
  };
};
