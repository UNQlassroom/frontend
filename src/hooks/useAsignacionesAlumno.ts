import { useState, useEffect, useMemo, useCallback } from "react";
import type { AsignacionAlumnoDTO, AsignacionResponseDTO, EstadoEntrega } from "@/types";
import { obtenerAsignaciones, entregarAsignacion } from "@/services";
import { useAuth } from "./useAuth";

export interface EstadisticasProgresoAlumno {
  totalAsignaciones: number;
  entregadas: number;
  pendientes: number;
  corregidas: number;
  promedioCalificaciones: number | null;
  porcentajeCompletado: number;
}

function mapAsignacionesDTO(
  asignaciones: AsignacionResponseDTO[],
  currentUsername?: string
): AsignacionAlumnoDTO[] {
  return asignaciones.map((asig) => {
    // Buscar el grupo donde participa el alumno logueado, o fallback al primer grupo
    const miGrupo =
      asig.grupos?.find((g) =>
        currentUsername ? g.integrantes?.includes(currentUsername) : false
      ) ?? asig.grupos?.[0];
    const repo = miGrupo?.repositorio;

    const estaEntregada = Boolean(
      miGrupo?.entregada ?? asig.entregada ?? (repo?.ultimoCommit ? true : false)
    );
    const fechaEntrega = miGrupo?.fechaEntrega ?? asig.fechaEntrega ?? null;

    let estadoEntrega: EstadoEntrega = "pendiente";
    if (estaEntregada) {
      estadoEntrega = "entregado";
    }

    return {
      id: asig.id,
      titulo: asig.titulo,
      descripcion: asig.descripcion,
      tipo: asig.tipo,
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
      calificacion: null,
      grupoId: miGrupo?.id,
      grupoNombre: miGrupo?.nombre,
      integrantes: miGrupo?.integrantes,
      repoNombre: repo?.nombre,
      repoUrl: repo?.htmlUrl,
      estadoCI: repo?.estadoCI ?? "sin_ci",
      ultimoCommit: repo?.ultimoCommit,
      fechaUltimoCommit: repo?.fechaUltimoCommit,
      entregada: estaEntregada,
      fechaEntrega,
      fechaEntregaFormatted: fechaEntrega
        ? new Date(fechaEntrega).toLocaleDateString("es-AR", {
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
  const [error, setError] = useState<string | null>(null);
  const [entregandoId, setEntregandoId] = useState<number | string | null>(null);

  const cargarAsignaciones = useCallback(async () => {
    if (!cursoId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await obtenerAsignaciones(cursoId);
      setAsignaciones(mapAsignacionesDTO(response.data, username));
    } catch (err: unknown) {
      console.error("Error al cargar asignaciones del alumno:", err);
      setError("No se pudieron cargar las asignaciones del curso.");
    } finally {
      setIsLoading(false);
    }
  }, [cursoId, username]);

  useEffect(() => {
    if (!cursoId) return;
    let ignore = false;

    obtenerAsignaciones(cursoId)
      .then((response) => {
        if (!ignore) {
          setAsignaciones(mapAsignacionesDTO(response.data, username));
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          console.error("Error al cargar asignaciones del alumno:", err);
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
        const response = await entregarAsignacion(cursoId, asignacionId);
        const asignacionActualizada = response.data;
        setAsignaciones((prev) => {
          const mapeadas = mapAsignacionesDTO([asignacionActualizada], username);
          const nueva = mapeadas[0];
          if (!nueva) return prev;
          return prev.map((a) => (a.id === asignacionId ? { ...a, ...nueva } : a));
        });
        return true;
      } catch (err: unknown) {
        console.error("Error al entregar asignación:", err);
        throw err;
      } finally {
        setEntregandoId(null);
      }
    },
    [cursoId, username]
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
    error,
    estadisticas,
    cargarAsignaciones,
    filtrarPorEstado,
    setAsignaciones,
    entregar,
    entregandoId,
  };
}
