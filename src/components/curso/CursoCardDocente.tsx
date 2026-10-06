import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type { CursoResponseDTO } from "@/types";
import circleAddIcon from "@/assets/circle_add_favicon.svg";
import { VerAlumnosModal } from "./VerAlumnosModal";
import { InvitarAlumnosModal } from "./InvitarAlumnosModal";

interface Props {
  curso: CursoResponseDTO;
}

export function CursoCardDocente({ curso }: Props) {
  const navigate = useNavigate();
  const [openAlumnosModal, setOpenAlumnosModal] = useState<boolean>(false);
  const [openInvitarModal, setOpenInvitarModal] = useState<boolean>(false);

  const handleCardClick = () => {
    navigate(`/cursos/${curso.id}`);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="rounded-2xl border border-line bg-panel p-7 shadow-sm flex flex-col justify-between animate-rise hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer group"
      >
        <div>
          <div className="flex items-start justify-between gap-2">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Curso activo
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

        <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenAlumnosModal(true);
              }}
              className="shrink-0 rounded-xl border border-line bg-panel2 px-4 py-2 font-mono text-sm font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer"
            >
              Ver Alumnos
            </button>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenInvitarModal(true);
            }}
            className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-line bg-panel2 px-4 py-2 font-mono text-sm font-semibold text-foreground hover:bg-line/40 transition-colors cursor-pointer"
            title="Invitar alumnos"
          >
            <img src={circleAddIcon} alt="Invitar" className="w-4 h-4 opacity-80" />
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
