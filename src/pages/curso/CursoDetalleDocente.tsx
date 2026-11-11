import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { Archive } from "lucide-react";
import { toast } from "react-toastify";
import { useCursoDetalle, useAlumnos, useAuth } from "@/hooks";
import { archivarCurso } from "@/services";
import {
  AlumnosTab,
  AsignacionesTab,
  CorreccionesTab,
  MetricasTab,
  InvitarAlumnosModal,
  ArchivarCursoModal,
  ErrorBanner,
} from "@/components";

type TabType = "alumnos" | "asignaciones" | "metricas" | "correcciones";

export const CursoDetalleDocente = () => {
  const { id } = useParams<{ id: string }>();
  const cursoId = id ? parseInt(id, 10) : undefined;
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Tab activo derivado directamente del query param (?tab=...)
  const tabParam = searchParams.get("tab") as TabType | null;
  const activeTab: TabType =
    tabParam === "asignaciones" || tabParam === "metricas" || tabParam === "correcciones"
      ? tabParam
      : "alumnos";

  const [openInvitarModal, setOpenInvitarModal] = useState(false);
  const [openArchivarModal, setOpenArchivarModal] = useState(false);
  const [isArchivando, setIsArchivando] = useState(false);

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
    error: errorAlumnos,
    cargarAlumnos,
  } = useAlumnos();

  useEffect(() => {
    if (cursoId && !isNaN(cursoId)) {
      cargarAlumnos(cursoId);
    }
  }, [cursoId, cargarAlumnos]);

  const handleTabChange = (tab: TabType) => {
    setSearchParams({ tab });
  };

  const handleInvitarSuccess = () => {
    if (cursoId) {
      cargarAlumnos(cursoId);
    }
  };

  const handleConfirmArchivar = async () => {
    if (!curso) return;
    setIsArchivando(true);
    try {
      await archivarCurso(curso.id);
      setOpenArchivarModal(false);
      toast.success(`El curso "${curso.materia}" fue archivado correctamente.`);
      navigate("/home", { replace: true });
    } catch {
      // El interceptor global de Axios notifica el error mediante Toast
    } finally {
      setIsArchivando(false);
    }
  };

  // Estado de carga inicial del curso
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

  // Estado de error al cargar el curso
  if (errorCurso || !curso) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12 flex-1 w-full">
        <ErrorBanner
          className="max-w-lg mx-auto p-8"
          title="No se pudo cargar el curso"
          message={errorCurso || "El curso solicitado no existe o no se encuentra disponible."}
          onRetry={cargarCurso}
        >
          <Link
            to="/home"
            className="rounded-lg border border-line bg-panel px-4 py-2 text-xs font-semibold text-foreground hover:bg-line/40 transition-colors"
          >
            Volver a Cursos
          </Link>
        </ErrorBanner>
      </main>
    );
  }

  const alumnos = alumnosData?.alumnos || [];
  const esArchivado = Boolean(curso.archivado);
  const esOwner = !curso.ownerUsername || curso.ownerUsername === user?.username;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 flex-1 w-full space-y-8 animate-rise">
      {/* Navegación de retorno (Breadcrumbs) */}
      <div>
        <Link
          to={esArchivado ? "/home?archivados=true" : "/home"}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>{esArchivado ? "Volver a Cursos Archivados" : "Volver a Cursos"}</span>
        </Link>
      </div>

      {/* Encabezado Principal con Información Académica */}
      <section className="bg-panel rounded-2xl border border-line p-7 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {esArchivado && (
              <div>
                <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                  <span>Curso archivado</span>
                </span>
              </div>
            )}

            <h1 className="font-suez text-3xl sm:text-4xl tracking-tight text-foreground">
              {curso.materia}
            </h1>

            {/* Metadatos Académicos: Materia, Comisión, Semestre */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-panel2 px-3.5 py-1.5 text-sm font-semibold text-foreground">
                <span className="text-muted-foreground font-normal">Comisión:</span>
                <span>{curso.comision}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-panel2 px-3.5 py-1.5 text-sm font-semibold text-foreground">
                <span className="text-muted-foreground font-normal">Semestre:</span>
                <span>{curso.semestre}° Semestre</span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-panel2 px-3.5 py-1.5 text-sm font-semibold text-foreground">
                <span className="text-muted-foreground font-normal">Año:</span>
                <span>{curso.anio}</span>
              </span>

              {curso.descripcion && (
                <p className="text-sm text-muted-foreground mt-1.5 block w-full leading-relaxed">
                  {curso.descripcion}
                </p>
              )}
            </div>
          </div>

          {!esArchivado && esOwner && (
            <div className="shrink-0 self-start">
              <button
                type="button"
                onClick={() => setOpenArchivarModal(true)}
                aria-label="Archivar curso"
                title="Archivar curso"
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50 transition-colors cursor-pointer"
              >
                <Archive className="w-5 h-5 shrink-0" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Navegación interna mediante pestañas */}
      <section className="space-y-6">
        <div className="border-b border-line">
          <nav className="flex items-center gap-2 -mb-px overflow-x-auto" aria-label="Pestañas del curso">
            {/* Pestaña Alumnos */}
            <button
              type="button"
              onClick={() => handleTabChange("alumnos")}
              className={`inline-flex items-center gap-2.5 py-3.5 px-5 text-sm font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === "alumnos"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-line"
              }`}
            >
              <span>Alumnos</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
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
              className={`inline-flex items-center gap-2 py-3.5 px-5 text-sm font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === "asignaciones"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-line"
              }`}
            >
              <span>Asignaciones</span>
            </button>

            {/* Pestaña Correcciones e Issues */}
            <button
              type="button"
              onClick={() => handleTabChange("correcciones")}
              className={`inline-flex items-center gap-2 py-3.5 px-5 text-sm font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === "correcciones"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-line"
              }`}
            >
              <span>Correcciones</span>
            </button>

            {/* Pestaña Métricas de Repositorios */}
            <button
              type="button"
              onClick={() => handleTabChange("metricas")}
              className={`inline-flex items-center gap-2 py-3.5 px-5 text-sm font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
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
            <AlumnosTab
              curso={curso}
              alumnos={alumnos}
              isLoading={isLoadingAlumnos}
              error={errorAlumnos}
              onRetry={() => cursoId && cargarAlumnos(cursoId)}
              onOpenInvitarModal={() => setOpenInvitarModal(true)}
            />
          )}

          {activeTab === "asignaciones" && (
            <AsignacionesTab curso={curso} alumnos={alumnos} />
          )}

          {activeTab === "correcciones" && (
            <CorreccionesTab curso={curso} />
          )}

          {activeTab === "metricas" && (
            <MetricasTab curso={curso} alumnos={alumnos} />
          )}
        </div>
      </section>

      {/* Modal de Invitación de Alumnos y Archivado */}
      {!esArchivado && (
        <>
          <InvitarAlumnosModal
            open={openInvitarModal}
            onClose={() => setOpenInvitarModal(false)}
            curso={curso}
            onSuccess={handleInvitarSuccess}
          />

          <ArchivarCursoModal
            open={openArchivarModal}
            onClose={() => setOpenArchivarModal(false)}
            onConfirm={handleConfirmArchivar}
            curso={curso}
            isLoading={isArchivando}
          />
        </>
      )}
    </main>
  );
};
