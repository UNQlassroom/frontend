import { useState, useEffect } from "react";
import {
  crearAsignacion,
  listarTemplates,
} from "@/services";
import type {
  AlumnoMiembroDeUnCursoDTO,
  CrearAsignacionRequestDTO,
  CrearGrupoRequestDTO,
  TemplateRepoResponseDTO,
  TipoAsignacion,
} from "@/types";

interface CrearAsignacionModalProps {
  open: boolean;
  onClose: () => void;
  cursoId: number;
  alumnos: AlumnoMiembroDeUnCursoDTO[];
  onSuccess: () => void;
}

interface GrupoFormState {
  nombre: string;
  integrantesUsernames: string[];
}

export function CrearAsignacionModal({
  open,
  onClose,
  cursoId,
  alumnos,
  onSuccess,
}: CrearAsignacionModalProps) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState<TipoAsignacion>("INDIVIDUAL");
  const [templateRepoName, setTemplateRepoName] = useState("");
  const [customTemplate, setCustomTemplate] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");

  // Grupos para tipo GRUPAL
  const [grupos, setGrupos] = useState<GrupoFormState[]>([
    { nombre: "Grupo 1", integrantesUsernames: [] },
  ]);

  // Lista de repositorios templates
  const [templates, setTemplates] = useState<TemplateRepoResponseDTO[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setIsLoadingTemplates(true);
      listarTemplates()
        .then((res) => {
          setTemplates(res.data);
          if (res.data.length > 0) {
            setTemplateRepoName(res.data[0].name);
          }
        })
        .catch((err) => {
          console.warn("No se pudieron cargar templates automáticos:", err);
        })
        .finally(() => {
          setIsLoadingTemplates(false);
        });
    }
  }, [open]);

  const handleClose = () => {
    setTitulo("");
    setDescripcion("");
    setTipo("INDIVIDUAL");
    setTemplateRepoName(templates[0]?.name || "");
    setCustomTemplate("");
    setFechaLimite("");
    setGrupos([{ nombre: "Grupo 1", integrantesUsernames: [] }]);
    setError(null);
    onClose();
  };

  const handleAgregarGrupo = () => {
    setGrupos((prev) => [
      ...prev,
      { nombre: `Grupo ${prev.length + 1}`, integrantesUsernames: [] },
    ]);
  };

  const handleEliminarGrupo = (idx: number) => {
    setGrupos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCambiarNombreGrupo = (idx: number, nombre: string) => {
    setGrupos((prev) =>
      prev.map((g, i) => (i === idx ? { ...g, nombre } : g))
    );
  };

  const handleToggleIntegrante = (grupoIdx: number, username: string) => {
    setGrupos((prev) =>
      prev.map((g, i) => {
        if (i !== grupoIdx) {
          // Si el alumno estaba en otro grupo, lo removemos de allí para no duplicarlo
          return {
            ...g,
            integrantesUsernames: g.integrantesUsernames.filter((u) => u !== username),
          };
        }
        const existe = g.integrantesUsernames.includes(username);
        const nuevos = existe
          ? g.integrantesUsernames.filter((u) => u !== username)
          : [...g.integrantesUsernames, username];
        return { ...g, integrantesUsernames: nuevos };
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const tituloClean = titulo.trim();
    if (!tituloClean) {
      setError("El título de la asignación es obligatorio.");
      return;
    }

    const templateFinal = customTemplate.trim() || templateRepoName.trim();
    if (!templateFinal) {
      setError("Debés seleccionar o especificar un repositorio plantilla.");
      return;
    }

    let gruposPayload: CrearGrupoRequestDTO[] | undefined = undefined;

    if (tipo === "GRUPAL") {
      if (grupos.length === 0) {
        setError("Debés definir al menos un grupo para la asignación grupal.");
        return;
      }

      for (const g of grupos) {
        if (!g.nombre.trim()) {
          setError("Todos los grupos deben tener un nombre asignado.");
          return;
        }
        if (g.integrantesUsernames.length === 0) {
          setError(`El "${g.nombre}" no tiene integrantes asignados.`);
          return;
        }
      }

      gruposPayload = grupos.map((g) => ({
        nombre: g.nombre.trim(),
        integrantesUsernames: g.integrantesUsernames,
      }));
    }

    const payload: CrearAsignacionRequestDTO = {
      titulo: tituloClean,
      descripcion: descripcion.trim() || undefined,
      tipo,
      templateRepoName: templateFinal,
      fechaLimite: fechaLimite ? `${fechaLimite}T23:59:59` : undefined,
      grupos: gruposPayload,
    };

    setIsLoading(true);
    try {
      await crearAsignacion(cursoId, payload);
      onSuccess();
      handleClose();
    } catch (err: unknown) {
      console.error("Error al crear la asignación:", err);
      if (typeof err === "object" && err !== null && "response" in err) {
        const apiErr = err as {
          response?: { status?: number; data?: { message?: string } };
          message?: string;
        };
        const serverMsg = apiErr.response?.data?.message;
        setError(serverMsg || "Ocurrió un error al crear la asignación en el servidor.");
      } else {
        setError("Ocurrió un error inesperado al conectar con el servidor.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/60 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl border border-line bg-panel2 p-6 shadow-xl flex flex-col animate-rise">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-line">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Trabajos Prácticos
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
              Crear asignación
            </h2>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              El servidor creará un repositorio en GitHub para cada alumno o grupo con la plantilla de GitHub seleccionada.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-line/40 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Título */}
          <div>
            <label
              htmlFor="asignacion-titulo"
              className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-muted-foreground"
            >
              Título de la asignación *
            </label>
            <input
              id="asignacion-titulo"
              type="text"
              required
              disabled={isLoading}
              placeholder="Ej: TP 1 - Algoritmos y Estructuras"
              value={titulo}
              onChange={(e) => {
                setTitulo(e.target.value);
                setError(null);
              }}
              className="w-full rounded-lg border border-line bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Descripción */}
          <div>
            <label
              htmlFor="asignacion-descripcion"
              className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-muted-foreground"
            >
              Descripción (opcional)
            </label>
            <textarea
              id="asignacion-descripcion"
              rows={2}
              disabled={isLoading}
              placeholder="Describí los objetivos principales de la asignación..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full rounded-lg border border-line bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {/* Tipo de asignación: Individual o Grupal */}
          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
              Modalidad de entrega *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  tipo === "INDIVIDUAL"
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-line bg-background text-muted-foreground hover:border-foreground/30"
                }`}
              >
                <input
                  type="radio"
                  name="modalidad"
                  value="INDIVIDUAL"
                  checked={tipo === "INDIVIDUAL"}
                  onChange={() => setTipo("INDIVIDUAL")}
                  disabled={isLoading}
                  className="accent-primary"
                />
                <div>
                  <p className="font-mono text-xs font-semibold text-foreground">
                    Individual
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Un repositorio por alumno
                  </p>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  tipo === "GRUPAL"
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-line bg-background text-muted-foreground hover:border-foreground/30"
                }`}
              >
                <input
                  type="radio"
                  name="modalidad"
                  value="GRUPAL"
                  checked={tipo === "GRUPAL"}
                  onChange={() => setTipo("GRUPAL")}
                  disabled={isLoading}
                  className="accent-primary"
                />
                <div>
                  <p className="font-mono text-xs font-semibold text-foreground">Grupal
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Un repositorio por grupo
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Plantilla y Fecha Límite */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="asignacion-template"
                className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-muted-foreground"
              >
                Repositorio Plantilla *
              </label>
              {templates.length > 0 ? (
                <select
                  id="asignacion-template"
                  value={templateRepoName}
                  onChange={(e) => {
                    setTemplateRepoName(e.target.value);
                    setCustomTemplate("");
                  }}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-line bg-background px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {templates.map((tpl) => (
                    <option key={tpl.name} value={tpl.name}>
                      {tpl.name} {tpl.description ? `(${tpl.description})` : ""}
                    </option>
                  ))}
                  <option value="__custom__">-- Otro (escribir nombre) --</option>
                </select>
              ) : (
                <input
                  id="asignacion-template"
                  type="text"
                  required
                  placeholder={isLoadingTemplates ? "Cargando templates..." : "Ej: tp-base-template"}
                  value={templateRepoName}
                  onChange={(e) => setTemplateRepoName(e.target.value)}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-line bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              )}

              {templateRepoName === "__custom__" && (
                <input
                  type="text"
                  placeholder="Nombre exacto del template en GitHub"
                  value={customTemplate}
                  onChange={(e) => setCustomTemplate(e.target.value)}
                  disabled={isLoading}
                  className="mt-2 w-full rounded-lg border border-line bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              )}
            </div>

            <div>
              <label
                htmlFor="asignacion-fecha"
                className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-muted-foreground"
              >
                Fecha límite de entrega
              </label>
              <input
                id="asignacion-fecha"
                type="date"
                required
                disabled={isLoading}
                value={fechaLimite}
                onChange={(e) => setFechaLimite(e.target.value)}
                className="w-full rounded-lg border border-line bg-background px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              />
            </div>
          </div>

          {/* Configuración de Grupos (Solo si tipo === "GRUPAL") */}
          {tipo === "GRUPAL" && (
            <div className="space-y-3 pt-2 border-t border-line">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-mono text-xs font-semibold text-foreground uppercase tracking-wide">
                    Armado de Grupos
                  </h4>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    Armá los grupos seleccionando a los alumnos del curso.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAgregarGrupo}
                  disabled={isLoading}
                  className="rounded-lg border border-line bg-panel px-3 py-1 font-mono text-xs font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer"
                >
                  + Añadir grupo
                </button>
              </div>

              {alumnos.length === 0 ? (
                <div className="rounded-xl border border-line bg-panel p-4 text-center">
                  <p className="font-mono text-xs text-amber-600">
                    No hay alumnos en este curso todavía. Invitá alumnos antes de crear asignaciones grupales.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                  {grupos.map((grupo, gIdx) => (
                    <div
                      key={gIdx}
                      className="rounded-xl border border-line bg-panel p-3.5 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={grupo.nombre}
                          onChange={(e) =>
                            handleCambiarNombreGrupo(gIdx, e.target.value)
                          }
                          disabled={isLoading}
                          placeholder={`Nombre del Grupo ${gIdx + 1}`}
                          className="rounded-md border border-line bg-background px-2.5 py-1 font-mono text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        {grupos.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleEliminarGrupo(gIdx)}
                            disabled={isLoading}
                            className="text-muted-foreground hover:text-destructive text-xs font-mono px-2 py-1 cursor-pointer"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {alumnos.map((alumno) => {
                          const estaSeleccionado =
                            grupo.integrantesUsernames.includes(alumno.username);
                          return (
                            <button
                              key={alumno.username}
                              type="button"
                              onClick={() =>
                                handleToggleIntegrante(gIdx, alumno.username)
                              }
                              disabled={isLoading}
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[11px] transition-colors cursor-pointer ${
                                estaSeleccionado
                                  ? "bg-primary text-primary-foreground font-semibold"
                                  : "border border-line bg-panel2 text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <span>@{alumno.username}</span>
                              {estaSeleccionado && <span>✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
              <p className="font-mono text-xs text-destructive">{error}</p>
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-line flex items-center justify-between">
            <span className="font-mono text-[11px] text-muted-foreground">
              {tipo === "INDIVIDUAL"
                ? `Se crearán repositorios para los ${alumnos.length} alumnos`
                : `Se crearán ${grupos.length} repositorios de grupo`}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="rounded-lg px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isLoading ? "Creando asignación en GitHub..." : "Crear Asignación"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
