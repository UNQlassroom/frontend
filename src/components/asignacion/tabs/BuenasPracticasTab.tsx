import type { AsignacionAlumnoDTO } from "@/types";

interface BuenasPracticasTabProps {
  asignacion?: AsignacionAlumnoDTO;
}

export function BuenasPracticasTab({}: BuenasPracticasTabProps) {
  return (
    <section className="rounded-2xl border border-line bg-panel p-6 sm:p-7 shadow-xs space-y-4">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-line">
        <h2 className="font-mono text-xs uppercase tracking-wider font-semibold text-muted-foreground">
          Buenas Prácticas
        </h2>
        <div className="h-5 w-24 rounded-md bg-panel2 border border-line" />
      </div>

      <div className="rounded-xl border border-dashed border-line bg-panel2/40 p-6 space-y-3">
        <div className="h-4 w-1/3 rounded bg-line/60" />
        <div className="h-3 w-2/3 rounded bg-line/40" />
        <div className="h-3 w-1/2 rounded bg-line/40" />
      </div>
    </section>
  );
}
