import type { CursoResponseDTO } from "@/types";
import githubIcon from "@/assets/github_favicon.svg";
import { getGitHubRepoUrl } from "@/lib";

interface Props {
  curso: CursoResponseDTO;
}

export function CursoCardAlumno({ curso }: Props) {
  const githubRepoUrl = curso.githubRepoName
  ? getGitHubRepoUrl(curso.githubRepoName)
  : null;

  return (
    <div className="rounded-2xl border border-line bg-panel p-6 shadow-sm flex flex-col justify-between animate-rise hover:border-foreground/20 transition-colors">
      <div>
        <div className="flex items-start justify-between gap-2">
          {curso.githubRepoName ? (
            <a
              href={githubRepoUrl ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-line bg-panel px-2 py-0.5 font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <img src={githubIcon} alt="GitHub" className="w-3.5 h-3.5 opacity-80" />
              <span>{curso.githubRepoName}</span>
            </a>
          ) : (
            <span className="font-mono text-[10px] text-muted-foreground uppercase">
              Sin repositorio del curso
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

      <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between gap-2">
        <a
          href={githubRepoUrl ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel2 px-3 py-1.5 font-mono text-xs font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer"
        >
          <img src={githubIcon} alt="GitHub" className="w-3.5 h-3.5 opacity-80" />
          <span>Mi repositorio</span>
        </a>
      </div>
    </div>
  );
}
