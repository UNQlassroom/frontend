import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Archive } from "lucide-react";
import { useCursos } from "@/hooks";
import { CrearCursoModal, CursoCardDocente, ErrorBanner } from "@/components";
import type { CrearCursoFormData } from "@/types";

export const HomeDocente = () => {
  const [searchParams] = useSearchParams();
  const verArchivados = searchParams.get("archivados") === "true";

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const {
    isLoading,
    error,
    crearNuevoCurso,
    limpiarEstado,
    cursos,
    cargarCursos,
  } = useCursos(verArchivados);

  const handleCreate = async (formData: CrearCursoFormData) => {
    const cursoCreado = await crearNuevoCurso(formData);
    if (cursoCreado) {
      setOpenDialog(false);
    }
  };

  const handleOpenDialog = () => {
    limpiarEstado();
    setOpenDialog(true);
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 flex-1 w-full">
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-line">
        <div className="text-left">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">
            Archivador General
          </p>
          <h1 className="mt-2 font-suez text-4xl sm:text-5xl tracking-tight">
            {verArchivados ? "Cursos Archivados" : "Cursos"}
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            {verArchivados
              ? "Consultá el historial de cursos de semestres anteriores."
              : "Gestioná tus cursos en un solo lugar."}
          </p>
        </div>

        {!verArchivados && (
          <button
            type="button"
            onClick={handleOpenDialog}
            className="rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-sm shrink-0 self-start sm:self-auto"
          >
            + Crear curso
          </button>
        )}
      </section>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">
            {verArchivados
              ? "Cargando cursos archivados..."
              : "Cargando tus cursos..."}
          </p>
        </div>
      )}

      {!isLoading && error && (
        <ErrorBanner message={error} onRetry={cargarCursos} className="mt-8" />
      )}

      {!isLoading && !error && cursos.length === 0 && (
        <div className="mt-12 rounded-2xl border border-dashed border-line bg-panel p-12 text-center max-w-lg mx-auto">
          {verArchivados ? (
            <>
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Archive className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">
                No tenés cursos archivados
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Cuando archives cursos de semestres anteriores, aparecerán acá para que puedas seguir consultando su historial.
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto w-12 h-12 rounded-full bg-line/40 flex items-center justify-center text-xl mb-4">
                📚
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">
                No gestionás ningún curso
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Crealo desde el botón "Crear curso" para empezar a organizar tus clases.
              </p>
            </>
          )}
        </div>
      )}

      {/* Modal de creación */}
      {!verArchivados && (
        <CrearCursoModal
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onCreate={handleCreate}
          isLoading={isLoading}
        />
      )}

      {!isLoading && !error && cursos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
          {cursos.map((c) => (
            <CursoCardDocente
              key={c.id}
              curso={verArchivados ? { ...c, archivado: true } : c}
            />
          ))}
        </div>
      )}
    </main>
  );
};
