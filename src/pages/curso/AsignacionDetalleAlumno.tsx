import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAsignacionDetalleAlumno } from "@/hooks";
import { ErrorBanner, ConfirmarReentregaModal } from "@/components";
import { GeneralTab } from "@/components/asignacion/tabs/GeneralTab";
import {
  EstadoTecnicoTab,
  type SubSeccionTecnica,
} from "@/components/asignacion/tabs/EstadoTecnicoTab";
import { CorreccionesAlumnoTab } from "@/components/asignacion/tabs/CorreccionesAlumnoTab";
import {
  esFechaLimiteVencida,
  formatFechaLegible,
  getBadgeEstadoEntrega,
} from "@/utils";
import githubIcon from "@/assets/github_favicon.svg";
import type { SeccionDetalle } from "@/types";

const subItemsTecnicos: { id: SubSeccionTecnica; label: string }[] = [
  { id: "ci", label: "Integración Continua (CI/CD)" },
  { id: "cobertura", label: "Cobertura y Tests" },
  { id: "git", label: "Buenas Prácticas" },
];

export const AsignacionDetalleAlumno = () => {
  const { cursoId, asignacionId } = useParams<{
    cursoId: string;
    asignacionId: string;
  }>();
  const cursoIdNum = cursoId ? parseInt(cursoId, 10) : undefined;
  const asignacionIdNum = asignacionId ? parseInt(asignacionId, 10) : undefined;

  const [searchParams, setSearchParams] = useSearchParams();

  // Leer estado de la URL
  const tabParam = searchParams.get("tab") as SeccionDetalle | null;
  const subParam = searchParams.get("sub") as SubSeccionTecnica | null;

  const seccionActiva: SeccionDetalle =
    tabParam === "tecnico" || tabParam === "correcciones" ? tabParam : "general";

  const subSeccionTecnica: SubSeccionTecnica =
    subParam === "cobertura" || subParam === "git" ? subParam : "ci";

  const [menuTecnicoOverride, setMenuTecnicoOverride] = useState<boolean | null>(
    null
  );

  // El menú técnico se mantiene abierto si la sección activa es 'tecnico' salvo que el usuario lo colapse manualmente
  const menuTecnicoAbierto =
    menuTecnicoOverride !== null
      ? menuTecnicoOverride
      : seccionActiva === "tecnico";

  const [copied, setCopied] = useState(false);
  const [modalReentregaOpen, setModalReentregaOpen] = useState(false);

  const {
    asignacion,
    username,
    isLoading,
    isRecargando,
    error,
    correccionGrupo,
    isLoadingCorrecciones,
    errorCorrecciones,
    diagnosticoCI,
    metricasCI,
    reporteLinter,
    isLoadingTecnico,
    entregando,
    cargarDetalle,
    entregar,
  } = useAsignacionDetalleAlumno(
    cursoIdNum,
    asignacionIdNum,
    seccionActiva,
    subSeccionTecnica
  );

  const handleCopyClone = (repoUrl: string) => {
    const cloneCmd = `git clone ${repoUrl}.git`;
    navigator.clipboard.writeText(cloneCmd).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    });
  };

  const handleEntregarInicial = async () => {
    const ok = await entregar();
    if (ok) {
      toast.success("Entrega realizada con éxito");
    }
  };

  const handleConfirmReentrega = async () => {
    const ok = await entregar();
    if (ok) {
      setModalReentregaOpen(false);
      toast.success("Reentrega realizada con éxito");
    }
  };

  const navegarSeccion = (tab: SeccionDetalle, sub?: SubSeccionTecnica) => {
    const params: Record<string, string> = { tab };
    if (tab === "tecnico") {
      params.sub = sub || subSeccionTecnica;
    }
    setSearchParams(params, { replace: true });
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12 flex-1 w-full">
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">
            Cargando detalle de la asignación...
          </p>
        </div>
      </main>
    );
  }

  if (error || !asignacion) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12 flex-1 w-full">
        <ErrorBanner
          className="max-w-lg mx-auto p-8"
          title="No se pudo cargar la asignación"
          message={
            error ||
            "La asignación solicitada no existe o no se encuentra disponible."
          }
          onRetry={() => void cargarDetalle(false)}
        >
          <Link
            to={`/cursos/${cursoId}`}
            className="rounded-lg border border-line bg-panel px-4 py-2 text-xs font-semibold text-foreground hover:bg-line/40 transition-colors"
          >
            ← Volver al Curso
          </Link>
        </ErrorBanner>
      </main>
    );
  }

  const badge = getBadgeEstadoEntrega(asignacion.estadoEntrega);
  const isVencida = esFechaLimiteVencida(asignacion.fechaLimite);
  const isActualizando =
    isRecargando || isLoadingCorrecciones || isLoadingTecnico;
  const cantIssues = correccionGrupo?.issues?.length ?? 0;
  const fechaEntregaVisible =
    asignacion.fechaEntregadaFormatted ||
    (asignacion.fechaEntregada
      ? formatFechaLegible(asignacion.fechaEntregada)
      : null);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 flex-1 w-full space-y-6 animate-rise">
      {/* Barra superior: Retorno al curso y botón de actualización */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to={`/cursos/${cursoId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">
            ←
          </span>
          <span>Volver al Curso</span>
        </Link>

        <button
          type="button"
          onClick={() => void cargarDetalle(true)}
          disabled={isActualizando}
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel2 px-4 py-2 text-sm font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
          title="Actualizar estado de la asignación y correcciones"
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
          <span>
            {isActualizando ? "Actualizando..." : "Actualizar asignación"}
          </span>
        </button>
      </div>

      {/* Encabezado Principal de la Asignación */}
      <header className="rounded-2xl border border-line bg-panel p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div className="space-y-2.5 flex-1 min-w-0">
            {/* Fila superior de metadatos unificada */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-panel2 px-2.5 py-0.5 font-semibold text-foreground">
                {asignacion.tipo === "GRUPAL" ? "Grupal" : "Individual"}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 font-semibold ${badge.classes}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                <span>{badge.label}</span>
              </span>

              {asignacion.fechaLimite && (
                <>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="inline-flex items-center gap-1">
                    <span>Fecha límite:</span>
                    <span
                      className={`font-semibold ${
                        isVencida && asignacion.estadoEntrega === "pendiente"
                          ? "text-destructive font-bold"
                          : "text-foreground"
                      }`}
                    >
                      {asignacion.fechaLimiteFormatted ||
                        formatFechaLegible(asignacion.fechaLimite)}
                    </span>
                  </span>
                </>
              )}

              {fechaEntregaVisible && (
                <>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="inline-flex items-center gap-1">
                    <span>Entregado el:</span>
                    <span className="font-semibold text-foreground">
                      {fechaEntregaVisible}
                    </span>
                  </span>
                </>
              )}
            </div>

            <h1 className="font-suez text-3xl sm:text-4xl tracking-tight text-foreground wrap-break-word">
              {asignacion.titulo}
            </h1>

            {asignacion.descripcion && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl whitespace-pre-wrap wrap-break-word pt-0.5">
                {asignacion.descripcion}
              </p>
            )}
          </div>

          {/* Acciones del Repositorio alineadas abajo a la altura de la descripción */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-end">
            {asignacion.repoUrl ? (
              <>
                <a
                  href={asignacion.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer shadow-2xs"
                  title="Abrir tu repositorio en GitHub"
                >
                  <img
                    src={githubIcon}
                    alt="GitHub"
                    className="w-4 h-4 opacity-80"
                  />
                  <span>Ver en GitHub</span>
                  <span className="text-muted-foreground text-xs">↗</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleCopyClone(asignacion.repoUrl!)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs ${
                    copied
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                      : "border-line bg-panel2 text-foreground hover:bg-line/40"
                  }`}
                  title={`Copiar al portapapeles: git clone ${asignacion.repoUrl}.git`}
                >
                  {copied ? (
                    <>
                      <svg
                        className="w-4 h-4 text-emerald-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <span>git clone</span>
                    </>
                  )}
                </button>

                {/* Tooltip: ¿Cómo clonar el repositorio? */}
                <div className="relative group/help inline-flex items-center">
                  <button
                    type="button"
                    aria-label="¿Cómo clonar este repositorio?"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-line bg-panel2 text-muted-foreground hover:text-foreground hover:bg-line/40 text-sm font-bold transition-colors cursor-help shadow-2xs"
                  >
                    ?
                  </button>

                  <div className="pointer-events-none group-hover/help:pointer-events-auto opacity-0 group-hover/help:opacity-100 group-hover/help:translate-y-0 translate-y-1 transition-all duration-150 absolute top-full mt-2 right-0 w-80 sm:w-92 rounded-xl border border-line bg-panel p-4.5 shadow-xl z-30 text-left text-xs text-foreground">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-line text-primary font-bold">
                      <span className="text-base">💡</span>
                      <span className="text-sm">
                        ¿Cómo clonar el repositorio?
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      Clonar descarga una copia completa del trabajo práctico a tu
                      computadora para que puedas empezar a programar.
                    </p>

                    <ol className="space-y-2 text-xs text-muted-foreground list-decimal list-inside leading-relaxed">
                      <li>
                        <span className="text-foreground font-semibold">
                          Copiá el comando
                        </span>{" "}
                        haciendo clic en{" "}
                        <span className="text-foreground bg-panel2 px-1.5 py-0.5 rounded border border-line font-medium">
                          git clone
                        </span>
                        .
                      </li>
                      <li>
                        <span className="text-foreground font-semibold">
                          Abrí una terminal
                        </span>{" "}
                        (Git Bash, PowerShell o terminal de VS Code) en la carpeta
                        donde guardás tus proyectos.
                      </li>
                      <li>
                        <span className="text-foreground font-semibold">
                          Pegá y ejecutá
                        </span>{" "}
                        el comando con{" "}
                        <kbd className="px-1.5 py-0.5 rounded bg-panel2 border border-line text-foreground font-mono text-[11px]">
                          Enter
                        </kbd>
                        :
                        <div className="mt-1.5 p-2.5 rounded-md bg-background border border-line font-mono text-xs text-primary truncate select-all">
                          git clone {asignacion.repoUrl}.git
                        </div>
                      </li>
                      <li>
                        <span className="text-foreground font-semibold">
                          ¡Listo!
                        </span>{" "}
                        Se creará la carpeta con los archivos para empezar a
                        trabajar.
                      </li>
                    </ol>
                  </div>
                </div>
              </>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-100 px-3.5 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
                <span>Creando repositorio en GitHub...</span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Navegación lateral (Sidebar) + Contenido de la sección activa */}
      <div
        className={`flex flex-col md:flex-row gap-6 items-start transition-all duration-300 ${
          isRecargando ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* Sidebar de Navegación */}
        <aside className="w-full md:w-72 shrink-0 rounded-2xl border border-line bg-panel p-3 shadow-xs">
          <nav
            className="flex flex-col gap-1.5"
            aria-label="Secciones de la asignación"
          >
            {/* Opción 1: General */}
            <button
              type="button"
              onClick={() => {
                navegarSeccion("general");
                setMenuTecnicoOverride(false);
              }}
              className={`flex items-center justify-between gap-2 w-full rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-left transition-colors cursor-pointer ${
                seccionActiva === "general"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-line/40"
              }`}
            >
              <span>General</span>
            </button>

            {/* Opción 2: Estado Técnico + 3 Mini-bars anidados */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  if (seccionActiva !== "tecnico") {
                    navegarSeccion("tecnico", subSeccionTecnica);
                    setMenuTecnicoOverride(true);
                  } else {
                    setMenuTecnicoOverride((prev) =>
                      prev !== null ? !prev : false
                    );
                  }
                }}
                className={`flex items-center justify-between gap-2 w-full rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-left transition-colors cursor-pointer ${
                  seccionActiva === "tecnico"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-line/40"
                }`}
              >
                <span>Estado Técnico</span>
                <span className="text-[11px] opacity-80">
                  {menuTecnicoAbierto ? "▾" : "▸"}
                </span>
              </button>

              {menuTecnicoAbierto && (
                <div className="ml-2.5 pl-2.5 border-l-2 border-line space-y-1 py-1 animate-rise">
                  {subItemsTecnicos.map((sub) => {
                    const isSubActive =
                      seccionActiva === "tecnico" &&
                      subSeccionTecnica === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          navegarSeccion("tecnico", sub.id);
                        }}
                        className={`flex items-center justify-between gap-2 w-full rounded-lg px-2.5 py-2 text-xs font-semibold text-left transition-colors cursor-pointer ${
                          isSubActive
                            ? "bg-line/70 text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-line/30"
                        }`}
                      >
                        <span className="whitespace-nowrap">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Opción 3: Correcciones en GitHub */}
            <button
              type="button"
              onClick={() => {
                navegarSeccion("correcciones");
                setMenuTecnicoOverride(false);
              }}
              className={`flex items-center justify-between gap-2 w-full rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-left transition-colors cursor-pointer ${
                seccionActiva === "correcciones"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-line/40"
              }`}
            >
              <span>Correcciones</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  seccionActiva === "correcciones"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-line/60 text-muted-foreground"
                }`}
              >
                {isLoadingCorrecciones ? "…" : cantIssues}
              </span>
            </button>
          </nav>
        </aside>

        {/* Contenedor de la pestaña activa con altura mínima estable para evitar saltos de scroll */}
        <div className="flex-1 w-full min-w-0 min-h-80">
          {seccionActiva === "general" && (
            <GeneralTab
              asignacion={asignacion}
              currentUsername={username}
              entregando={entregando}
              onEntregar={() => void handleEntregarInicial()}
              onAbrirModalReentrega={() => setModalReentregaOpen(true)}
              onVerBuenasPracticas={() => {
                navegarSeccion("tecnico", "git");
                setMenuTecnicoOverride(true);
              }}
            />
          )}

          {seccionActiva === "tecnico" && (
            <EstadoTecnicoTab
              subSeccionActiva={subSeccionTecnica}
              asignacion={asignacion}
              diagnosticoCI={diagnosticoCI}
              metricasCI={metricasCI}
              reporteLinter={reporteLinter}
              isLoadingTecnico={isLoadingTecnico}
            />
          )}

          {seccionActiva === "correcciones" && (
            <CorreccionesAlumnoTab
              repoUrl={asignacion.repoUrl}
              correccionGrupo={correccionGrupo}
              isLoading={isLoadingCorrecciones}
              error={errorCorrecciones}
            />
          )}
        </div>
      </div>

      {/* Modal de Confirmación de Reentrega */}
      <ConfirmarReentregaModal
        open={modalReentregaOpen}
        onClose={() => setModalReentregaOpen(false)}
        onConfirm={() => void handleConfirmReentrega()}
        asignacionTitulo={asignacion.titulo}
        repoNombre={asignacion.repoNombre}
        fechaEntregadaPrevia={asignacion.fechaEntregadaFormatted}
        fechaLimite={
          asignacion.fechaLimite
            ? asignacion.fechaLimiteFormatted ||
              formatFechaLegible(asignacion.fechaLimite)
            : undefined
        }
        isLoading={entregando}
      />
    </main>
  );
};
