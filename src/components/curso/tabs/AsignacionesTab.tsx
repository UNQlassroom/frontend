import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks";
import type {
  AlumnoResponseDTO,
  AsignacionResponseDTO,
  GrupoAsignacionResponseDTO,
  CursoResponseDTO,
} from "@/types";
import { obtenerAsignaciones, eliminarAsignacion } from "@/services";
import {
  CrearAsignacionModal,
  CalificarAsignacionModal,
  EliminarAsignacionModal,
  ModificarAsignacionModal,
} from "@/components/asignacion";
import { EmptyState, ErrorBanner } from "@/components/common";
import { PanelHeader, PanelFilterBar } from "@/components/panel";
import circleAddIcon from "@/assets/circle_add_favicon.svg";
import githubIcon from "@/assets/github_favicon.svg";

export interface AsignacionesTabProps {
  curso: CursoResponseDTO;
  alumnos: AlumnoResponseDTO[];
}

export function AsignacionesTab({ curso, alumnos }: AsignacionesTabProps) {
  const [asignaciones, setAsignaciones] = useState<AsignacionResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecargando, setIsRecargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedAsigId, setExpandedAsigId] = useState<number | null>(null);
  const [openMenuAsigId, setOpenMenuAsigId] = useState<number | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");

  const { isDocente } = useAuth();
  const navigate = useNavigate();

  const [asignacionAEliminar, setAsignacionAEliminar] =
    useState<AsignacionResponseDTO | null>(null);

  const [asignacionAEditar, setAsignacionAEditar] =
    useState<AsignacionResponseDTO | null>(null);

  // Cerrar el menú Kebab al hacer clic fuera o presionar Escape
  useEffect(() => {
    if (openMenuAsigId === null) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest("[data-kebab-menu]")) {
        setOpenMenuAsigId(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenuAsigId(null);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenuAsigId]);

  const handleModificacionExitosa = (
    asignacionActualizada: AsignacionResponseDTO
  ) => {
    setAsignaciones((prev) =>
      prev.map((asig) =>
        asig.id === asignacionActualizada.id
          ? { ...asig, ...asignacionActualizada }
          : asig
      )
    );
  };

  const handleConfirmarEliminar = async () => {
    if (!asignacionAEliminar) return;
    const asigId = asignacionAEliminar.id;

    await eliminarAsignacion(curso.id, asigId);
    setAsignacionAEliminar(null);
    toast.success("La asignación fue eliminada correctamente");
    setAsignaciones((prev) => prev.filter((a) => a.id !== asigId));
    navigate(`/cursos/${curso.id}?tab=asignaciones`, { replace: true });
  };

  const [calificarModal, setCalificarModal] = useState<{
    open: boolean;
    asignacionId: number;
    asignacionTitulo: string;
    grupo: GrupoAsignacionResponseDTO | null;
  }>({
    open: false,
    asignacionId: 0,
    asignacionTitulo: "",
    grupo: null,
  });

  const cargarAsignaciones = useCallback(async () => {
    setIsRecargando(true);
    setError(null);
    try {
      // Garantizamos un tiempo mínimo de 600ms para que la animación de recarga sea perceptible
      const [response] = await Promise.all([
        obtenerAsignaciones(curso.id),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]);
      setAsignaciones(response.data);
      if (response.data.length > 0) {
        setExpandedAsigId((prev) => (prev === null ? response.data[0].id : prev));
      }
    } catch {
      setError("No se pudieron cargar las asignaciones del curso.");
    } finally {
      setIsRecargando(false);
    }
  }, [curso.id]);

  useEffect(() => {
    let ignore = false;
    obtenerAsignaciones(curso.id)
      .then((res) => {
        if (!ignore) {
          setAsignaciones(res.data);
          if (res.data.length > 0) {
            setExpandedAsigId(res.data[0].id);
          }
        }
      })
      .catch(() => {
        if (!ignore) {
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
  }, [curso.id]);

  const hayAsignacionesCreando = useMemo(
    () => asignaciones.some((a) => a.estado === "CREANDO"),
    [asignaciones]
  );

  // Polling silencioso mientras existan asignaciones creando sus repositorios en segundo plano
  useEffect(() => {
    if (!hayAsignacionesCreando) return;

    const intervalId = window.setInterval(() => {
      obtenerAsignaciones(curso.id)
        .then((res) => {
          setAsignaciones(res.data);
        })
        .catch(() => {
          // Ignorar errores puntuales de polling silencioso
        });
    }, 8000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [curso.id, hayAsignacionesCreando]);

  const toggleExpand = (asigId: number) => {
    setExpandedAsigId((prev) => (prev === asigId ? null : asigId));
  };

  const getTemplateUrl = (templateRepoName: string) => {
    return `https://github.com/UNQlassroom-cursos/${templateRepoName}`;
  };

  const handleCalificacionExitosa = (
    asignacionActualizada: AsignacionResponseDTO
  ) => {
    setAsignaciones((prev) =>
      prev.map((asig) =>
        asig.id === asignacionActualizada.id ? asignacionActualizada : asig
      )
    );
  };

  // Métricas
  const totalAsignaciones = asignaciones.length;
  const individualesCount = useMemo(
    () => asignaciones.filter((a) => a.tipo === "INDIVIDUAL").length,
    [asignaciones]
  );
  const grupalesCount = useMemo(
    () => asignaciones.filter((a) => a.tipo === "GRUPAL").length,
    [asignaciones]
  );

  // Filtrado de asignaciones
  const asignacionesFiltradas = useMemo(() => {
    return asignaciones.filter((asig) => {
      const matchTexto =
        asig.titulo.toLowerCase().includes(busqueda.toLowerCase().trim()) ||
        (asig.descripcion &&
          asig.descripcion.toLowerCase().includes(busqueda.toLowerCase().trim())) ||
        (asig.templateRepoName &&
          asig.templateRepoName.toLowerCase().includes(busqueda.toLowerCase().trim()));

      if (!matchTexto) return false;

      if (filtroTipo === "todos") return true;
      return asig.tipo === filtroTipo;
    });
  }, [asignaciones, busqueda, filtroTipo]);

  const isActualizando = isRecargando || isLoading;

  return (
    <div className="space-y-6 animate-rise">
      {/* Encabezado del Panel de Asignaciones */}
      <PanelHeader
        title="Panel de Asignaciones"
        description="Crea y administra asignaciones individuales o grupales integradas con GitHub y seguimiento de entregas."
        actions={
          <>
            <button
              type="button"
              onClick={cargarAsignaciones}
              disabled={isActualizando}
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel2 px-4 py-2 text-sm font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
              title="Actualizar asignaciones del curso"
            >
              <svg
                className={`w-4 h-4 ${
                  isActualizando ? "animate-spin text-primary" : "text-muted-foreground"
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <span>{isActualizando ? "Actualizando..." : "Actualizar asignaciones"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              title="Crear una nueva asignación"
            >
              <img
                src={circleAddIcon}
                alt="Crear"
                className="w-4 h-4 brightness-0 invert"
              />
              <span>Crear asignación</span>
            </button>
          </>
        }
      />

      {/* Loading State */}
      {isLoading && (
        <div className="rounded-2xl border border-line bg-panel p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">
            Cargando asignaciones del curso...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <ErrorBanner message={error} onRetry={cargarAsignaciones} />
      )}

      {/* Empty state si no hay asignaciones creadas */}
      {!isLoading && !error && asignaciones.length === 0 && (
        <EmptyState
          icon="📚"
          title="No hay asignaciones en este curso"
          description="Aún no se han creado asignaciones para este curso. Puedes crear la primera asignación haciendo clic en el botón a continuación."
          action={
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              <img
                src={circleAddIcon}
                alt="Crear"
                className="w-3.5 h-3.5 brightness-0 invert"
              />
              <span>Crear primera asignación</span>
            </button>
          }
        />
      )}

      {/* Si hay asignaciones, mostramos Filtros y Lista */}
      {!isLoading && !error && asignaciones.length > 0 && (
        <>
          {/* Barra de Filtros y Búsqueda */}
          <PanelFilterBar
            searchTerm={busqueda}
            onSearchChange={setBusqueda}
            searchPlaceholder="Buscar por título, descripción o plantilla..."
            count={asignacionesFiltradas.length}
            countLabel={
              asignacionesFiltradas.length === 1 ? "asignación" : "asignaciones"
            }
          >
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="rounded-xl border border-line bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos los tipos ({totalAsignaciones})</option>
              <option value="INDIVIDUAL">Solo individuales ({individualesCount})</option>
              <option value="GRUPAL">Solo grupales ({grupalesCount})</option>
            </select>
          </PanelFilterBar>

          {/* Listado de Asignaciones */}
          {asignacionesFiltradas.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No se encontraron asignaciones"
              description="No hay asignaciones que coincidan con la búsqueda o el filtro aplicado."
              action={
                <button
                  type="button"
                  onClick={() => {
                    setBusqueda("");
                    setFiltroTipo("todos");
                  }}
                  className="rounded-lg border border-line bg-panel2 px-4 py-2 text-xs font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer"
                >
                  Restablecer filtros
                </button>
              }
            />
          ) : (
            <div
              className={`space-y-4 transition-all duration-300 ${
                isRecargando ? "opacity-50 pointer-events-none" : "opacity-100"
              }`}
            >
              {asignacionesFiltradas.map((asig) => {
                const isExpanded = expandedAsigId === asig.id;
                const isMenuOpen = openMenuAsigId === asig.id;
                const totalGrupos = asig.grupos?.length || 0;
                const templateUrl = getTemplateUrl(asig.templateRepoName);
                const isEdicionDeshabilitada =
                  asig.estado === "CREANDO" || asig.estado === "ERROR";

                return (
                  <div
                    key={asig.id}
                    className="rounded-2xl border border-line bg-panel p-6 shadow-xs transition-colors space-y-5 hover:border-foreground/20"
                  >
                    {/* Header de la Asignación */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1 min-w-0">
                        {/* Metadatos livianos: Tipo, Plantilla y Fecha límite */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 font-semibold ${
                              asig.tipo === "GRUPAL"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                            }`}
                          >
                            {asig.tipo === "GRUPAL" ? "Grupal" : "Individual"}
                          </span>

                          <span className="text-muted-foreground/40">•</span>

                          <a
                            href={templateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
                            title={`Ver repositorio plantilla ${asig.templateRepoName} en GitHub`}
                          >
                            <img
                              src={githubIcon}
                              alt="Repo"
                              className="w-3.5 h-3.5 opacity-75"
                            />
                            <span>Plantilla:</span>
                            <span className="font-semibold text-foreground underline decoration-muted-foreground/40 group-hover:decoration-foreground">
                              {asig.templateRepoName}
                            </span>
                            <span className="text-[11px] group-hover:text-foreground">↗</span>
                          </a>

                          {asig.fechaLimite && (
                            <>
                              <span className="text-muted-foreground/40">•</span>
                              <span className="inline-flex items-center gap-1">
                                <span>Fecha límite:</span>
                                <span className="font-semibold text-foreground">
                                  {new Date(asig.fechaLimite).toLocaleDateString(
                                    "es-AR",
                                    {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    }
                                  )}
                                </span>
                              </span>
                            </>
                          )}
                        </div>

                        <h4 className="font-display text-2xl font-bold text-foreground">
                          {asig.titulo}
                        </h4>

                        {asig.descripcion && (
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {asig.descripcion}
                          </p>
                        )}
                      </div>

                      {/* Acciones de la tarjeta: Desplegar repositorios + Kebab Menu (⋮) */}
                      <div className="flex items-center gap-2 shrink-0 self-start">
                        <button
                          type="button"
                          onClick={() => toggleExpand(asig.id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer"
                        >
                          <span>Repositorios</span>
                          <span className="rounded-full bg-line/70 px-2 py-0.5 text-xs text-muted-foreground">
                            {totalGrupos}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {isExpanded ? "▲" : "▼"}
                          </span>
                        </button>

                        {isDocente && (
                          <div className="relative" data-kebab-menu>
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenuAsigId((prev) =>
                                  prev === asig.id ? null : asig.id
                                )
                              }
                              aria-label="Opciones de la asignación"
                              aria-expanded={isMenuOpen}
                              title="Opciones de la asignación"
                              className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-colors cursor-pointer ${
                                isMenuOpen
                                  ? "border-foreground/30 bg-line/50 text-foreground"
                                  : "border-line bg-panel2 text-muted-foreground hover:text-foreground hover:bg-line/40"
                              }`}
                            >
                              <svg
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <circle cx="12" cy="5" r="2" />
                                <circle cx="12" cy="12" r="2" />
                                <circle cx="12" cy="19" r="2" />
                              </svg>
                            </button>

                            {isMenuOpen && (
                              <div
                                role="menu"
                                className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-line bg-panel shadow-lg py-1.5 z-20 text-xs sm:text-sm animate-rise"
                              >
                                <button
                                  type="button"
                                  role="menuitem"
                                  disabled={isEdicionDeshabilitada}
                                  onClick={() => {
                                    setOpenMenuAsigId(null);
                                    setAsignacionAEditar(asig);
                                  }}
                                  title={
                                    isEdicionDeshabilitada
                                      ? "No disponible mientras los repositorios están creándose o con error"
                                      : "Editar descripción o fecha límite"
                                  }
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-foreground hover:bg-line/40 transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                                >
                                  <svg
                                    className="w-4 h-4 text-muted-foreground shrink-0"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                  <span>Editar</span>
                                </button>

                                <div className="my-1 border-t border-line/60" />

                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => {
                                    setOpenMenuAsigId(null);
                                    setAsignacionAEliminar(asig);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-destructive hover:bg-destructive/10 transition-colors cursor-pointer font-semibold"
                                >
                                  <svg
                                    className="w-4 h-4 shrink-0"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                                  </svg>
                                  <span>Eliminar</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Avisos de estado asíncrono (CREANDO o ERROR) */}
                    {asig.estado === "CREANDO" && (
                      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
                        <div className="flex items-start sm:items-center gap-3">
                          <div className="w-4 h-4 border-2 border-amber-600 dark:border-amber-400 border-t-transparent rounded-full animate-spin shrink-0 mt-0.5 sm:mt-0" />
                          <div className="space-y-0.5">
                            <p className="font-semibold text-amber-700 dark:text-amber-300">
                              La asignación fue creada y los repositorios se están generando en GitHub
                            </p>
                            <p className="text-xs text-muted-foreground">
                              La creación de repositorios y asignación de colaboradores se ejecuta en segundo plano y puede demorar unos momentos. El estado se actualizará automáticamente.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {asig.estado === "ERROR" && (
                      <ErrorBanner
                        title="Ocurrió un error al crear los repositorios en GitHub"
                        message="No se pudieron generar todos los repositorios de esta asignación y se revirtieron los repositorios creados parcialmente. Te recomendamos eliminar esta asignación y volver a crearla."
                        onRetry={isDocente ? () => setAsignacionAEliminar(asig) : undefined}
                        retryText="Eliminar asignación"
                      />
                    )}

                    {/* Detalle desplegable de los repositorios y entregas */}
                    {isExpanded && (
                      <div className="pt-4 border-t border-line">
                        {totalGrupos === 0 ? (
                          <p className="text-sm text-muted-foreground italic">
                            No hay repositorios asociados a esta asignación todavía.
                          </p>
                        ) : (
                          <div className="overflow-x-auto rounded-2xl border border-line bg-panel2/60">
                            <table className="w-full text-left border-collapse text-sm">
                              <thead>
                                <tr className="border-b border-line bg-panel2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                                  <th className="py-3 px-4">
                                    {asig.tipo === "GRUPAL"
                                      ? "Grupo / Integrantes"
                                      : "Alumno"}
                                  </th>
                                  <th className="py-3 px-4">Repositorio</th>
                                  <th className="py-3 px-4">Estado / Entrega</th>
                                  <th className="py-3 px-4">Acción</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-line/60">
                                {asig.grupos.map((grupo) => (
                                  <tr
                                    key={grupo.id}
                                    className="hover:bg-line/20 transition-colors"
                                  >
                                    {/* Nombre o Integrantes */}
                                    <td className="py-3.5 px-4">
                                      <div className="space-y-1">
                                        {grupo.nombre && (
                                          <p className="font-semibold text-foreground text-sm">
                                            {grupo.nombre}
                                          </p>
                                        )}
                                        <div className="flex flex-wrap gap-1.5">
                                          {grupo.integrantes.map((u) => (
                                            <a
                                              key={u.id ?? u.username}
                                              href={`https://github.com/${u.username}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                                            >
                                              @{u.username}
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    </td>

                                    {/* Repositorio */}
                                    <td className="py-3.5 px-4">
                                      {grupo.repositorio ? (
                                        <div className="flex items-center gap-1.5">
                                          <a
                                            href={grupo.repositorio.htmlUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-line/40 transition-colors"
                                            title={grupo.repositorio.htmlUrl}
                                          >
                                            <img
                                              src={githubIcon}
                                              alt="GitHub"
                                              className="w-4 h-4 opacity-80"
                                            />
                                            <span className="truncate max-w-[220px]">
                                              {grupo.repositorio.nombre}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                              ↗
                                            </span>
                                          </a>
                                          {grupo.releaseUrl && (
                                            <a
                                              href={grupo.releaseUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center rounded-lg border border-line bg-panel px-2 py-1 text-xs font-semibold text-foreground hover:bg-line/40 transition-colors"
                                              title="Ver entrega / release en GitHub"
                                            >
                                              🏷️
                                            </a>
                                          )}
                                        </div>
                                      ) : asig.estado === "ERROR" ? (
                                        <span className="text-destructive/80 italic text-xs font-medium">
                                          No generado (error)
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs">
                                          <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
                                          <span>Creando en GitHub...</span>
                                        </span>
                                      )}
                                    </td>

                                    {/* Estado / Entrega */}
                                    <td className="py-3.5 px-4">
                                      {grupo.calificacion !== null &&
                                      grupo.calificacion !== undefined ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                          <span>Calificado: {grupo.calificacion}/10</span>
                                        </span>
                                      ) : grupo.entregada || grupo.fechaEntregada ? (
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                                            Entregado
                                          </span>
                                          {grupo.fechaEntregada && (
                                            <span className="text-xs text-muted-foreground">
                                              {new Date(
                                                grupo.fechaEntregada
                                              ).toLocaleDateString("es-AR", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                              })}
                                            </span>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="inline-flex items-center text-amber-600 dark:text-amber-400 text-xs font-semibold bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                                          Pendiente
                                        </span>
                                      )}
                                    </td>

                                    {/* Acción / Calificar */}
                                    <td className="py-3.5 px-4">
                                      <button
                                        type="button"
                                        disabled={
                                          asig.estado === "CREANDO" ||
                                          asig.estado === "ERROR"
                                        }
                                        onClick={() =>
                                          setCalificarModal({
                                            open: true,
                                            asignacionId: asig.id,
                                            asignacionTitulo: asig.titulo,
                                            grupo,
                                          })
                                        }
                                        className="inline-flex items-center gap-1.5 rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={
                                          asig.estado === "CREANDO"
                                            ? "Esperá a que finalice la creación de repositorios para calificar"
                                            : asig.estado === "ERROR"
                                              ? "No se puede calificar una asignación con error de creación"
                                              : grupo.calificacion !== null &&
                                                grupo.calificacion !== undefined
                                                ? "Editar calificación de este grupo"
                                                : "Calificar este grupo"
                                        }
                                      >
                                        <span>
                                          {grupo.calificacion !== null &&
                                          grupo.calificacion !== undefined
                                            ? "Editar calificación"
                                            : "Calificar"}
                                        </span>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modal para crear asignación */}
      <CrearAsignacionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cursoId={curso.id}
        alumnos={alumnos}
        onSuccess={cargarAsignaciones}
      />

      {/* Modal para eliminar asignación */}
      <EliminarAsignacionModal
        open={Boolean(asignacionAEliminar)}
        onClose={() => setAsignacionAEliminar(null)}
        onConfirm={handleConfirmarEliminar}
        asignacionTitulo={asignacionAEliminar?.titulo || ""}
        tipo={asignacionAEliminar?.tipo}
        totalGrupos={asignacionAEliminar?.grupos?.length || 0}
      />

      {/* Modal para calificar asignación */}
      <CalificarAsignacionModal
        open={calificarModal.open}
        onClose={() =>
          setCalificarModal((prev) => ({ ...prev, open: false, grupo: null }))
        }
        cursoId={curso.id}
        asignacionId={calificarModal.asignacionId}
        asignacionTitulo={calificarModal.asignacionTitulo}
        grupo={calificarModal.grupo}
        onSuccess={handleCalificacionExitosa}
      />

      {/* Modal para modificar asignación */}
      <ModificarAsignacionModal
        open={Boolean(asignacionAEditar)}
        onClose={() => setAsignacionAEditar(null)}
        cursoId={curso.id}
        asignacion={asignacionAEditar}
        onSuccess={handleModificacionExitosa}
      />
    </div>
  );
}
