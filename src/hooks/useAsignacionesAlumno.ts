import { useState, useEffect, useMemo, useCallback } from "react";
import type { AsignacionAlumnoDTO, EstadoEntrega } from "@/types";
import { getGitHubRepoUrl, getGitHubIssuesUrl } from "@/lib";

export const MOCK_ASIGNACIONES_ALUMNO: AsignacionAlumnoDTO[] = [
  {
    id: "1",
    titulo: "TP1 - Modelado de Objetos y Clases",
    descripcion:
      "Implementar la jerarquía de clases y reglas de negocio del dominio asignado aplicando principios SOLID y buenas prácticas de POO.",
    fechaEntrega: "2026-09-10",
    fechaLimiteFormatted: "10 de Septiembre, 2026",
    estadoEntrega: "corregido",
    calificacion: 9,
    notaMaxima: 10,
    feedbackDocente:
      "Excelente diseño del modelo de dominio y cobertura de pruebas unitarias. Buenas abstracciones y desacoplamiento. Consultá el issue para ver el feedback detallado.",
    repoNombre: "unqlassroom-tp1-oop-alumno",
    repoUrl: getGitHubRepoUrl("unqlassroom-tp1-oop-alumno"),
    issuesUrl: getGitHubIssuesUrl("unqlassroom-tp1-oop-alumno"),
    issueFeedbackUrl: getGitHubIssuesUrl("unqlassroom-tp1-oop-alumno", 1),
    estadoCI: "success",
    fechaUltimaEntrega: "2026-09-09T21:40:00Z",
  },
  {
    id: "2",
    titulo: "TP2 - Persistencia y Mapeo Objeto-Relacional",
    descripcion:
      "Mapear entidades relacionales y persistir el modelo en base de datos PostgreSQL utilizando JPA/Hibernate y repositorios Spring Data.",
    fechaEntrega: "2026-10-15",
    fechaLimiteFormatted: "15 de Octubre, 2026",
    estadoEntrega: "entregado",
    calificacion: null,
    notaMaxima: 10,
    feedbackDocente: null,
    repoNombre: "unqlassroom-tp2-persistence-alumno",
    repoUrl: getGitHubRepoUrl("unqlassroom-tp2-persistence-alumno"),
    issuesUrl: getGitHubIssuesUrl("unqlassroom-tp2-persistence-alumno"),
    issueFeedbackUrl: getGitHubIssuesUrl("unqlassroom-tp2-persistence-alumno", 1),
    estadoCI: "success",
    fechaUltimaEntrega: "2026-10-13T19:25:00Z",
  },
  {
    id: "3",
    titulo: "TP3 - Arquitectura Web y Servicios RESTful",
    descripcion:
      "Construir API REST con controladores, endpoints documentados en Swagger/OpenAPI, manejo de errores y validaciones.",
    fechaEntrega: "2026-11-20",
    fechaLimiteFormatted: "20 de Noviembre, 2026",
    estadoEntrega: "pendiente",
    calificacion: null,
    notaMaxima: 10,
    feedbackDocente: null,
    repoNombre: "unqlassroom-tp3-rest-alumno",
    repoUrl: getGitHubRepoUrl("unqlassroom-tp3-rest-alumno"),
    issuesUrl: getGitHubIssuesUrl("unqlassroom-tp3-rest-alumno"),
    issueFeedbackUrl: null,
    estadoCI: "sin_ci",
    fechaUltimaEntrega: null,
  },
];

export interface EstadisticasProgresoAlumno {
  totalAsignaciones: number;
  entregadas: number;
  pendientes: number;
  corregidas: number;
  promedioCalificaciones: number | null;
  porcentajeCompletado: number;
}

export function useAsignacionesAlumno(cursoId?: number) {
  const [asignaciones, setAsignaciones] = useState<AsignacionAlumnoDTO[]>(MOCK_ASIGNACIONES_ALUMNO);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cargarAsignaciones = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulación de latencia a la espera del endpoint real
      await new Promise((resolve) => setTimeout(resolve, 300));
      setAsignaciones(MOCK_ASIGNACIONES_ALUMNO);
    } catch {
      setError("No se pudieron cargar las asignaciones del alumno.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted && cursoId) {
        setAsignaciones(MOCK_ASIGNACIONES_ALUMNO);
      }
    }, 50);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [cursoId]);

  const handleToggleEstadoVacio = () => {
    if (asignaciones.length > 0) {
      setAsignaciones([]);
    } else {
      setAsignaciones(MOCK_ASIGNACIONES_ALUMNO);
    }
  };

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
    handleToggleEstadoVacio,
    filtrarPorEstado,
    setAsignaciones,
  };
}
