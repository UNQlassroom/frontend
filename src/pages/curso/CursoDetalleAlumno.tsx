import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { useCursoDetalle, useAsignacionesAlumno } from "@/hooks";
import {
  AsignacionesAlumnoList,
  PanelHeader,
  ErrorBanner,
  UserDetail,
  compararUsuarios,
} from "@/components";

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
    isRecargando: isRecargandoAsignaciones,
    error: errorAsignaciones,
    cargarAsignaciones,
  } = useAsignacionesAlumno(cursoId);

  const docentes = curso?.docentes;
  const docentesOrdenados = useMemo(() => {
    if (!docentes?.length) return [];
    return [...docentes].sort(compararUsuarios);
  }, [docentes]);

  if (isLoadingCurso) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12 flex-1 w-full">
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">
            Cargando detalle del curso...
          </p>
        </div>
      </main>
    );
  }

  if (errorCurso || !curso) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12 flex-1 w-full">
        <ErrorBanner
          className="max-w-lg mx-auto p-8"
          message={errorCurso || "El curso solicitado no existe o no se encuentra disponible."}
          onRetry={cargarCurso}
        >
        </ErrorBanner>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 flex-1 w-full space-y-8 animate-rise">
      {/* Navegación de retorno (Breadcrumbs) */}
      <div>
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>Volver a Cursos</span>
        </Link>
      </div>

      {/* Encabezado Principal del Curso - Enfocado en Alumno */}
      <section className="bg-panel rounded-2xl border border-line p-7 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">
                Espacio del Alumno
              </span>
            </div>

            <h1 className="font-suez text-3xl sm:text-4xl tracking-tight text-foreground">
              {curso.materia}
            </h1>

            {/* Metadatos Académicos: Año, Semestre, Comisión */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-panel2 px-3.5 py-1.5 text-sm font-semibold text-foreground">
                <span className="text-muted-foreground font-normal">Año:</span>
                <span>{curso.anio}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-panel2 px-3.5 py-1.5 text-sm font-semibold text-foreground">
                <span className="text-muted-foreground font-normal">Semestre:</span>
                <span>{curso.semestre}° Semestre</span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-panel2 px-3.5 py-1.5 text-sm font-semibold text-foreground">
                <span className="text-muted-foreground font-normal">Comisión:</span>
                <span>{curso.comision}</span>
              </span>

              {curso.descripcion && (
                <p className="text-sm text-muted-foreground mt-1.5 block w-full leading-relaxed">
                  {curso.descripcion}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Equipo docente del curso */}
        {docentesOrdenados.length > 0 && (
          <div className="mt-6 pt-5 border-t border-line/70 space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] font-semibold text-muted-foreground">
              {docentesOrdenados.length === 1 ? "Docente" : "Equipo docente"}
            </p>
            <div className="flex flex-wrap gap-2.5">
              {docentesOrdenados.map((docente) => (
                <div
                  key={docente.username}
                  className="inline-flex items-center gap-3 rounded-xl border border-line bg-panel2 px-3.5 py-2.5 max-w-full"
                >
                  <img
                    src={`https://github.com/${docente.username}.png?size=64`}
                    alt={docente.username}
                    className="w-8 h-8 rounded-full border border-line bg-line/30 object-cover shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="min-w-0 flex flex-col">
                    <UserDetail
                      username={docente.username}
                      nombreCompleto={docente.nombreCompleto}
                      layout="stacked"
                    />
                    {docente.email && (
                      <a
                        href={`mailto:${docente.email}`}
                        className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors truncate"
                        title={`Enviar correo a ${docente.email}`}
                      >
                        <Mail className="w-3 h-3 shrink-0 opacity-75" />
                        <span className="truncate">{docente.email}</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Panel Principal de Asignaciones y Trabajos Prácticos */}
      <section className="space-y-6">
        <PanelHeader
          title="Panel de Asignaciones"
          description="Seleccioná una asignación para ver en detalle su consigna, el estado técnico de tu repositorio, entregas y devoluciones."
        />

        <AsignacionesAlumnoList
          asignaciones={asignaciones}
          cursoId={curso.id}
          isLoading={isLoadingAsignaciones}
          isRecargando={isRecargandoAsignaciones}
          error={errorAsignaciones}
          onRetry={cargarAsignaciones}
        />
      </section>
    </main>
  );
};
