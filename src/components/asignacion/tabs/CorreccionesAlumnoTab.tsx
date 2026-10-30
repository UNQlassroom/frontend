import { useState, useMemo } from "react";
import type { CorreccionGrupoResponseDTO, EstadoIssue } from "@/types";
import { IssueEstadoBadge } from "@/components/common";
import { PanelFilterBar } from "@/components/panel";
import { formatFechaLegible } from "@/utils";
import githubIcon from "@/assets/github_favicon.svg";

interface CorreccionesAlumnoTabProps {
  repoUrl?: string | null;
  correccionGrupo: CorreccionGrupoResponseDTO | null;
  isLoading: boolean;
  error: string | null;
}

export function CorreccionesAlumnoTab({
  correccionGrupo,
  isLoading,
  error,
}: CorreccionesAlumnoTabProps) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");

  const issues = useMemo(
    () => correccionGrupo?.issues ?? [],
    [correccionGrupo?.issues]
  );
  const cantIssues = issues.length;

  const issuesFiltrados = useMemo(() => {
    return issues.filter((issue) => {
      const matchBusqueda =
        issue.titulo.toLowerCase().includes(busqueda.toLowerCase().trim()) ||
        issue.autor.toLowerCase().includes(busqueda.toLowerCase().trim()) ||
        issue.numero.toString().includes(busqueda.trim());

      if (!matchBusqueda) return false;

      if (filtroEstado === "todos") return true;
      const estadoUpper = (issue.estado || "").toUpperCase();
      return estadoUpper === filtroEstado;
    });
  }, [issues, busqueda, filtroEstado]);

  return (
    <section className="rounded-2xl border border-line bg-panel p-6 sm:p-7 shadow-xs space-y-4 animate-rise">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-line">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <img src={githubIcon} alt="GitHub" className="w-4 h-4 opacity-80" />
          <span>Correcciones del docente en GitHub</span>
          <span className="rounded-full bg-line/60 px-2.5 py-0.5 text-xs text-muted-foreground font-semibold">
            {cantIssues}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 gap-2.5">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">
            Consultando correcciones en GitHub...
          </span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-center text-sm text-destructive">
          <span>{error}</span>
        </div>
      ) : cantIssues === 0 ? (
        <div className="p-8 rounded-xl border border-line/60 bg-panel2/40 text-center text-sm text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">
            Sin correcciones abiertas
          </p>
          <p className="text-xs text-muted-foreground">
            No tenés issues de corrección registrados por el docente en tu
            repositorio de GitHub.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Barra de búsqueda y selector de estado */}
          <PanelFilterBar
            searchTerm={busqueda}
            onSearchChange={setBusqueda}
            searchPlaceholder="Buscar por título, autor o #número..."
            count={issuesFiltrados.length}
            countLabel={issuesFiltrados.length === 1 ? "corrección" : "correcciones"}
          >
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="rounded-xl border border-line bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos los estados</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="ACTUALIZADO">Actualizados</option>
              <option value="RESUELTO">Resueltos</option>
            </select>
          </PanelFilterBar>

          {issuesFiltrados.length === 0 ? (
            <div className="p-8 rounded-xl border border-line/60 bg-panel2/40 text-center text-sm text-muted-foreground space-y-3">
              <p className="text-xs text-muted-foreground">
                No hay correcciones que coincidan con la búsqueda o el filtro seleccionado.
              </p>
              <button
                type="button"
                onClick={() => {
                  setBusqueda("");
                  setFiltroEstado("todos");
                }}
                className="rounded-xl border border-line bg-panel px-4 py-2 text-xs font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <div className="divide-y divide-line/60 rounded-xl border border-line bg-panel2/30 overflow-hidden text-sm">
              {issuesFiltrados.map((issue) => (
                <div
                  key={issue.numero}
                  className="p-4 hover:bg-line/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-muted-foreground">
                        #{issue.numero}
                      </span>
                      <a
                        href={issue.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-foreground hover:text-primary hover:underline wrap-break-word"
                      >
                        {issue.titulo}
                      </a>
                      <IssueEstadoBadge estado={issue.estado as EstadoIssue} />
                      {issue.tieneCommitsPosteriores && (
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          title="Tus commits en el repositorio son posteriores a la apertura de este issue"
                        >
                          <span>⚡ Commits posteriores detectados</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>Por @{issue.autor}</span>
                      <span>•</span>
                      <span>Creado: {formatFechaLegible(issue.fechaCreacion)}</span>
                      {issue.cantComentarios > 0 && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-foreground">
                            💬 {issue.cantComentarios} comentario(s)
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    <a
                      href={issue.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel2 px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-line/40 transition-colors shadow-2xs"
                    >
                      <img
                        src={githubIcon}
                        alt="GitHub"
                        className="w-3.5 h-3.5 opacity-80"
                      />
                      <span>Ver en GitHub</span>
                      <span className="text-muted-foreground text-[11px]">↗</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
