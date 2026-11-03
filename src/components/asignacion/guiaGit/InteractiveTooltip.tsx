import { useState, useRef, useEffect, type ReactNode } from "react";

export interface InteractiveTooltipProps {
  content: ReactNode;
  title?: string;
  children?: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function InteractiveTooltip({
  content,
  title,
  children,
  position = "top",
  className = "",
}: InteractiveTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const positionClasses = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  }[position];

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center align-middle ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        aria-expanded={isOpen}
        aria-label={title ?? "Más información"}
        className="inline-flex items-center justify-center cursor-help focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full transition-transform active:scale-95"
      >
        {children ?? (
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/15 text-primary text-[10px] font-bold hover:bg-primary/25 transition-colors">
            ?
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className={`absolute ${positionClasses} z-40 w-72 max-w-[90vw] sm:w-80 rounded-xl border border-line bg-panel p-3.5 shadow-xl text-xs text-foreground animate-rise`}
        >
          {title && (
            <div className="flex items-center gap-1.5 font-bold text-foreground border-b border-line pb-1.5 mb-2">
              <svg
                className="w-3.5 h-3.5 text-primary shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span className="text-xs">{title}</span>
            </div>
          )}

          <div className="text-xs text-muted-foreground leading-relaxed">
            {typeof content === "string" ? (
              <div className="space-y-1.5">
                {content.split("\n").map((line, idx) => {
                  const trimmed = line.trim();
                  if (!trimmed) {
                    return <div key={idx} className="h-1" />;
                  }

                  // Detectar viñetas o numeraciones al inicio de la línea (ej: "• ...", "1. ...")
                  const bulletMatch = trimmed.match(/^([•\-*]|\d+\.)\s+(.*)$/);
                  if (bulletMatch) {
                    const [, marker, rest] = bulletMatch;
                    const colonIdx = rest.indexOf(":");
                    // Solo resaltar prefijo si es una viñeta tipo "• feat:" o "• feature/:" y no una oración con dos puntos
                    const isPrefixDef =
                      marker === "•" &&
                      colonIdx !== -1 &&
                      colonIdx < 30 &&
                      !rest.slice(0, colonIdx).includes("(") &&
                      !rest.slice(0, colonIdx).includes(",");

                    if (isPrefixDef) {
                      const prefix = rest.slice(0, colonIdx + 1);
                      const desc = rest.slice(colonIdx + 1);
                      return (
                        <div key={idx} className="flex items-start gap-1.5 text-left">
                          <span className="font-semibold text-primary shrink-0 select-none">
                            {marker}
                          </span>
                          <span className="flex-1">
                            <span className="font-semibold text-foreground">
                              {prefix}
                            </span>
                            {desc}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div key={idx} className="flex items-start gap-1.5 text-left">
                        <span className="font-semibold text-primary shrink-0 select-none">
                          {marker}
                        </span>
                        <span className="flex-1 text-muted-foreground">{rest}</span>
                      </div>
                    );
                  }

                  return (
                    <p key={idx} className="text-muted-foreground text-left">
                      {line}
                    </p>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1">{content}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
