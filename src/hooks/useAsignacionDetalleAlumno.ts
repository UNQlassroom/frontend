import { useState, useEffect, useCallback } from "react";
import type {
  AsignacionAlumnoDTO,
  CorreccionGrupoResponseDTO,
  DiagnosticoCIResponseDTO,
  MetricasCIResponseDTO,
  ReporteLinterResponseDTO,
} from "@/types";
import {
  obtenerAsignacionPorId,
  obtenerCorrecciones,
  obtenerDiagnosticoCI,
  obtenerMetricasCI,
  obtenerReporteLinter,
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

  // Estados para Estado Técnico (CI, Cobertura/Tests y Linter)
  const [diagnosticoCI, setDiagnosticoCI] =
    useState<DiagnosticoCIResponseDTO | null>(null);
  const [metricasCI, setMetricasCI] =
    useState<MetricasCIResponseDTO | null>(null);
  const [reporteLinter, setReporteLinter] =
    useState<ReporteLinterResponseDTO | null>(null);
  const [isLoadingTecnico, setIsLoadingTecnico] = useState<boolean>(
    Boolean(cursoId && asignacionId)
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

  const cargarDatosTecnicos = useCallback(async () => {
    if (!cursoId || !asignacionId) return;
    setIsLoadingTecnico(true);
    try {
      const [diagRes, metricasRes, linterRes] = await Promise.allSettled([
        obtenerDiagnosticoCI(cursoId, asignacionId),
        obtenerMetricasCI(cursoId, asignacionId),
        obtenerReporteLinter(cursoId, asignacionId),
      ]);

      if (diagRes.status === "fulfilled") {
        setDiagnosticoCI(diagRes.value.data);
      }
      if (metricasRes.status === "fulfilled") {
        setMetricasCI(metricasRes.value.data);
      }
      if (linterRes.status === "fulfilled") {
        setReporteLinter(linterRes.value.data);
      }
    } finally {
      setIsLoadingTecnico(false);
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
            cargarDatosTecnicos(),
            new Promise((resolve) => setTimeout(resolve, 600)),
          ]);
          const mapeadas = mapAsignacionesDTO([response.data], username);
          setAsignacion(mapeadas[0] ?? null);
        } else {
          void cargarCorrecciones();
          void cargarDatosTecnicos();
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
    [cursoId, asignacionId, username, cargarCorrecciones, cargarDatosTecnicos]
  );

  useEffect(() => {
    if (!cursoId || !asignacionId) return;
    let isMounted = true;

    // Cargar correcciones iniciales
    obtenerCorrecciones(cursoId, asignacionId)
      .then((res) => {
        if (isMounted) {
          setCorreccionGrupo(res.data[0] || null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setErrorCorrecciones("No se pudieron obtener las correcciones en GitHub.");
        }
      });

    // Cargar datos técnicos iniciales (CI, Cobertura/Tests y Linter)
    Promise.allSettled([
      obtenerDiagnosticoCI(cursoId, asignacionId),
      obtenerMetricasCI(cursoId, asignacionId),
      obtenerReporteLinter(cursoId, asignacionId),
    ])
      .then(([diagRes, metricasRes, linterRes]) => {
        if (!isMounted) return;
        if (diagRes.status === "fulfilled") {
          setDiagnosticoCI(diagRes.value.data);
        }
        if (metricasRes.status === "fulfilled") {
          setMetricasCI(metricasRes.value.data);
        }
        if (linterRes.status === "fulfilled") {
          setReporteLinter(linterRes.value.data);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingTecnico(false);
        }
      });

    // Cargar detalle de la asignación
    obtenerAsignacionPorId(cursoId, asignacionId)
      .then((res) => {
        if (isMounted) {
          const mapeadas = mapAsignacionesDTO([res.data], username);
          setAsignacion(mapeadas[0] ?? null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("No se pudo cargar el detalle de la asignación.");
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
  }, [cursoId, asignacionId, username]);

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
    diagnosticoCI,
    metricasCI,
    reporteLinter,
    isLoadingTecnico,
    entregando,
    cargarDetalle,
    entregar,
  };
}
