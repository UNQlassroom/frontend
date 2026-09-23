import { useState } from "react";
import type { AsignacionDTO, CursoResponseDTO } from "@/types";
import { CrearAsignacionModal } from "./CrearAsignacionModal";
import circleAddIcon from "@/assets/circle_add_favicon.svg";
import githubIcon from "@/assets/github_favicon.svg";

interface AsignacionesTabProps {
  curso: CursoResponseDTO;
}

const EJEMPLOS_ASIGNACIONES: AsignacionDTO[] = [
  {
    id: "1",
    titulo: "TP1 - Modelado de Objetos y Clases",
    descripcion:
      "Implementar la jerarquía de clases y reglas de negocio del dominio asignado aplicando principios SOLID.",
    fechaEntrega: "2026-10-15",
    repoPlantilla: "unqlassroom-templates/tp1-oop-base",
    estado: "activa",
    entregasCount: 14,
    totalAlumnos: 20,
  },
  {
    id: "2",
    titulo: "TP2 - Persistencia y Base de Datos",
    descripcion:
      "Mapear entidades relacionales y persistir el modelo en PostgreSQL usando Hibernate/JPA.",
    fechaEntrega: "2026-11-20",
    repoPlantilla: "unqlassroom-templates/tp2-persistence-base",
    estado: "borrador",
    entregasCount: 0,
    totalAlumnos: 20,
  },
];

export function AsignacionesTab({ curso }: AsignacionesTabProps) {
  const [asignaciones, setAsignaciones] = useState<AsignacionDTO[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreate = (nueva: AsignacionDTO) => {
    setAsignaciones((prev) => [nueva, ...prev]);
  };

  const handleDelete = (id: string | number) => {
    setAsignaciones((prev) => prev.filter((a) => a.id !== id));
  };

  const handleCargarEjemplos = () => {
    setAsignaciones(EJEMPLOS_ASIGNACIONES);
  };

  const handleLimpiar = () => {
    setAsignaciones([]);
  };

  return (
    <div className="space-y-6 animate-rise">
      {/* Barra superior de asignaciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-panel p-4 rounded-xl border border-line">
        <div>
          <h3 className="font-display text-base font-bold text-foreground">
            Trabajos Prácticos y Asignaciones
          </h3>
          <p className="font-mono text-xs text-muted-foreground mt-0.5">
            Materia: {curso.materia} · Comisión {curso.comision}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {asignaciones.length > 0 ? (
            <button
              type="button"
              onClick={handleLimpiar}
              className="rounded-lg border border-line bg-background px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Restablecer para ver el empty state"
            >
              Ver estado vacío
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCargarEjemplos}
              className="rounded-lg border border-line bg-background px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Cargar ejemplos para visualizar listado"
            >
              Cargar ejemplos
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-mono text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-sm shrink-0"
          >
            <img src={circleAddIcon} alt="Crear" className="w-3.5 h-3.5 invert opacity-90" />
            <span>Crear Asignación</span>
          </button>
        </div>
      </div>

      {/* Empty state solicitado en el requerimiento */}
      {asignaciones.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-panel p-12 text-center max-w-xl mx-auto my-8 animate-rise">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-line/40 border border-line flex items-center justify-center text-2xl mb-4 text-foreground shadow-xs">
            📋
          </div>
          <h3 className="font-display text-xl font-bold text-foreground tracking-tight">
            No hay asignaciones creadas
          </h3>
          <p className="mt-2 font-mono text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
            Aún no se han configurado trabajos prácticos en este curso. Creá una asignación para asociar un repositorio plantilla y que los estudiantes comiencen sus entregas.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-mono text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
            >
              <img src={circleAddIcon} alt="Crear" className="w-3.5 h-3.5 invert opacity-90" />
              <span>Crear Asignación</span>
            </button>
            <button
              type="button"
              onClick={handleCargarEjemplos}
              className="rounded-lg border border-line bg-panel2 px-4 py-2.5 font-mono text-xs text-foreground hover:bg-line/40 transition-colors cursor-pointer"
            >
              Cargar datos demo
            </button>
          </div>
        </div>
      ) : (
        /* Listado de asignaciones maquetado */
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {asignaciones.map((asig) => (
            <div
              key={asig.id}
              className="rounded-2xl border border-line bg-panel p-5 shadow-xs flex flex-col justify-between hover:border-foreground/20 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium ${
                      asig.estado === "activa"
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : "bg-line/60 text-muted-foreground border border-line"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        asig.estado === "activa" ? "bg-emerald-500" : "bg-muted-foreground"
                      }`}
                    />
                    {asig.estado === "activa" ? "En curso" : "Borrador"}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDelete(asig.id)}
                    className="text-muted-foreground hover:text-destructive font-mono text-xs p-1 cursor-pointer"
                    title="Eliminar asignación"
                  >
                    ✕
                  </button>
                </div>

                <h4 className="font-display text-lg font-bold text-foreground">
                  {asig.titulo}
                </h4>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {asig.descripcion}
                </p>

                {asig.repoPlantilla && (
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-line bg-panel2 px-2.5 py-1 font-mono text-[11px] text-foreground">
                    <img src={githubIcon} alt="Repo" className="w-3.5 h-3.5 opacity-80" />
                    <span className="text-muted-foreground">Plantilla:</span>
                    <span className="font-semibold">{asig.repoPlantilla}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-line/70 flex items-center justify-between font-mono text-xs">
                <div className="text-muted-foreground text-[11px]">
                  {asig.fechaEntrega ? (
                    <span>
                      Fecha límite:{" "}
                      <strong className="text-foreground">{asig.fechaEntrega}</strong>
                    </span>
                  ) : (
                    <span>Sin fecha límite definida</span>
                  )}
                </div>

                {asig.totalAlumnos !== undefined && asig.totalAlumnos > 0 ? (
                  <span className="text-[11px] text-muted-foreground">
                    Entregas:{" "}
                    <strong className="text-foreground">
                      {asig.entregasCount ?? 0}/{asig.totalAlumnos}
                    </strong>
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para crear asignación */}
      <CrearAsignacionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
