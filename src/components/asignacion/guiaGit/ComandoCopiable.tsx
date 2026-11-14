import { useState, type ReactNode } from "react";
import { InteractiveTooltip } from "./InteractiveTooltip";

export interface FlagExplicacion {
  flag: string;
  explicacion: string;
}

export interface ComandoCopiableProps {
  comando: string;
  descripcion?: string;
  explicacionTooltip?: ReactNode;
  tituloTooltip?: string;
  flags?: FlagExplicacion[];
  className?: string;
}

export function ComandoCopiable({
  comando,
  descripcion,
  explicacionTooltip,
  tituloTooltip,
  flags = [],
  className = "",
}: ComandoCopiableProps) {
  const [copiado, setCopiado] = useState(false);

  const handleCopiar = () => {
    navigator.clipboard.writeText(comando).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  return (
    <div className={`space-y-2 rounded-xl border border-line bg-panel2/60 p-3.5 ${className}`}>
      {descripcion && (
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-medium text-foreground">{descripcion}</span>
          {explicacionTooltip && (
            <InteractiveTooltip
              title={tituloTooltip ?? "¿Para qué sirve este comando?"}
              content={explicacionTooltip}
              position="top"
            />
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-background px-3 py-2 font-mono text-xs">
        <code className="text-primary truncate select-all">{comando}</code>

        <button
          type="button"
          onClick={handleCopiar}
          className={`shrink-0 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer border ${
            copiado
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-line bg-panel hover:bg-line/40 text-foreground"
          }`}
          title="Copiar comando al portapapeles"
        >
          {copiado ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span>¡Copiado!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>

      {flags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-muted-foreground font-medium">Parámetros:</span>
          {flags.map((item) => (
            <div key={item.flag} className="inline-flex items-center gap-1">
              <span className="rounded bg-panel border border-line px-1.5 py-0.5 font-mono text-[11px] text-foreground font-semibold">
                {item.flag}
              </span>
              <InteractiveTooltip
                title={`Parámetro ${item.flag}`}
                content={item.explicacion}
                position="top"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
