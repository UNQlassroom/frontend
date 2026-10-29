import { useState, useEffect, useMemo, useCallback } from "react";
import type {
  AsignacionAlumnoDTO,
  AsignacionResponseDTO,
  EstadoEntrega,
} from "@/types";
import {
  obtenerAsignaciones,
  entregarAsignacion,
} from "@/services";
import { useAuth } from "./useAuth";

export interface EstadisticasProgresoAlumno {
  totalAsignaciones: number;
  entregadas: number;
  pendientes: number;
  corregidas: number;
  promedioCalificaciones: number | null;
  porcentajeCompletado: number;
}

export function mapAsignacionesDTO(
  asignaciones: AsignacionResponseDTO[],
  currentUsername?: string
): AsignacionAlumnoDTO[] {
  return asignaciones.map((asig) => {
    // Buscar el grupo donde participa el alumno logueado, o fallback al primer grupo
    const miGrupo =
      asig.grupos?.find((g) =>
        currentUsername
          ? g.integrantes?.some((u) => u.username === currentUsername)
          : false
      ) ?? asig.grupos?.[0];
    const repo = miGrupo?.repositorio;

    // Directo desde el grupo: se considera entregada si el booleano entregada es true o si tiene fechaEntregada
    const estaEntregada = Boolean(miGrupo?.entregada || miGrupo?.fechaEntregada);
    const fechaEntregada = miGrupo?.fechaEntregada ?? null;
    const calificacion = miGrupo?.calificacion ?? null;
    const tieneCalificacion = typeof calificacion === "number";

    let estadoEntrega: EstadoEntrega = "pendiente";
    if (tieneCalificacion) {
      estadoEntrega = "corregido";
    } else if (estaEntregada) {
      estadoEntrega = "entregado";
    }

    return {
      id: asig.id,
      titulo: asig.titulo,
      descripcion: asig.descripcion,
      tipo: asig.tipo,
      estado: asig.estado,
      templateRepoName: asig.templateRepoName,
      fechaLimite: asig.fechaLimite,
      fechaLimiteFormatted: asig.fechaLimite
        ? new Date(asig.fechaLimite).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : undefined,
      estadoEntrega,
      calificacion,
      observaciones: miGrupo?.observaciones ?? null,
      fechaCalificacion: miGrupo?.fechaCalificacion ?? null,
      grupoId: miGrupo?.id,
      grupoNombre: miGrupo?.nombre,
      integrantes: miGrupo?.integrantes?.map((u) => u.username),
      integrantesDetalle: miGrupo?.integrantes ?? [],
      repoNombre: repo?.nombre,
      repoUrl: repo?.htmlUrl,
      releaseUrl: miGrupo?.releaseUrl ?? null,
      estadoCI: repo?.estadoCI ?? "sin_ci",
      ciEtapaFallida: repo?.ciEtapaFallida ?? null,
      ciLogError: repo?.ciLogError ?? null,
      ciRunUrl: repo?.ciRunUrl ?? null,
      advertenciasGit: miGrupo?.advertenciasGit ?? [],
      ultimoCommit: repo?.ultimoCommit,
      fechaUltimoCommit: repo?.fechaUltimoCommit,
      entregada: estaEntregada,
      fechaEntregada: fechaEntregada,
      fechaEntregadaFormatted: fechaEntregada
        ? new Date(fechaEntregada).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : undefined,
    };
  });
}

export function useAsignacionesAlumno(cursoId?: number) {
  const { user } = useAuth();
  const username = user?.username;
  const [asignaciones, setAsignaciones] = useState<AsignacionAlumnoDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(cursoId));
  const [isRecargando, setIsRecargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [entregandoId, setEntregandoId] = useState<number | string | null>(null);

  const cargarAsignaciones = useCallback(async () => {
    if (!cursoId) return;
    setIsRecargando(true);
    setError(null);
    try {
      // Garantizamos un tiempo mínimo de 600ms para que la animación de recarga sea perceptible
      const [response] = await Promise.all([
        obtenerAsignaciones(cursoId),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]);
      const mapeadas = mapAsignacionesDTO(response.data, username);
      setAsignaciones(mapeadas);
    } catch {
      // Error manejado por interceptor
      setError("No se pudieron cargar las asignaciones del curso.");
    } finally {
      setIsRecargando(false);
    }
  }, [cursoId, username]);

  useEffect(() => {
    if (!cursoId) return;
    let ignore = false;

    obtenerAsignaciones(cursoId)
      .then((response) => {
        if (!ignore) {
          const mapeadas = mapAsignacionesDTO(response.data, username);
          setAsignaciones(mapeadas);
        }
      })
      .catch(() => {
        if (!ignore) {
          // Error manejado por interceptor
          setError("No se pudieron cargar las asignaciones del curso.");
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [cursoId, username]);

  const entregar = useCallback(
    async (asignacionId: number): Promise<boolean> => {
      if (!cursoId) return false;
      setEntregandoId(asignacionId);
      try {
        const asigActual = asignaciones.find((a) => a.id === asignacionId);
        const grupoId = asigActual?.grupoId;
        const response = await entregarAsignacion(cursoId, asignacionId, grupoId);
        const asignacionActualizada = response.data;
        setAsignaciones((prev) => {
          const mapeadas = mapAsignacionesDTO([asignacionActualizada], username);
          const nueva = mapeadas[0];
          if (!nueva) return prev;
          return prev.map((a) => (a.id === asignacionId ? { ...a, ...nueva } : a));
        });
        return true;
      } finally {
        setEntregandoId(null);
      }
    },
    [cursoId, username, asignaciones]
  );

  const estadisticas = useMemo<EstadisticasProgresoAlumno>(() => {
    const total = asignaciones.length;
    if (total === 0) {
      return {
        totalAsignaciones: 0,
        entregadas: 0,
        pendientes: 0,
        corregidas: 0,
        promedioCalificaciones: null,
        porcentajeCompletado: 0,
      };
    }

    const corregidasList = asignaciones.filter((a) => a.estadoEntrega === "corregido");
    const entregadasList = asignaciones.filter(
      (a) => a.estadoEntrega === "entregado" || a.estadoEntrega === "corregido"
    );
    const pendientesList = asignaciones.filter((a) => a.estadoEntrega === "pendiente");

    const notasConValor = corregidasList
      .map((a) => a.calificacion)
      .filter((n): n is number => typeof n === "number" && !isNaN(n));

    const promedio =
      notasConValor.length > 0
        ? notasConValor.reduce((acc, curr) => acc + curr, 0) / notasConValor.length
        : null;

    const porcentajeCompletado = Math.round((entregadasList.length / total) * 100);

    return {
      totalAsignaciones: total,
      entregadas: entregadasList.length,
      pendientes: pendientesList.length,
      corregidas: corregidasList.length,
      promedioCalificaciones: promedio !== null ? parseFloat(promedio.toFixed(1)) : null,
      porcentajeCompletado,
    };
  }, [asignaciones]);

  const filtrarPorEstado = useCallback(
    (estado?: EstadoEntrega | "todas") => {
      if (!estado || estado === "todas") return asignaciones;
      return asignaciones.filter((a) => a.estadoEntrega === estado);
    },
    [asignaciones]
  );

  return {
    asignaciones,
    isLoading,
    isRecargando,
    error,
    estadisticas,
    entregandoId,
    entregar,
    filtrarPorEstado,
    cargarAsignaciones,
    refetch: cargarAsignaciones,
  };
}
