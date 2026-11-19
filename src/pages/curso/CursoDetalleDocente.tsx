import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { Archive, Download, MoreVertical } from "lucide-react";
import { toast } from "react-toastify";
import { useCursoDetalle, useAlumnos, useDocentes, useAuth } from "@/hooks";
import { archivarCurso, exportarCurso } from "@/services";
import { esDocenteDelCurso, type DocenteResponseDTO } from "@/types";
import {
  AlumnosTab,
  AsignacionesTab,
  CorreccionesTab,
  MetricasTab,
  DocentesTab,
  InvitarAlumnosModal,
  AgregarDocentesModal,
  ArchivarCursoModal,
  ExportarCursoModal,
  ErrorBanner,
} from "@/components";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui";

type TabType = "alumnos" | "asignaciones" | "metricas" | "correcciones" | "docentes";

export const CursoDetalleDocente = () => {
  const { id } = useParams<{ id: string }>();
  const cursoId = id ? parseInt(id, 10) : undefined;
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Tab activo derivado directamente del query param (?tab=...)
  const tabParam = searchParams.get("tab") as TabType | null;
  const activeTab: TabType =
    tabParam === "asignaciones" ||
    tabParam === "metricas" ||
    tabParam === "correcciones" ||
    tabParam === "docentes"
      ? tabParam
      : "alumnos";

  const [menuOpen, setMenuOpen] = useState(false);
  const [openInvitarModal, setOpenInvitarModal] = useState(false);
  const [openAgregarDocentesModal, setOpenAgregarDocentesModal] = useState(false);
  const [openArchivarModal, setOpenArchivarModal] = useState(false);
  const [openExportarModal, setOpenExportarModal] = useState(false);
  const [isArchivando, setIsArchivando] = useState(false);
  const [isExportando, setIsExportando] = useState(false);

  // Hook para obtener el detalle académico del curso
  const {
    curso,
    isLoading: isLoadingCurso,
    error: errorCurso,
    cargarCurso,
    setCurso,
  } = useCursoDetalle(cursoId);

  // Hook para obtener la nómina de alumnos matriculados
  const {
    alumnosData,
    isLoading: isLoadingAlumnos,
    error: errorAlumnos,
    cargarAlumnos,
  } = useAlumnos();

  // Hook para obtener el equipo docente del curso
  const {
    docentes: docentesCargados,
    setDocentes,
    isLoading: isLoadingDocentes,
    error: errorDocentes,
    cargarDocentes,
  } = useDocentes();

  useEffect(() => {
    if (cursoId && !isNaN(cursoId)) {
      cargarAlumnos(cursoId);
      cargarDocentes(cursoId);
    }
  }, [cursoId, cargarAlumnos, cargarDocentes]);

  const handleTabChange = (tab: TabType) => {
    setSearchParams({ tab });
  };

  const handleInvitarSuccess = () => {
    if (cursoId) {
      cargarAlumnos(cursoId);
    }
  };

  const handleDocentesUpdated = (docentesActualizados: DocenteResponseDTO[]) => {
    setDocentes(docentesActualizados);
    setCurso((prev) =>
      prev ? { ...prev, docentes: docentesActualizados } : prev
    );
  };

  const handleSelfRemoved = () => {
    navigate("/home", { replace: true });
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

  const handleConfirmExportar = async () => {
    if (!curso) return;
    setIsExportando(true);
    try {
      const filename = await exportarCurso(curso.id, curso.materia);
      setOpenExportarModal(false);
      toast.success(`Planilla "${filename}" descargada con éxito.`);
    } catch {
      // El interceptor global de Axios notifica el error mediante Toast
    } finally {
      setIsExportando(false);
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
          message={errorCurso || "El curso solicitado no existe o no se encuentra disponible."}
          onRetry={cargarCurso}
        >
        </ErrorBanner>
      </main>
    );
  }

  const alumnos = alumnosData?.alumnos || [];
  const docentes =
    docentesCargados.length > 0 ? docentesCargados : curso.docentes || [];
  const esArchivado = Boolean(curso.archivado);
  const esDocenteAsignado =
    !docentes.length ||
    esDocenteDelCurso({ docentes }, user?.username);

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

          {/* Menú de Opciones (Kebab) del Curso */}
          {esDocenteAsignado && (
            <div className="shrink-0 self-start">
              <Popover open={menuOpen} onOpenChange={setMenuOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="Opciones del curso"
                    title="Opciones del curso"
                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-line bg-panel2 text-foreground hover:bg-line/40 transition-colors cursor-pointer"
                  >
                    <MoreVertical className="w-5 h-5 shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  sideOffset={6}
                  className="w-56 p-1.5 rounded-2xl border border-line bg-panel shadow-xl"
                >
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setOpenExportarModal(true);
                      }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-foreground hover:bg-line/40 transition-colors cursor-pointer text-left"
                    >
                      <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Exportar</span>
                    </button>

                    {!esArchivado && (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          setOpenArchivarModal(true);
                        }}
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer text-left"
                      >
                        <Archive className="w-4 h-4 shrink-0" />
                        <span>Archivar</span>
                      </button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
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

            {/* Pestaña Correcciones */}
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

            {/* Pestaña Métricas */}
            <button
              type="button"
              onClick={() => handleTabChange("metricas")}
              className={`inline-flex items-center gap-2 py-3.5 px-5 text-sm font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === "metricas"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-line"
              }`}
            >
              <span>Métricas</span>
            </button>

            {/* Pestaña Docentes */}
            <button
              type="button"
              onClick={() => handleTabChange("docentes")}
              className={`inline-flex items-center gap-2.5 py-3.5 px-5 text-sm font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === "docentes"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-line"
              }`}
            >
              <span>Docentes</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  activeTab === "docentes"
                    ? "bg-primary text-primary-foreground"
                    : "bg-line/60 text-muted-foreground"
                }`}
              >
                {docentes.length}
              </span>
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

          {activeTab === "docentes" && (
            <DocentesTab
              curso={curso}
              docentes={docentes}
              isLoading={isLoadingDocentes}
              error={errorDocentes}
              onRetry={() => cursoId && cargarDocentes(cursoId)}
              onOpenAgregarModal={() => setOpenAgregarDocentesModal(true)}
              onDocentesUpdated={handleDocentesUpdated}
              onSelfRemoved={handleSelfRemoved}
            />
          )}
        </div>
      </section>

      {/* Modales de modificación (Solo si no está archivado) */}
      {!esArchivado && (
        <>
          <InvitarAlumnosModal
            open={openInvitarModal}
            onClose={() => setOpenInvitarModal(false)}
            curso={curso}
            onSuccess={handleInvitarSuccess}
          />

          <AgregarDocentesModal
            open={openAgregarDocentesModal}
            onClose={() => setOpenAgregarDocentesModal(false)}
            curso={curso}
            onSuccess={handleDocentesUpdated}
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

      {/* Modal de Exportación de Planilla (Permitido tanto en activos como archivados) */}
      <ExportarCursoModal
        open={openExportarModal}
        onClose={() => setOpenExportarModal(false)}
        onConfirm={handleConfirmExportar}
        curso={curso}
        isLoading={isExportando}
      />
    </main>
  );
};
