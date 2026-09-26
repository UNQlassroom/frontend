import { useState } from "react";
import type { AsignacionAlumnoDTO, EstadoEntrega } from "@/types";
import { useAuth } from "@/hooks";
import { CIStatusBadge } from "./CIStatusBadge";
import githubIcon from "@/assets/github_favicon.svg";

interface AsignacionesAlumnoListProps {
  asignaciones: AsignacionAlumnoDTO[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onEntregar?: (asignacionId: number) => Promise<boolean>;
  entregandoId?: number | string | null;
}

export function AsignacionesAlumnoList({
  asignaciones,
  isLoading,
  error,
  onRetry,
  onEntregar,
  entregandoId,
}: AsignacionesAlumnoListProps) {
  const { user } = useAuth();
  const [filtro, setFiltro] = useState<EstadoEntrega | "todas">("todas");
  const [copiedId, setCopiedId] = useState<string | number | null>(null);
  const [entregaError, setEntregaError] = useState<{ id: string | number; message: string } | null>(null);

  const asignacionesFiltradas =
    filtro === "todas"
      ? asignaciones
      : asignaciones.filter((a) => a.estadoEntrega === filtro);

  const conteo = {
    todas: asignaciones.length,
    pendiente: asignaciones.filter((a) => a.estadoEntrega === "pendiente").length,
    entregado: asignaciones.filter((a) => a.estadoEntrega === "entregado").length,
    corregido: asignaciones.filter((a) => a.estadoEntrega === "corregido").length,
  };

  const handleCopyClone = (asigId: string | number, repoUrl: string) => {
    const cloneCmd = `git clone ${repoUrl}.git`;
    navigator.clipboard.writeText(cloneCmd).then(() => {
      setCopiedId(asigId);
      setTimeout(() => {
        setCopiedId((prev) => (prev === asigId ? null : prev));
      }, 2000);
    });
  };

  const handleEntregar = async (asigId: number) => {
    if (!onEntregar) return;
    setEntregaError(null);
    try {
      await onEntregar(asigId);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String(err.message)
          : "Error al registrar la entrega. Intentalo nuevamente.";
      setEntregaError({ id: asigId, message: msg });
    }
  };

  const getBadgeEstado = (estado: EstadoEntrega) => {
    switch (estado) {
      case "corregido":
        return {
          label: "Corregido",
          classes: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
          dotColor: "bg-emerald-500",
        };
      case "entregado":
        return {
          label: "Entregado",
          classes: "bg-sky-500/10 text-sky-600 border border-sky-500/20",
          dotColor: "bg-sky-500",
        };
      case "pendiente":
      default:
        return {
          label: "Pendiente",
          classes: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
          dotColor: "bg-amber-500",
        };
    }
  };

  const formatFechaLegible = (isoDate?: string | null) => {
    if (!isoDate) return null;
    try {
      const date = new Date(isoDate);
      if (isNaN(date.getTime())) return isoDate;
      return date.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoDate;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-xs text-muted-foreground">
          Cargando tus asignaciones y notas...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm text-destructive font-medium mb-3">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-destructive px-4 py-2 font-mono text-xs font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer"
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra superior con filtros por estado de entrega */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-panel p-4 rounded-xl border border-line">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFiltro("todas")}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-colors cursor-pointer ${
              filtro === "todas"
                ? "bg-primary text-primary-foreground"
                : "border border-line bg-panel2 text-muted-foreground hover:text-foreground"
            }`}
          >
            Todas ({conteo.todas})
          </button>

          <button
            type="button"
            onClick={() => setFiltro("pendiente")}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-colors cursor-pointer ${
              filtro === "pendiente"
                ? "bg-amber-600 text-white"
                : "border border-line bg-panel2 text-muted-foreground hover:text-foreground"
            }`}
          >
            Pendientes ({conteo.pendiente})
          </button>

          <button
            type="button"
            onClick={() => setFiltro("entregado")}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-colors cursor-pointer ${
              filtro === "entregado"
                ? "bg-sky-600 text-white"
                : "border border-line bg-panel2 text-muted-foreground hover:text-foreground"
            }`}
          >
            Entregadas ({conteo.entregado})
          </button>

          <button
            type="button"
            onClick={() => setFiltro("corregido")}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-colors cursor-pointer ${
              filtro === "corregido"
                ? "bg-emerald-600 text-white"
                : "border border-line bg-panel2 text-muted-foreground hover:text-foreground"
            }`}
          >
            Corregidas ({conteo.corregido})
          </button>
        </div>
      </div>

      {/* Estado vacío cuando no hay asignaciones en general */}
      {asignaciones.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-panel p-12 text-center max-w-lg mx-auto my-8 animate-rise">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-line/40 border border-line flex items-center justify-center text-2xl mb-4 text-foreground shadow-xs">
            📚
          </div>
          <h3 className="font-display text-xl font-bold text-foreground tracking-tight">
            No tenés asignaciones asignadas
          </h3>
          <p className="mt-2 font-mono text-xs text-muted-foreground leading-relaxed">
            Aún no se han publicado trabajos prácticos en este curso. Los nuevos TPs aparecerán aquí junto con sus fechas de entrega y repositorio asignado.
          </p>
        </div>
      ) : asignacionesFiltradas.length === 0 ? (
        /* Estado vacío del filtro seleccionado */
        <div className="rounded-2xl border border-line bg-panel p-8 text-center text-muted-foreground font-mono text-xs my-6">
          No hay asignaciones en estado <span className="font-semibold text-foreground">"{filtro}"</span>.
        </div>
      ) : (
        /* Tarjetas de Asignaciones para el Alumno */
        <div className="grid gap-5">
          {asignacionesFiltradas.map((asig) => {
            const badge = getBadgeEstado(asig.estadoEntrega);
            const notaMaxima = asig.notaMaxima ?? 10;
            const tieneNota = typeof asig.calificacion === "number";
            const esAprobado = tieneNota && asig.calificacion! >= 4;
            const isVencida = asig.fechaLimite ? new Date() > new Date(asig.fechaLimite) : false;

            return (
              <div
                key={asig.id}
                className="rounded-2xl border border-line bg-panel p-6 shadow-xs flex flex-col justify-between hover:border-foreground/20 transition-colors animate-rise space-y-5"
              >
                {/* Cabecera de la tarjeta: Título, Tipo, Estado de entrega y CI */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Badge de Tipo: Individual o Grupal */}
                      <span className="inline-flex items-center gap-1 rounded-md border border-line bg-panel2 px-2.5 py-0.5 font-mono text-[11px] font-medium text-foreground">
                        {asig.tipo === "GRUPAL" ? "Grupal" : "Individual"}
                      </span>

                      {/* Badge de Estado de Entrega */}
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 font-mono text-[11px] font-medium ${badge.classes}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                        <span>{badge.label}</span>
                      </span>

                      {/* Badge de CI */}
                      {asig.estadoCI && (
                        <CIStatusBadge estado={asig.estadoCI} showIcon={true} />
                      )}

                      {/* Indicador de Fecha Límite */}
                      {asig.fechaLimiteFormatted && (
                        <span className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 font-mono text-[11px] ${
                          isVencida && asig.estadoEntrega === "pendiente"
                            ? "border-destructive/30 bg-destructive/10 text-destructive font-medium"
                            : "border-line bg-panel2 text-muted-foreground"
                        }`}>
                          <span>Fecha límite:</span>
                          <span className="font-semibold text-foreground">
                            {asig.fechaLimiteFormatted}
                          </span>
                          {isVencida && asig.estadoEntrega === "pendiente" && (
                            <span className="text-[10px] uppercase font-bold ml-1">(Vencida)</span>
                          )}
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-xl font-bold text-foreground">
                      {asig.titulo}
                    </h3>
                    {asig.descripcion && (
                      <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                        {asig.descripcion}
                      </p>
                    )}

                    {/* Visualización de Grupo y Compañeros */}
                    {asig.tipo === "GRUPAL" ? (
                      <div className="mt-3 p-3.5 rounded-xl border border-line bg-panel2/60 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                              Grupo asignado:
                            </span>
                            <span className="inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-bold text-foreground">
                              {asig.grupoNombre || "Sin nombre asignado"}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {asig.integrantes?.length || 0} integrante{(asig.integrantes?.length || 0) !== 1 ? "s" : ""}
                          </span>
                        </div>

                        {asig.integrantes && asig.integrantes.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-line/50">
                            <span className="font-mono text-[11px] text-muted-foreground font-medium">
                              Integrantes:
                            </span>
                            {asig.integrantes.map((username) => {
                              const esYo = user?.username === username;
                              return (
                                <a
                                  key={username}
                                  href={`https://github.com/${username}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-mono transition-colors group shadow-2xs ${
                                    esYo
                                      ? "border-primary/40 bg-primary/10 text-foreground font-semibold"
                                      : "border-line bg-background text-foreground hover:bg-line/40"
                                  }`}
                                  title={`Ver perfil de GitHub de @${username}${esYo ? " (Tu usuario)" : ""}`}
                                >
                                  <img
                                    src={`https://github.com/${username}.png?size=64`}
                                    alt={username}
                                    className="w-5 h-5 rounded-full object-cover border border-line shrink-0"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                  <span>@{username}</span>
                                  {esYo && (
                                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary text-primary-foreground">
                                      Vos
                                    </span>
                                  )}
                                  <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                    ↗
                                  </span>
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                        <span>Trabajo individual · Repositorio de trabajo personal</span>
                      </div>
                    )}
                  </div>

                  {/* Panel de Calificación Obtenida */}
                  <div className="shrink-0 bg-panel2 border border-line rounded-xl p-3.5 flex flex-col items-start lg:items-end justify-center min-w-[170px]">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Calificación
                    </span>
                    {asig.estadoEntrega === "corregido" && tieneNota ? (
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span
                          className={`font-suez text-2xl font-bold ${
                            esAprobado ? "text-emerald-600" : "text-destructive"
                          }`}
                        >
                          {asig.calificacion}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          /{notaMaxima}
                        </span>
                        <span
                          className={`ml-1.5 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase ${
                            esAprobado
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {esAprobado ? "Aprobado" : "Desaprobado"}
                        </span>
                      </div>
                    ) : asig.estadoEntrega === "entregado" ? (
                      <div className="flex flex-col items-start lg:items-end mt-1">
                        <span className="font-mono text-xs font-semibold text-sky-600 inline-flex items-center gap-1">
                          <span>⏳ En corrección</span>
                        </span>
                        {asig.fechaEntregaFormatted && (
                          <span className="mt-1 font-mono text-[10px] text-muted-foreground">
                            Entregado: {asig.fechaEntregaFormatted}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="mt-1 font-mono text-xs text-muted-foreground">
                        Sin entregar
                      </span>
                    )}

                    {asig.fechaUltimoCommit && (
                      <span className="mt-1 font-mono text-[10px] text-muted-foreground">
                        Último commit: {formatFechaLegible(asig.fechaUltimoCommit)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Acciones y Enlaces de GitHub: Repositorio, Clonar y Entrega */}
                <div className="pt-3 border-t border-line/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Botón de acceso directo al Repositorio */}
                    {asig.repoUrl ? (
                      <>
                        <a
                          href={asig.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel2 px-3 py-1.5 font-mono text-xs font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer shadow-2xs"
                          title="Abrir el repositorio asignado en GitHub"
                        >
                          <img src={githubIcon} alt="GitHub" className="w-3.5 h-3.5 opacity-80" />
                          <span>Ver en GitHub</span>
                          <span className="text-muted-foreground text-[10px]">↗</span>
                        </a>

                        {/* Botón para copiar git clone al portapapeles */}
                        <button
                          type="button"
                          onClick={() => handleCopyClone(asig.id, asig.repoUrl!)}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs font-medium transition-colors cursor-pointer shadow-2xs ${
                            copiedId === asig.id
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 font-semibold"
                              : "border-line bg-panel2 text-foreground hover:bg-line/40"
                          }`}
                          title={`Copiar al portapapeles: git clone ${asig.repoUrl}.git`}
                        >
                          {copiedId === asig.id ? (
                            <>
                              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>¡Copiado!</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                              <span>Copiar HTTPS</span>
                            </>
                          )}
                        </button>

                        {/* Ayuda para alumnos: ¿Cómo clonar el repositorio? */}
                        <div className="relative group/help inline-flex items-center">
                          <button
                            type="button"
                            aria-label="¿Cómo clonar este repositorio?"
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-line bg-panel2 text-muted-foreground hover:text-foreground hover:bg-line/40 font-mono text-xs font-bold transition-colors cursor-help shadow-2xs"
                          >
                            ?
                          </button>

                          {/* Tooltip con guía paso a paso para principiantes */}
                          <div className="pointer-events-none group-hover/help:pointer-events-auto opacity-0 group-hover/help:opacity-100 group-hover/help:translate-y-0 translate-y-1 transition-all duration-150 absolute bottom-full mb-2 left-0 sm:left-1/2 sm:-translate-x-1/2 w-72 sm:w-84 rounded-xl border border-line bg-panel p-4 shadow-xl z-30 text-left font-mono text-xs text-foreground">
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-line text-primary font-bold">
                              <span className="text-sm">💡</span>
                              <span>¿Cómo clonar el repositorio?</span>
                            </div>

                            <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                              Clonar descarga una copia completa del trabajo práctico a tu computadora para que puedas empezar a programar.
                            </p>

                            <ol className="space-y-2 text-[11px] text-muted-foreground list-decimal list-inside leading-relaxed">
                              <li>
                                <span className="text-foreground font-semibold">Copiá el comando</span> haciendo clic en{" "}
                                <span className="text-foreground bg-panel2 px-1 py-0.5 rounded border border-line font-medium">
                                  Copiar HTTPS
                                </span>.
                              </li>
                              <li>
                                <span className="text-foreground font-semibold">Abrí una terminal</span> (Git Bash, PowerShell o terminal de VS Code) en la carpeta donde guardás tus proyectos.
                              </li>
                              <li>
                                <span className="text-foreground font-semibold">Pegá y ejecutá</span> el comando con <kbd className="px-1 py-0.5 rounded bg-panel2 border border-line text-foreground font-mono text-[10px]">Enter</kbd>:
                                <div className="mt-1 p-2 rounded-md bg-background border border-line font-mono text-[10px] text-primary truncate select-all">
                                  git clone {asig.repoUrl}.git
                                </div>
                              </li>
                              <li>
                                <span className="text-foreground font-semibold">¡Listo!</span> Se creará la carpeta con los archivos para empezar a trabajar.
                              </li>
                            </ol>

                            {/* Flecha indicadora */}
                            <div className="absolute top-full left-3.5 sm:left-1/2 sm:-translate-x-1/2 -mt-1 w-2 h-2 bg-panel border-r border-b border-line rotate-45" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <span className="rounded-lg border border-line bg-panel2 px-3 py-1 font-mono text-[11px] text-muted-foreground">
                        Repositorio en proceso de creación...
                      </span>
                    )}
                  </div>

                  {/* Acción de Entrega / Estado */}
                  <div className="flex flex-col sm:items-end gap-1">
                    {asig.estadoEntrega === "pendiente" ? (
                      <div className="flex items-center gap-2">
                        {isVencida ? (
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 font-mono text-xs font-semibold text-destructive">
                            <span>⚠️</span>
                            <span>Plazo vencido</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleEntregar(Number(asig.id))}
                            disabled={entregandoId === asig.id}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 font-mono text-xs font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-50"                            title="Marcar esta asignación como entregada"
                          >
                            {entregandoId === asig.id ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                <span>Entregando...</span>
                              </>
                            ) : (
                              <>
                                <span >Entregar</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold text-xs">
                          <span>
                            {asig.estadoEntrega === "corregido"
                              ? "Corregido"
                              : "Entregado"}
                          </span>
                        </span>
                        {asig.fechaEntregaFormatted && (
                          <span className="text-[11px] text-muted-foreground">
                            ({asig.fechaEntregaFormatted})
                          </span>
                        )}
                      </div>
                    )}

                    {entregaError && entregaError.id === asig.id && (
                      <p className="font-mono text-[11px] text-destructive">
                        {entregaError.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
