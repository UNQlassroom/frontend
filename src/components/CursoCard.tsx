import { useState } from "react";
import type { CursoResponseDTO } from "@/types";
import githubIcon from "@/assets/github_favicon.svg";
import circleAddIcon from "@/assets/circle_add_favicon.svg";
import { getGitHubTeamUrl } from "@/lib";
import { VerAlumnosModal } from "./VerAlumnosModal";
import { InvitarAlumnosModal } from "./InvitarAlumnosModal";

interface Props {
  curso: CursoResponseDTO;
}

export function CursoCard({ curso }: Props) {
  const [openAlumnosModal, setOpenAlumnosModal] = useState<boolean>(false);
  const [openInvitarModal, setOpenInvitarModal] = useState<boolean>(false);
  const githubTeamUrl = curso.githubTeamSlug
    ? getGitHubTeamUrl(curso.githubTeamSlug)
    : null;

  return (
    <>
      <div className="rounded-2xl border border-line bg-panel p-6 shadow-sm flex flex-col justify-between animate-rise">
        <div>
          <div className="flex items-start justify-between gap-2">
            {curso.githubTeamSlug && (
              <a
                href={githubTeamUrl ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-line bg-panel px-2 py-0.5 font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <img src={githubIcon} alt="GitHub" className="w-3.5 h-3.5 opacity-80" />
                <span>{curso.githubTeamSlug}</span>
              </a>
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
          <button
            type="button"
            onClick={() => setOpenAlumnosModal(true)}
            className="shrink-0 rounded-lg border border-line bg-panel2 px-3 py-1.5 font-mono text-xs font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer"
          >
            Ver alumnos
          </button>

          <button
            type="button"
            onClick={() => setOpenInvitarModal(true)}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel2 px-3 py-1.5 font-mono text-xs font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer"
            title="Invitar alumnos"
          >
            <img src={circleAddIcon} alt="Invitar" className="w-3.5 h-3.5 opacity-80" />
            <span>Invitar</span>
          </button>
        </div>
      </div>

      <VerAlumnosModal
        open={openAlumnosModal}
        onClose={() => setOpenAlumnosModal(false)}
        curso={curso}
      />

      <InvitarAlumnosModal
        open={openInvitarModal}
        onClose={() => setOpenInvitarModal(false)}
        curso={curso}
      />
    </>
  );
}
