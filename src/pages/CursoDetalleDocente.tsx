import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { useCursoDetalle, useAlumnos } from "@/hooks";
import {
  AlumnosTable,
  AsignacionesTab,
  PanelMetricasRepositorios,
  InvitarAlumnosModal,
} from "@/components";

type TabType = "alumnos" | "asignaciones" | "metricas";

export const CursoDetalleDocente = () => {
  const { id } = useParams<{ id: string }>();
  const cursoId = id ? parseInt(id, 10) : undefined;
  const [searchParams, setSearchParams] = useSearchParams();

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

  // Hook para obtener la nómina de alumnos matriculados
  const {
    alumnosData,
    isLoading: isLoadingAlumnos,
    isSyncing: isSyncingAlumnos,
    error: errorAlumnos,
    cargarAlumnos,
    sincronizarAlumnos,
  } = useAlumnos();

  useEffect(() => {
    if (cursoId && !isNaN(cursoId)) {
      cargarAlumnos(cursoId);
    }
  }, [cursoId, cargarAlumnos]);

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
              isSyncing={isSyncingAlumnos}
              error={errorAlumnos}
              onRetry={() => cursoId && cargarAlumnos(cursoId)}
              onSync={() => cursoId && sincronizarAlumnos(cursoId)}
              onOpenInvitarModal={() => setOpenInvitarModal(true)}
            />
          )}

          {activeTab === "asignaciones" && (
            <AsignacionesTab curso={curso} alumnos={alumnos} />
          )}

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
