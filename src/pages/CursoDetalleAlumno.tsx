import { useParams, Link } from "react-router-dom";
import { useCursoDetalle, useAsignacionesAlumno } from "@/hooks";
import { AsignacionesAlumnoList } from "@/components";

export const CursoDetalleAlumno = () => {
  const { id } = useParams<{ id: string }>();
  const cursoId = id ? parseInt(id, 10) : undefined;

  const {
    curso,
    isLoading: isLoadingCurso,
    error: errorCurso,
    cargarCurso,
  } = useCursoDetalle(cursoId);

  const {
    asignaciones,
    isLoading: isLoadingAsignaciones,
    error: errorAsignaciones,
    estadisticas,
    cargarAsignaciones,
    handleToggleEstadoVacio,
  } = useAsignacionesAlumno(cursoId);

  if (isLoadingCurso) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12 flex-1 w-full">
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-xs text-muted-foreground">
            Cargando detalle del curso...
          </p>
        </div>
      </main>
    );
  }

  if (errorCurso || !curso) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12 flex-1 w-full">
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center max-w-lg mx-auto">
          <h2 className="font-display text-xl font-bold text-foreground">
            No se pudo cargar el curso
          </h2>
          <p className="mt-2 font-mono text-xs text-destructive">
            {errorCurso || "El curso solicitado no existe o no se encuentra disponible."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/home"
              className="rounded-lg border border-line bg-panel px-4 py-2 font-mono text-xs font-semibold text-foreground hover:bg-line/40 transition-colors"
            >
              ← Volver a Cursos
            </Link>
            <button
              type="button"
              onClick={cargarCurso}
              className="rounded-lg bg-destructive px-4 py-2 font-mono text-xs font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        </div>
      </main>
    );
  }

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
        </div>
      </section>

      {/* Resumen de Estado de Asignaciones / TPs */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-line bg-panel p-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Total TPs
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">
            {estadisticas.totalAsignaciones}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
            Corregidos
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {estadisticas.corregidas}
          </p>
        </div>

        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold">
            Entregados
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-blue-600 dark:text-blue-400">
            {estadisticas.entregadas}
          </p>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold">
            Pendientes
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-amber-600 dark:text-amber-400">
            {estadisticas.pendientes}
          </p>
        </div>
      </section>

      {/* Lista Principal de Asignaciones y Trabajos Prácticos */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
              Trabajos Prácticos y Asignaciones
            </h2>
            <p className="font-mono text-xs text-muted-foreground">
              Consultá el estado de tu repositorio asignado, commits y CI/CD.
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleEstadoVacio}
            className="text-[11px] font-mono text-muted-foreground hover:text-foreground underline underline-offset-4 cursor-pointer self-start sm:self-auto"
            title="Herramienta de desarrollo para probar vista sin asignaciones"
          >
            {asignaciones.length === 0 ? "↺ Cargar mocks" : "Probar estado vacío"}
          </button>
        </div>

        <AsignacionesAlumnoList
          asignaciones={asignaciones}
          isLoading={isLoadingAsignaciones}
          error={errorAsignaciones}
          onRetry={cargarAsignaciones}
        />
      </section>
    </main>
  );
};
