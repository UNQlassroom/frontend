import { useState } from "react";
import { useCursos } from "@/hooks";
import { CrearCursoModal } from "@/components";
import { CursoCard } from "@/components";
import type { CrearCursoFormData } from "@/types";

export const HomeProfesor = () => {
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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header superior */}
      <header className="border-b border-line bg-panel px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-lg tracking-tight">UNQlassroom</span>
          <span className="rounded-md border border-line px-2 py-0.5 font-mono text-[10px] uppercase text-muted-foreground">
            Profesor
          </span>
        </div>
      </header>

      {/* Contenido principal: texto a la izquierda y botón a la derecha */}
      <main className="mx-auto max-w-6xl px-6 py-12 flex-1 w-full">
        <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-line">
          <div className="text-left">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Archivador General
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
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



        {/* Modal de creación */}
        <CrearCursoModal
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onCreate={handleCreate}
          isLoading={isLoading}
          serverError={error}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 m-4">
          {cursos.map((c) => (
              <CursoCard key={c.id} curso={c} />
          ))}
        </div>

      </main>
    </div>
  );
};