import { useNavigate } from "react-router-dom";
import type { CursoResponseDTO } from "@/types";

interface Props {
  curso: CursoResponseDTO;
}

export function CursoCardAlumno({ curso }: Props) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/cursos/${curso.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="rounded-2xl border border-line bg-panel p-7 shadow-sm flex flex-col justify-between animate-rise hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer group"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Curso inscripto
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <h3 className="font-display text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
            {curso.materia}
          </h3>
          <span className="text-base text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            →
          </span>
        </div>
        <p className="mt-1.5 font-mono text-sm text-muted-foreground">
          Comisión {curso.comision} · Semestre {curso.semestre} · Año {curso.anio}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 font-mono text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
        >
          <span>Ver curso</span>
        </button>
      </div>
    </div>
  );
}
