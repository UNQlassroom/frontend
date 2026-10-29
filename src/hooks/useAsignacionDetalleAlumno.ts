import { useState, useEffect, useCallback } from "react";
import type {
  AsignacionAlumnoDTO,
  CorreccionGrupoResponseDTO,
  DiagnosticoCIResponseDTO,
  MetricasCIResponseDTO,
  ReporteLinterResponseDTO,
} from "@/types";
import type { SubSeccionTecnica } from "@/components/asignacion/tabs/EstadoTecnicoTab";
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

export type SeccionDetalle = "general" | "tecnico" | "correcciones";

export function useAsignacionDetalleAlumno(
  cursoId?: number,
  asignacionId?: number,
  seccionActiva: SeccionDetalle = "general",
  subSeccionTecnica: SubSeccionTecnica = "ci"
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

  // Estados técnicos cargados bajo demanda (Lazy Loading)
  const [diagnosticoCI, setDiagnosticoCI] =
    useState<DiagnosticoCIResponseDTO | null>(null);
  const [metricasCI, setMetricasCI] =
    useState<MetricasCIResponseDTO | null>(null);
  const [reporteLinter, setReporteLinter] =
    useState<ReporteLinterResponseDTO | null>(null);

  const [isLoadingCI, setIsLoadingCI] = useState<boolean>(false);
  const [isLoadingMetricas, setIsLoadingMetricas] = useState<boolean>(false);
  const [isLoadingLinter, setIsLoadingLinter] = useState<boolean>(false);

  // El indicador general de carga técnica refleja el estado de la sub-sección que se está visualizando
  const isLoadingTecnico =
    (subSeccionTecnica === "ci" && isLoadingCI) ||
    (subSeccionTecnica === "cobertura" && isLoadingMetricas) ||
    (subSeccionTecnica === "git" && isLoadingLinter);

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

  // Carga Lazy de Diagnóstico de CI + Unificación de estado
  const cargarDiagnostico = useCallback(
    async (force = false) => {
      if (!cursoId || !asignacionId) return;
      if (!force && diagnosticoCI !== null) return;
      setIsLoadingCI(true);
      try {
        const res = await obtenerDiagnosticoCI(
          cursoId,
          asignacionId,
          asignacion?.grupoId
        );
        setDiagnosticoCI(res.data);

        // Solución a la dualidad de estado: sincronizar el diagnóstico en la entidad de asignación
        setAsignacion((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            estadoCI: res.data.estadoCI ?? prev.estadoCI,
            ciEtapaFallida: res.data.etapaFallida ?? prev.ciEtapaFallida,
            ciLogError: res.data.logError ?? prev.ciLogError,
            ciRunUrl: res.data.runUrl ?? prev.ciRunUrl,
          };
        });
      } catch {
        // Fallback defensivo
      } finally {
        setIsLoadingCI(false);
      }
    },
    [cursoId, asignacionId, asignacion?.grupoId, diagnosticoCI]
  );

  // Carga Lazy de Métricas (JaCoCo / JUnit)
  const cargarMetricas = useCallback(
    async (force = false) => {
      if (!cursoId || !asignacionId) return;
      if (!force && metricasCI !== null) return;
      setIsLoadingMetricas(true);
      try {
        const res = await obtenerMetricasCI(
          cursoId,
          asignacionId,
          asignacion?.grupoId
        );
        setMetricasCI(res.data);
      } catch {
        // Fallback defensivo
      } finally {
        setIsLoadingMetricas(false);
      }
    },
    [cursoId, asignacionId, asignacion?.grupoId, metricasCI]
  );

  // Carga Lazy de Linter
  const cargarLinter = useCallback(
    async (force = false) => {
      if (!cursoId || !asignacionId) return;
      if (!force && reporteLinter !== null) return;
      setIsLoadingLinter(true);
      try {
        const res = await obtenerReporteLinter(
          cursoId,
          asignacionId,
          asignacion?.grupoId
        );
        setReporteLinter(res.data);
      } catch {
        // Fallback defensivo
      } finally {
        setIsLoadingLinter(false);
      }
    },
    [cursoId, asignacionId, asignacion?.grupoId, reporteLinter]
  );

  // Lazy Loading reactivo: solo consulta lo que el usuario está viendo actualmente
  useEffect(() => {
    if (seccionActiva !== "tecnico" || !asignacion) return;

    if (subSeccionTecnica === "ci") {
      void cargarDiagnostico();
    } else if (subSeccionTecnica === "cobertura") {
      void cargarMetricas();
    } else if (subSeccionTecnica === "git") {
      void cargarLinter();
    }
  }, [
    seccionActiva,
    subSeccionTecnica,
    asignacion,
    cargarDiagnostico,
    cargarMetricas,
    cargarLinter,
  ]);

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
        const tareas: Promise<unknown>[] = [
          obtenerAsignacionPorId(cursoId, asignacionId),
          cargarCorrecciones(),
        ];

        // Al recargar, si está en técnico, solo forzar la subsección activa
        if (seccionActiva === "tecnico") {
          if (subSeccionTecnica === "ci") tareas.push(cargarDiagnostico(true));
          else if (subSeccionTecnica === "cobertura") tareas.push(cargarMetricas(true));
          else if (subSeccionTecnica === "git") tareas.push(cargarLinter(true));
        }

        if (esRecarga) {
          tareas.push(new Promise((resolve) => setTimeout(resolve, 600)));
        }

        const [asigResponse] = (await Promise.all(tareas)) as [
          Awaited<ReturnType<typeof obtenerAsignacionPorId>>,
          ...unknown[]
        ];

        const mapeadas = mapAsignacionesDTO([asigResponse.data], username);
        setAsignacion(() => {
          const nueva = mapeadas[0] ?? null;
          if (!nueva) return null;
          // Conservar diagnósticos unificados si ya se obtuvieron
          return {
            ...nueva,
            estadoCI: diagnosticoCI?.estadoCI ?? nueva.estadoCI,
            ciEtapaFallida: diagnosticoCI?.etapaFallida ?? nueva.ciEtapaFallida,
            ciLogError: diagnosticoCI?.logError ?? nueva.ciLogError,
            ciRunUrl: diagnosticoCI?.runUrl ?? nueva.ciRunUrl,
          };
        });
      } catch {
        setError("No se pudo cargar el detalle de la asignación.");
      } finally {
        setIsLoading(false);
        setIsRecargando(false);
      }
    },
    [
      cursoId,
      asignacionId,
      username,
      seccionActiva,
      subSeccionTecnica,
      cargarCorrecciones,
      cargarDiagnostico,
      cargarMetricas,
      cargarLinter,
      diagnosticoCI,
    ]
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

    // Cargar detalle de la asignación (sin llamadas técnicas pesadas)
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
