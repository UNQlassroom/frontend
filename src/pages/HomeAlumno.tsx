import { useCursos } from "@/hooks";
import { CursoCardAlumno } from "@/components";

export const HomeAlumno = () => {
  const { cursos, isLoading, error, cargarCursos } = useCursos();

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 flex-1 w-full">
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-line">
        <div className="text-left">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Espacio del Alumno
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
            Cursos
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Accedé a tus cursos.
          </p>
        </div>

      </section>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-xs text-muted-foreground">
            Cargando tus cursos...
          </p>
        </div>
      )}

      {!isLoading && error && (
        <div className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive font-medium mb-3">{error}</p>
          <button
            type="button"
            onClick={cargarCursos}
            className="rounded-lg bg-destructive px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {!isLoading && !error && cursos.length === 0 && (
        <div className="mt-12 rounded-2xl border border-dashed border-line bg-panel p-12 text-center max-w-lg mx-auto">
          <div className="mx-auto w-12 h-12 rounded-full bg-line/40 flex items-center justify-center text-xl mb-4">
            📚
          </div>
          <h3 className="font-display text-lg font-bold text-foreground">
            No estás inscripto en ningún curso
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Esperá a que el docente te agregue a un curso.
          </p>
        </div>
      )}

      {!isLoading && !error && cursos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
          {cursos.map((c) => (
            <CursoCardAlumno key={c.id} curso={c} />
          ))}
        </div>
      )}
    </main>
  );
};
