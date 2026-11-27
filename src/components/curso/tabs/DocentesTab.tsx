import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import {
  esDocenteDelCurso,
  type CursoResponseDTO,
  type DocenteResponseDTO,
} from "@/types";
import { useAuth } from "@/hooks";
import { eliminarDocente } from "@/services";
import circleAddIcon from "@/assets/circle_add_favicon.svg";
import { PanelHeader, PanelFilterBar } from "@/components/panel";
import { EmptyState, ErrorBanner } from "@/components/common";
import { UserDetail } from "@/components/curso/UserDetail";
import { compararUsuarios } from "@/components/curso/ordenamiento";
import { DarDeBajaDocenteModal } from "@/components/curso/DarDeBajaDocenteModal";
import { resolveApiError } from "@/utils";

const TOOLTIP_UNICO_DOCENTE =
  "No es posible eliminar al único docente del curso";

export interface DocentesTabProps {
  curso?: CursoResponseDTO;
  docentes: DocenteResponseDTO[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onOpenAgregarModal: () => void;
  onDocentesUpdated: (docentes: DocenteResponseDTO[]) => void;
  onSelfRemoved: () => void;
}

const getEstadoDocente = (docente: DocenteResponseDTO): string =>
  docente.state || "active";

export function DocentesTab({
  curso,
  docentes,
  isLoading,
  error,
  onRetry,
  onOpenAgregarModal,
  onDocentesUpdated,
  onSelfRemoved,
}: DocentesTabProps) {
  const { user, isDocente } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [docenteABajar, setDocenteABajar] =
    useState<DocenteResponseDTO | null>(null);
  const [isBajaLoading, setIsBajaLoading] = useState(false);
  const [errorBaja, setErrorBaja] = useState<string | null>(null);

  const esArchivado = Boolean(curso?.archivado);
  const tieneDocentesEnCurso = Boolean(curso?.docentes?.length);
  const esDocenteAsignado =
    !tieneDocentesEnCurso || esDocenteDelCurso(curso, user?.username);
  const puedeDarDeBaja = Boolean(
    !esArchivado && isDocente && esDocenteAsignado
  );

  const esUnicoDocente = docentes.length <= 1;

  // Métricas y conteos
  const total = docentes.length;
  const activosCount = useMemo(
    () => docentes.filter((d) => getEstadoDocente(d) === "active").length,
    [docentes]
  );
  const pendientesCount = useMemo(
    () => docentes.filter((d) => getEstadoDocente(d) !== "active").length,
    [docentes]
  );

  const isCurrentUser = (username: string): boolean => {
    if (!user?.username) return false;
    return username.toLowerCase() === user.username.toLowerCase();
  };

  // Filtrado y ordenamiento alfabético de docentes
  const docentesFiltrados = useMemo(() => {
    const termino = searchTerm.toLowerCase().trim();
    return docentes
      .filter((docente) => {
        const coincideBusqueda =
          !termino ||
          docente.username.toLowerCase().includes(termino) ||
          Boolean(
            docente.nombreCompleto &&
              docente.nombreCompleto.toLowerCase().includes(termino)
          );

        if (!coincideBusqueda) return false;

        if (filtroEstado === "todos") return true;
        return getEstadoDocente(docente) === filtroEstado;
      })
      .sort(compararUsuarios);
  }, [docentes, searchTerm, filtroEstado]);

  const handleCerrarBaja = () => {
    if (isBajaLoading) return;
    setDocenteABajar(null);
    setErrorBaja(null);
  };

  const handleConfirmarBaja = async () => {
    if (!docenteABajar || !curso?.id) return;
    setIsBajaLoading(true);
    setErrorBaja(null);

    try {
      await eliminarDocente(curso.id, docenteABajar.username);
      const autoBaja = isCurrentUser(docenteABajar.username);

      if (autoBaja) {
        setDocenteABajar(null);
        setErrorBaja(null);
        toast.info(
          "Te diste de baja del curso. Ya no formás parte del equipo docente."
        );
        onSelfRemoved();
        return;
      }

      const actualizados = docentes.filter(
        (d) =>
          d.username.toLowerCase() !== docenteABajar.username.toLowerCase()
      );
      setDocenteABajar(null);
      setErrorBaja(null);
      onDocentesUpdated(actualizados);
      toast.success("Docente dado de baja exitosamente.");
    } catch (err: unknown) {
      const resolved = resolveApiError(err);
      setErrorBaja(resolved?.message || "Error al dar de baja al docente.");
    } finally {
      setIsBajaLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-rise">
      {/* Encabezado del Panel de Docentes */}
      <PanelHeader
        title="Panel de Docentes"
        description="Listado de docentes y estado de membresía en la organización."
        actions={
          !esArchivado ? (
            <button
              type="button"
              onClick={onOpenAgregarModal}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              title="Agregar nuevos docentes al curso"
            >
              <img
                src={circleAddIcon}
                alt="Agregar"
                className="w-4 h-4 brightness-0 invert dark:invert-0"
              />
              <span>Agregar docentes</span>
            </button>
          ) : undefined
        }
      />

      {/* Estado: Cargando */}
      {isLoading && docentes.length === 0 && (
        <div className="rounded-2xl border border-line bg-panel p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">
            Cargando equipo docente del curso...
          </p>
        </div>
      )}

      {/* Estado: Error */}
      {!isLoading && error && docentes.length === 0 && (
        <ErrorBanner message={error} onRetry={onRetry} />
      )}

      {/* Estado: Sin docentes */}
      {!isLoading && !error && docentes.length === 0 && (
        <EmptyState
          icon="👥"
          title="No hay docentes en este curso"
          description={
            esArchivado
              ? "Este curso fue archivado sin docentes registrados."
              : "Aún no se han añadido docentes a este curso. Agregalos usando sus usuarios de GitHub para gestionar el curso de manera colaborativa."
          }
          action={
            !esArchivado ? (
              <button
                type="button"
                onClick={onOpenAgregarModal}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              >
                <img
                  src={circleAddIcon}
                  alt="Agregar"
                  className="w-3.5 h-3.5 brightness-0 invert dark:invert-0"
                />
                <span>Agregar docente</span>
              </button>
            ) : undefined
          }
        />
      )}

      {/* Listado con filtros y tabla */}
      {docentes.length > 0 && (
        <>
          <PanelFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar docente por @usuario..."
            count={docentesFiltrados.length}
            countLabel={docentesFiltrados.length === 1 ? "docente" : "docentes"}
          >
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="rounded-xl border border-line bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos los estados ({total})</option>
              <option value="active">Solo activos ({activosCount})</option>
              <option value="pending">
                Solo invitaciones pendientes ({pendientesCount})
              </option>
            </select>
          </PanelFilterBar>

          {docentesFiltrados.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No se encontraron docentes"
              description="No hay docentes que coincidan con el término de búsqueda o el filtro de estado seleccionado."
              action={
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setFiltroEstado("todos");
                  }}
                  className="rounded-xl border border-line bg-panel2 px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer"
                >
                  Restablecer filtros
                </button>
              }
            />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-line bg-panel shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-line bg-panel2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    <th className="py-3.5 px-5">Docente</th>
                    <th className="py-3.5 px-5">Estado en Curso</th>
                    <th className="py-3.5 px-5">Membresía en GitHub</th>
                    {puedeDarDeBaja && (
                      <th className="py-3.5 px-5 text-left">Acción</th>
                    )}
                  </tr>
                </thead>
                <tbody
                  data-testid="docentes-table-body"
                  className="divide-y divide-line/70 text-sm"
                >
                  {docentesFiltrados.map((docente) => {
                    const esYo = isCurrentUser(docente.username);
                    const esActivo = getEstadoDocente(docente) === "active";
                    const tooltipBaja = esUnicoDocente
                      ? TOOLTIP_UNICO_DOCENTE
                      : `Dar de baja a @${docente.username}`;

                    return (
                      <tr
                        key={docente.username}
                        data-testid={`docente-row-${docente.username}`}
                        className="hover:bg-line/20 transition-colors group"
                      >
                        {/* Docente con avatar */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3 min-w-[180px]">
                            <img
                              src={`https://github.com/${docente.username}.png?size=64`}
                              alt={docente.username}
                              className="w-9 h-9 rounded-full border border-line bg-line/30 object-cover shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                            <UserDetail
                              username={docente.username}
                              nombreCompleto={docente.nombreCompleto}
                              esUsuarioActual={esYo}
                              layout="stacked"
                            />
                          </div>
                        </td>

                        {/* Estado */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs sm:text-sm font-medium ${
                              esActivo
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                esActivo ? "bg-emerald-500" : "bg-amber-500"
                              }`}
                            />
                            {esActivo ? "Activo" : "Invitación pendiente"}
                          </span>
                        </td>

                        {/* Membresía en GitHub */}
                        <td className="py-4 px-5">
                          {esActivo ? (
                            <span className="text-muted-foreground text-xs sm:text-sm">
                              Miembro activo de UNQlassroom en GitHub
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-amber-600/90 dark:text-amber-400/90 text-xs sm:text-sm font-medium">
                                Pendiente de aceptar la invitación a la organización
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Acción */}
                        {puedeDarDeBaja && (
                          <td className="py-4 px-5 text-left whitespace-nowrap">
                            <div
                              title={tooltipBaja}
                              className={
                                esUnicoDocente
                                  ? "relative inline-flex items-center group/baja cursor-not-allowed"
                                  : "relative inline-flex items-center"
                              }
                            >
                              <button
                                type="button"
                                data-testid={`dar-de-baja-docente-${docente.username}`}
                                disabled={esUnicoDocente || isBajaLoading}
                                onClick={() => {
                                  setErrorBaja(null);
                                  setDocenteABajar(docente);
                                }}
                                title={tooltipBaja}
                                aria-label={tooltipBaja}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50 transition-colors cursor-pointer disabled:opacity-45 disabled:pointer-events-none"
                              >
                                <span>Dar de baja</span>
                              </button>

                              {esUnicoDocente && (
                                <div
                                  role="tooltip"
                                  className="pointer-events-none invisible opacity-0 group-hover/baja:visible group-hover/baja:opacity-100 transition-opacity duration-150 absolute right-full mr-2 top-1/2 -translate-y-1/2 z-30 whitespace-nowrap rounded-lg border border-line bg-panel2 px-3 py-1.5 text-xs font-medium text-foreground shadow-lg"
                                >
                                  {TOOLTIP_UNICO_DOCENTE}
                                </div>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal para confirmar baja de docente */}
      <DarDeBajaDocenteModal
        open={Boolean(docenteABajar)}
        onClose={handleCerrarBaja}
        onConfirm={handleConfirmarBaja}
        docente={docenteABajar}
        esPropioUsuario={
          docenteABajar ? isCurrentUser(docenteABajar.username) : false
        }
        isLoading={isBajaLoading}
        error={errorBaja}
      />
    </div>
  );
}
