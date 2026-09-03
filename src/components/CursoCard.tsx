import type { CursoResponseDTO } from "@/types";
import githubIcon from "@/assets/github_favicon.svg";

interface Props {
  curso: CursoResponseDTO;
}

export function CursoCard({ curso }: Props) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-6 shadow-sm flex flex-col justify-between animate-rise">
      <div>
        <div className="flex items-start justify-between gap-2">
          {curso.githubTeamSlug && (
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
              <img src={githubIcon} alt="GitHub" className="w-3.5 h-3.5 opacity-80" />
              <span>{curso.githubTeamSlug}</span>
            </span>
          )}
        </div>

        <h3 className="mt-4 font-display text-xl font-bold tracking-tight text-foreground">
          {curso.materia}
        </h3>
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          Comisión {curso.comision} · Semestre {curso.semestre} · Año {curso.anio}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-line/60">
        <p className="font-mono text-[11px] text-muted-foreground">
          {curso.descripcion}
        </p>
      </div>
    </div>
  );
}
