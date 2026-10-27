import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import type { AsignacionAlumnoDTO, EstadoEntrega } from "@/types";
import { KpiCard, EmptyState, ErrorBanner } from "@/components/common";
import { PanelFilterBar } from "@/components/panel";
import { formatFechaLegible, getBadgeEstadoEntrega } from "@/utils";

interface AsignacionesAlumnoListProps {
  cursoId?: number;
  asignaciones: AsignacionAlumnoDTO[];
  isLoading?: boolean;
  isRecargando?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function AsignacionesAlumnoList({
  cursoId,
  asignaciones,
  isLoading,
  isRecargando = false,
  error,
  onRetry,
}: AsignacionesAlumnoListProps) {
  const [filtro, setFiltro] = useState<EstadoEntrega | "todas">("todas");
  const [searchTerm, setSearchTerm] = useState("");

  const conteo = useMemo(() => ({
    todas: asignaciones.length,
    pendiente: asignaciones.filter((a) => a.estadoEntrega === "pendiente").length,
    entregado: asignaciones.filter((a) => a.estadoEntrega === "entregado").length,
    corregido: asignaciones.filter((a) => a.estadoEntrega === "corregido").length,
  }), [asignaciones]);

  const asignacionesFiltradas = useMemo(() => {
    return asignaciones.filter((asig) => {
      const matchTexto =
        asig.titulo.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        (asig.descripcion &&
          asig.descripcion.toLowerCase().includes(searchTerm.toLowerCase().trim())) ||
        (asig.repoNombre &&
          asig.repoNombre.toLowerCase().includes(searchTerm.toLowerCase().trim()));

      if (!matchTexto) return false;

      if (filtro === "todas") return true;
      return asig.estadoEntrega === filtro;
    });
  }, [asignaciones, searchTerm, filtro]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-line bg-panel p-12 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-xs text-muted-foreground">
          Cargando tus asignaciones y notas...
        </p>
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={onRetry} />;
  }

  if (asignaciones.length === 0) {
    return (
      <EmptyState
        icon="📚"
        title="No tenés asignaciones asignadas"
        description="Aún no se han publicado asignaciones en este curso. Las nuevas asignaciones aparecerán aquí junto con sus fechas de entrega y repositorio asignado."
      />
    );
  }

  const pct = (val: number) =>
    conteo.todas > 0 ? Math.round((val / conteo.todas) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Tarjetas KPI de Estado de Entregas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard
          label="Total Asignaciones"
          value={conteo.todas}
          subtext="En este curso"
          variant="default"
          isSelected={filtro === "todas"}
          onClick={() => setFiltro("todas")}
          title="Click para ver todas las asignaciones"
        />
        <KpiCard
          label="Pendientes"
          value={conteo.pendiente}
          subtext={`${pct(conteo.pendiente)}% por entregar`}
          variant="amber"
          isSelected={filtro === "pendiente"}
          onClick={() => setFiltro("pendiente")}
          title="Click para filtrar asignaciones pendientes"
        />
        <KpiCard
          label="Entregadas"
          value={conteo.entregado}
          subtext={`${pct(conteo.entregado)}% entregadas`}
          variant="sky"
          isSelected={filtro === "entregado"}
          onClick={() => setFiltro("entregado")}
          title="Click para filtrar asignaciones entregadas"
        />
        <KpiCard
          label="Corregidas"
          value={conteo.corregido}
          subtext={`${pct(conteo.corregido)}% corregidas`}
          variant="emerald"
          isSelected={filtro === "corregido"}
          onClick={() => setFiltro("corregido")}
          title="Click para filtrar asignaciones corregidas"
        />
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <PanelFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar asignación por título, descripción o repo..."
        count={asignacionesFiltradas.length}
        countLabel={
          asignacionesFiltradas.length === 1 ? "asignación" : "asignaciones"
        }
      >
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value as EstadoEntrega | "todas")}
          className="rounded-xl border border-line bg-background px-3.5 py-2 font-mono text-sm text-foreground focus:outline-none cursor-pointer"
        >
          <option value="todas">Todas las entregas ({conteo.todas})</option>
          <option value="pendiente">Solo pendientes ({conteo.pendiente})</option>
          <option value="entregado">Solo entregadas ({conteo.entregado})</option>
          <option value="corregido">Solo corregidas ({conteo.corregido})</option>
        </select>
      </PanelFilterBar>

      {/* Lista de Asignaciones o EmptyState de búsqueda */}
      {asignacionesFiltradas.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No se encontraron asignaciones"
          description="No hay asignaciones que coincidan con el término de búsqueda o el filtro de estado seleccionado."
          action={
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setFiltro("todas");
              }}
              className="rounded-xl border border-line bg-panel2 px-5 py-2.5 font-mono text-sm font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer"
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
            const badge = getBadgeEstadoEntrega(asig.estadoEntrega);
            const notaMaxima = asig.notaMaxima ?? 10;
            const tieneNota = typeof asig.calificacion === "number";
            const isVencida = asig.fechaLimite ? new Date() > new Date(asig.fechaLimite) : false;
            const detailUrl = cursoId
              ? `/cursos/${cursoId}/asignaciones/${asig.id}`
              : "#";

            return (
              <Link
                key={asig.id}
                to={detailUrl}
                className="group block rounded-2xl border border-line bg-panel p-6 shadow-xs transition-all duration-200 hover:border-foreground/20 hover:shadow-md animate-rise"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    {/* Fila superior de metadatos: Badges, Grupo y Fechas (estilo Docente) */}
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-panel2 px-2.5 py-0.5 font-semibold text-foreground">
                        {asig.tipo === "GRUPAL" ? "Grupal" : "Individual"}
                      </span>

                      {/* Badge de Estado de Entrega */}
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 font-semibold ${badge.classes}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                        <span>{badge.label}</span>
                      </span>

                      {/* Estado de creación de repo si aún no existe */}
                      {!asig.repoUrl && (
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-semibold text-amber-700 dark:text-amber-300">
                          <span className="w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
                          <span>Creando repo...</span>
                        </span>
                      )}

                      {/* Nombre del grupo si es grupal */}
                      {asig.tipo === "GRUPAL" && asig.grupoNombre && (
                        <>
                          <span className="text-muted-foreground/40">•</span>
                          <span className="inline-flex items-center gap-1">
                            <span>Grupo:</span>
                            <span className="font-semibold text-foreground">
                              {asig.grupoNombre}
                            </span>
                          </span>
                        </>
                      )}

                      {/* Fecha límite */}
                      {asig.fechaLimite && (
                        <>
                          <span className="text-muted-foreground/40">•</span>
                          <span className="inline-flex items-center gap-1">
                            <span>Fecha límite:</span>
                            <span
                              className={`font-semibold ${
                                isVencida && asig.estadoEntrega === "pendiente"
                                  ? "text-destructive font-bold"
                                  : "text-foreground"
                              }`}
                            >
                              {asig.fechaLimiteFormatted || formatFechaLegible(asig.fechaLimite)}
                            </span>
                          </span>
                        </>
                      )}

                      {/* Fecha de entrega */}
                      {asig.fechaEntregadaFormatted && (
                        <>
                          <span className="text-muted-foreground/40">•</span>
                          <span className="inline-flex items-center gap-1">
                            <span>Entregado el:</span>
                            <span className="font-semibold text-foreground">
                              {asig.fechaEntregadaFormatted}
                            </span>
                          </span>
                        </>
                      )}
                    </div>

                    {/* Título de la Asignación */}
                    <h3 className="font-display text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {asig.titulo}
                    </h3>

                    {/* Descripción truncada */}
                    {asig.descripcion && (
                      <p className="font-mono text-sm text-muted-foreground leading-relaxed max-w-3xl line-clamp-2">
                        {asig.descripcion}
                      </p>
                    )}
                  </div>

                  {/* Panel Lateral Resumen: Solo Calificación */}
                  <div className="flex flex-col items-center justify-center self-start sm:self-center shrink-0 rounded-xl border border-line bg-panel2 px-5 py-3.5 min-w-32.5 text-center font-mono">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                      Calificación
                    </span>
                    <div className="mt-1">
                      <span className="text-sm font-bold text-foreground">
                        {asig.estadoEntrega === "corregido" && tieneNota
                          ? `${asig.calificacion} / ${notaMaxima}`
                          : "Sin calificar"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
