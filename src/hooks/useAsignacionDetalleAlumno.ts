import { useState, useEffect, useCallback } from "react";
import type {
  AsignacionAlumnoDTO,
  CorreccionGrupoResponseDTO,
} from "@/types";
import {
  obtenerAsignacionPorId,
  obtenerCorrecciones,
  entregarAsignacion,
} from "@/services";
import { useAuth } from "./useAuth";
import { mapAsignacionesDTO } from "./useAsignacionesAlumno";

export function useAsignacionDetalleAlumno(
  cursoId?: number,
  asignacionId?: number
) {
  const { user } = useAuth();
  const username = user?.username;

  const [asignacion, setAsignacion] = useState<AsignacionAlumnoDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRecargando, setIsRecargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [correccionGrupo, setCorreccionGrupo] =
    useState<CorreccionGrupoResponseDTO | null>(null);
  const [isLoadingCorrecciones, setIsLoadingCorrecciones] =
    useState<boolean>(false);
  const [errorCorrecciones, setErrorCorrecciones] = useState<string | null>(
    null
  );

  const [entregando, setEntregando] = useState<boolean>(false);

  const cargarCorrecciones = useCallback(async () => {
    if (!cursoId || !asignacionId) return;
    setIsLoadingCorrecciones(true);
    setErrorCorrecciones(null);
    try {
      const res = await obtenerCorrecciones(cursoId, asignacionId);
      setCorreccionGrupo(res.data[0] || null);
    } catch {
      setErrorCorrecciones("No se pudieron obtener las correcciones en GitHub.");
    } finally {
      setIsLoadingCorrecciones(false);
    }
  }, [cursoId, asignacionId]);

  const cargarDetalle = useCallback(
    async (esRecarga = false) => {
      if (!cursoId || !asignacionId) return;
      if (esRecarga) {
        setIsRecargando(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        if (esRecarga) {
          const [response] = await Promise.all([
            obtenerAsignacionPorId(cursoId, asignacionId),
            cargarCorrecciones(),
            new Promise((resolve) => setTimeout(resolve, 600)),
          ]);
          const mapeadas = mapAsignacionesDTO([response.data], username);
          setAsignacion(mapeadas[0] ?? null);
        } else {
          void cargarCorrecciones();
          const response = await obtenerAsignacionPorId(cursoId, asignacionId);
          const mapeadas = mapAsignacionesDTO([response.data], username);
          setAsignacion(mapeadas[0] ?? null);
        }
      } catch {
        setError("No se pudo cargar el detalle de la asignación.");
      } finally {
        setIsLoading(false);
        setIsRecargando(false);
      }
    },
    [cursoId, asignacionId, username, cargarCorrecciones]
  );

  useEffect(() => {
    void cargarDetalle(false);
  }, [cargarDetalle]);

  const entregar = useCallback(async (): Promise<boolean> => {
    if (!cursoId || !asignacionId || !asignacion) return false;
    setEntregando(true);
    try {
      const response = await entregarAsignacion(
        cursoId,
        asignacionId,
        asignacion.grupoId
      );
      const mapeadas = mapAsignacionesDTO([response.data], username);
      if (mapeadas[0]) {
        setAsignacion(mapeadas[0]);
      }
      return true;
    } catch {
      return false;
    } finally {
      setEntregando(false);
    }
  }, [cursoId, asignacionId, asignacion, username]);

  return {
    asignacion,
    username,
    isLoading,
    isRecargando,
    error,
    correccionGrupo,
    isLoadingCorrecciones,
    errorCorrecciones,
    entregando,
    cargarDetalle,
    entregar,
  };
}
