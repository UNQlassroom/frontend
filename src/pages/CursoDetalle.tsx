import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { useCursoDetalle, useAlumnos, useRole } from "@/hooks";
import {
  AlumnosTable,
  AsignacionesTab,
  PanelMetricasRepositorios,
  InvitarAlumnosModal,
  CursoDetalleAlumno,
} from "@/components";
import { getGitHubRepoUrl } from "@/lib";
import githubIcon from "@/assets/github_favicon.svg";

type TabType = "alumnos" | "asignaciones" | "metricas";

export const CursoDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const cursoId = id ? parseInt(id, 10) : undefined;
  const [searchParams, setSearchParams] = useSearchParams();
  const { isProfesor } = useRole();

  // Tab activo sincronizado con query param opcional
  const tabParam = searchParams.get("tab") as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(
    tabParam === "asignaciones" || tabParam === "metricas" ? tabParam : "alumnos"
  );

  const [openInvitarModal, setOpenInvitarModal] = useState(false);

  // Hook para obtener el detalle académico del curso
  const {
    curso,
    isLoading: isLoadingCurso,
    error: errorCurso,
    cargarCurso,
  } = useCursoDetalle(cursoId);

  // Hook para obtener la nómina de alumnos matriculados (exclusivo para docente)
  const {
    alumnosData,
    isLoading: isLoadingAlumnos,
    error: errorAlumnos,
    cargarAlumnos,
  } = useAlumnos();

  useEffect(() => {
    if (isProfesor && cursoId && !isNaN(cursoId)) {
      cargarAlumnos(cursoId);
    }
  }, [isProfesor, cursoId, cargarAlumnos]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleInvitarSuccess = () => {
    if (cursoId) {
      cargarAlumnos(cursoId);
    }
  };

  // Estado de carga inicial del curso
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

  // Estado de error al cargar el curso
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

  // Si el usuario es alumno, renderizamos la vista de alumno
  if (!isProfesor) {
    return <CursoDetalleAlumno curso={curso} onRetry={cargarCurso} />;
  }

  const alumnos = alumnosData?.alumnos || [];

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

      {/* Encabezado Principal con Información Académica */}
      <section className="bg-panel rounded-2xl border border-line p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Detalle del Curso
              </span>
              <span className="text-muted-foreground/40">•</span>
              <span className="rounded-md border border-line bg-panel2 px-2 py-0.5 font-mono text-[11px] font-medium text-foreground">
                Año {curso.anio}
              </span>
            </div>

            <h1 className="font-suez text-3xl sm:text-4xl tracking-tight text-foreground">
              {curso.materia}
            </h1>

            {/* Metadatos Académicos: Materia, Comisión, Semestre */}
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

          {/* Enlace y Acciones del Curso en GitHub */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
            {curso.githubRepoName ? (
              <a
                href={getGitHubRepoUrl(curso.githubRepoName)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel2 px-3.5 py-2 font-mono text-xs font-semibold text-foreground hover:bg-line/40 transition-colors shadow-xs"
                title={`Ver repositorio oficial: ${curso.githubRepoName}`}
              >
                <img src={githubIcon} alt="GitHub" className="w-4 h-4 opacity-80" />
                <span className="max-w-[200px] truncate">{curso.githubRepoName}</span>
                <span className="text-muted-foreground text-[10px]">↗</span>
              </a>
            ) : (
              <span className="rounded-lg border border-line bg-panel2 px-3 py-1.5 font-mono text-xs text-muted-foreground">
                Sin repo de GitHub configurado
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Navegación interna mediante pestañas */}
      <section className="space-y-6">
        <div className="border-b border-line">
          <nav className="flex items-center gap-2 -mb-px" aria-label="Pestañas del curso">
            {/* Pestaña Alumnos */}
            <button
              type="button"
              onClick={() => handleTabChange("alumnos")}
              className={`inline-flex items-center gap-2 py-3 px-4 font-mono text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === "alumnos"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-line"
              }`}
            >
              <span>Alumnos</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  activeTab === "alumnos"
                    ? "bg-primary text-primary-foreground"
                    : "bg-line/60 text-muted-foreground"
                }`}
              >
                {alumnos.length}
              </span>
            </button>

            {/* Pestaña Asignaciones */}
            <button
              type="button"
              onClick={() => handleTabChange("asignaciones")}
              className={`inline-flex items-center gap-2 py-3 px-4 font-mono text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === "asignaciones"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-line"
              }`}
            >
              <span>Asignaciones</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-normal">
                (TPs)
              </span>
            </button>

            {/* Pestaña Métricas de Repositorios */}
            <button
              type="button"
              onClick={() => handleTabChange("metricas")}
              className={`inline-flex items-center gap-2 py-3 px-4 font-mono text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === "metricas"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-line"
              }`}
            >
              <span>Métricas de Repositorios</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          </nav>
        </div>

        {/* Contenido de la pestaña activa */}
        <div className="pt-2">
          {activeTab === "alumnos" && (
            <AlumnosTable
              curso={curso}
              alumnos={alumnos}
              isLoading={isLoadingAlumnos}
              error={errorAlumnos}
              onRetry={() => cursoId && cargarAlumnos(cursoId)}
              onOpenInvitarModal={() => setOpenInvitarModal(true)}
            />
          )}

          {activeTab === "asignaciones" && <AsignacionesTab curso={curso} />}

          {activeTab === "metricas" && (
            <PanelMetricasRepositorios curso={curso} alumnos={alumnos} />
          )}
        </div>
      </section>

      {/* Modal de Invitación de Alumnos */}
      <InvitarAlumnosModal
        open={openInvitarModal}
        onClose={() => setOpenInvitarModal(false)}
        curso={curso}
        onSuccess={handleInvitarSuccess}
      />
    </main>
  );
};
