import { Link } from "react-router-dom";
import type { CursoResponseDTO } from "@/types";
import { useAsignacionesAlumno } from "@/hooks";
import { AsignacionesAlumnoList } from "./AsignacionesAlumnoList";
import { getGitHubRepoUrl } from "@/lib";
import githubIcon from "@/assets/github_favicon.svg";

interface CursoDetalleAlumnoProps {
  curso: CursoResponseDTO;
  onRetry?: () => void;
}

export function CursoDetalleAlumno({ curso }: CursoDetalleAlumnoProps) {
  const {
    asignaciones,
    isLoading,
    error,
    estadisticas,
    cargarAsignaciones,
    handleToggleEstadoVacio,
  } = useAsignacionesAlumno(curso.id);

  const cursoRepoUrl = curso.githubRepoName
    ? getGitHubRepoUrl(curso.githubRepoName)
    : null;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 flex-1 w-full space-y-8 animate-rise">
      {/* Navegación de retorno (Breadcrumbs) */}
      <div>
        <Link
          to="/home"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          <span>Volver a Cursos</span>
        </Link>
      </div>

      {/* Encabezado Principal del Curso - Enfocado en Alumno */}
      <section className="bg-panel rounded-2xl border border-line p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Espacio del Alumno
              </span>
              <span className="text-muted-foreground/40">•</span>
              <span className="rounded-md border border-line bg-panel2 px-2 py-0.5 font-mono text-[11px] font-medium text-foreground">
                Año {curso.anio}
              </span>
            </div>

            <h1 className="font-suez text-3xl sm:text-4xl tracking-tight text-foreground">
              {curso.materia}
            </h1>

            {/* Metadatos Académicos: Comisión y Semestre */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel2 px-3 py-1 font-mono text-xs font-semibold text-foreground">
                <span className="text-muted-foreground font-normal">Comisión:</span>
                <span>{curso.comision}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel2 px-3 py-1 font-mono text-xs font-semibold text-foreground">
                <span className="text-muted-foreground font-normal">Semestre:</span>
                <span>{curso.semestre}° Semestre</span>
              </span>

              {curso.descripcion && (
                <p className="font-mono text-xs text-muted-foreground mt-1 block w-full">
                  {curso.descripcion}
                </p>
              )}
            </div>
          </div>

          {/* Enlace al Repositorio de la Cátedra / Curso */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
            {curso.githubRepoName ? (
              <a
                href={cursoRepoUrl ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel2 px-3.5 py-2 font-mono text-xs font-semibold text-foreground hover:bg-line/40 transition-colors shadow-xs"
                title={`Ver repositorio de la cátedra: ${curso.githubRepoName}`}
              >
                <img src={githubIcon} alt="GitHub" className="w-4 h-4 opacity-80" />
                <span className="max-w-[200px] truncate">{curso.githubRepoName}</span>
                <span className="text-muted-foreground text-[10px]">↗</span>
              </a>
            ) : (
              <span className="rounded-lg border border-line bg-panel2 px-3 py-1.5 font-mono text-xs text-muted-foreground">
                Sin repo de cátedra
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Panel de Perfil y Progreso del Estudiante */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Mi Progreso en la Materia
          </h2>
          <span className="font-mono text-xs text-muted-foreground">
            {estadisticas.porcentajeCompletado}% completado
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Tarjeta 1: Total asignaciones */}
          <div className="rounded-xl border border-line bg-panel p-4 shadow-2xs">
            <span className="font-mono text-[11px] text-muted-foreground">
              Total de TPs
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-suez text-2xl font-bold text-foreground">
                {estadisticas.totalAsignaciones}
              </span>
              <span className="font-mono text-xs text-muted-foreground">asignaciones</span>
            </div>
          </div>

          {/* Tarjeta 2: Entregas realizadas */}
          <div className="rounded-xl border border-line bg-panel p-4 shadow-2xs">
            <span className="font-mono text-[11px] text-sky-600 font-medium">
              Entregados
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-suez text-2xl font-bold text-sky-600">
                {estadisticas.entregadas}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                de {estadisticas.totalAsignaciones}
              </span>
            </div>
          </div>

          {/* Tarjeta 3: Pendientes */}
          <div className="rounded-xl border border-line bg-panel p-4 shadow-2xs">
            <span className="font-mono text-[11px] text-amber-600 font-medium">
              Pendientes
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-suez text-2xl font-bold text-amber-600">
                {estadisticas.pendientes}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                por entregar
              </span>
            </div>
          </div>

          {/* Tarjeta 4: Calificación promedio */}
          <div className="rounded-xl border border-line bg-panel p-4 shadow-2xs">
            <span className="font-mono text-[11px] text-emerald-600 font-medium">
              Promedio Obtenido
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-suez text-2xl font-bold text-emerald-600">
                {estadisticas.promedioCalificaciones !== null
                  ? estadisticas.promedioCalificaciones
                  : "—"}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {estadisticas.corregidas > 0
                  ? `(${estadisticas.corregidas} evaluado${estadisticas.corregidas > 1 ? "s" : ""})`
                  : "sin notas aún"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Principal de Asignaciones y Entregas */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
            Trabajos Prácticos y Asignaciones
          </h2>
          <p className="font-mono text-xs text-muted-foreground mt-0.5">
            Consultá las consignas, fechas límites, estado de tus entregas y el feedback en GitHub Issues.
          </p>
        </div>

        <AsignacionesAlumnoList
          asignaciones={asignaciones}
          isLoading={isLoading}
          error={error}
          onRetry={cargarAsignaciones}
          onToggleDemoEmptyState={handleToggleEstadoVacio}
        />
      </section>
    </main>
  );
}
