import { useState } from "react";
import { useCursos } from "@/hooks";
import { CrearCursoModal, CursoCardDocente } from "@/components";
import type { CrearCursoFormData } from "@/types";

export const HomeDocente = () => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const { isLoading, error, crearNuevoCurso, limpiarEstado, cursos } = useCursos();

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
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Archivador General
          </p>
          <h1 className="mt-2 font-suez text-4xl tracking-tight">
            Cursos
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gestioná tus cursos en un solo lugar.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenDialog}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-sm shrink-0 self-start sm:self-auto"
        >
          + Crear curso
        </button>
      </section>

      {!isLoading && !error && cursos.length === 0 && (
          <div className="mt-12 rounded-2xl border border-dashed border-line bg-panel p-12 text-center max-w-lg mx-auto">
            <div className="mx-auto w-12 h-12 rounded-full bg-line/40 flex items-center justify-center text-xl mb-4">
              📚
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">
              No gestionás ningún curso
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Crealo desde el botón "Crear curso" para empezar a organizar tus clases.
            </p>
          </div>
      )}

      {/* Modal de creación */}
      <CrearCursoModal
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onCreate={handleCreate}
        isLoading={isLoading}
        serverError={error}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
        {cursos.map((c) => (
          <CursoCardDocente key={c.id} curso={c} />
        ))}
      </div>
    </main>
  );
};
