import { NOMBRE_MAX_LENGTH, formatearNombreCompleto } from "@/utils";

export interface DatosPersonalesInputsProps {
  idPrefix?: string;
  nombre: string;
  setNombre: (value: string) => void;
  apellido: string;
  setApellido: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  dni: string;
  setDni: (value: string) => void;
  disabled?: boolean;
  onFieldChange?: () => void;
}

export function DatosPersonalesInputs({
  idPrefix = "usuario",
  nombre,
  setNombre,
  apellido,
  setApellido,
  email,
  setEmail,
  dni,
  setDni,
  disabled = false,
  onFieldChange,
}: DatosPersonalesInputsProps) {
  const trimmedNombre = nombre.trim();
  const trimmedApellido = apellido.trim();

  const previewLength =
    trimmedApellido && trimmedNombre
      ? formatearNombreCompleto(trimmedNombre, trimmedApellido).length
      : 0;
  const isExceeded = previewLength > NOMBRE_MAX_LENGTH;

  const handleChange = (setter: (val: string) => void, val: string) => {
    setter(val);
    onFieldChange?.();
  };

  return (
    <div className="space-y-3">
      {/* Fila 1: Nombre y Apellido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Nombre/s */}
        <div className="space-y-1.5">
          <label
            htmlFor={`${idPrefix}-nombre-input`}
            className="text-xs uppercase tracking-wider font-semibold text-muted-foreground"
          >
            Nombre/s
          </label>
          <input
            id={`${idPrefix}-nombre-input`}
            data-testid={`${idPrefix}-nombre-input`}
            type="text"
            disabled={disabled}
            autoFocus
            maxLength={NOMBRE_MAX_LENGTH}
            placeholder="Ingresá tu nombre"
            value={nombre}
            onChange={(e) => handleChange(setNombre, e.target.value)}
            className="w-full rounded-xl border border-line bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
          />
        </div>

        {/* Apellido/s con contador */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor={`${idPrefix}-apellido-input`}
              className="text-xs uppercase tracking-wider font-semibold text-muted-foreground"
            >
              Apellido/s
            </label>
            <span
              className={`tabular-nums text-[11px] font-medium ${
                isExceeded ? "text-rose-500 font-bold" : "text-muted-foreground"
              }`}
            >
              {previewLength} / {NOMBRE_MAX_LENGTH}
            </span>
          </div>
          <input
            id={`${idPrefix}-apellido-input`}
            data-testid={`${idPrefix}-apellido-input`}
            type="text"
            disabled={disabled}
            maxLength={NOMBRE_MAX_LENGTH}
            placeholder="Ingresá tu apellido"
            value={apellido}
            onChange={(e) => handleChange(setApellido, e.target.value)}
            className="w-full rounded-xl border border-line bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* Fila 2: Correo Electrónico y DNI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Correo Electrónico */}
        <div className="space-y-1.5">
          <label
            htmlFor={`${idPrefix}-email-input`}
            className="text-xs uppercase tracking-wider font-semibold text-muted-foreground"
          >
            Correo electrónico
          </label>
          <input
            id={`${idPrefix}-email-input`}
            data-testid={`${idPrefix}-email-input`}
            type="email"
            disabled={disabled}
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(e) => handleChange(setEmail, e.target.value)}
            className="w-full rounded-xl border border-line bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
          />
        </div>

        {/* DNI */}
        <div className="space-y-1.5">
          <label
            htmlFor={`${idPrefix}-dni-input`}
            className="text-xs uppercase tracking-wider font-semibold text-muted-foreground"
          >
            DNI
          </label>
          <input
            id={`${idPrefix}-dni-input`}
            data-testid={`${idPrefix}-dni-input`}
            type="text"
            inputMode="numeric"
            maxLength={8}
            disabled={disabled}
            placeholder="Ingresá tu DNI"
            value={dni}
            onChange={(e) =>
              handleChange(setDni, e.target.value.replace(/\D/g, ""))
            }
            className="w-full rounded-xl border border-line bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
          />
        </div>
      </div>
    </div>
  );
}
