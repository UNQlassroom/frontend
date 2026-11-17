export const NOMBRE_MAX_LENGTH = 35;

/**
 * Expresión regular que admite letras (con tildes, ñ, ü en mayúsculas y minúsculas),
 * espacios intermedios, apóstrofes y guiones.
 */
export const NOMBRE_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;

export interface ValidacionNombreResult {
  valido: boolean;
  error: string | null;
}

export interface ValidacionCampoResult {
  valido: boolean;
  error: string | null;
}

/**
 * Da formato estándar "Apellido/s, Nombre/s" a partir de las dos partes.
 */
export const formatearNombreCompleto = (
  nombre?: string | null,
  apellido?: string | null
): string => {
  const n = nombre?.trim();
  const a = apellido?.trim();
  if (a && n) return `${a}, ${n}`;
  if (a) return a;
  if (n) return n;
  return "";
};

/**
 * Desglosa un nombreCompleto ("Apellido, Nombre") para precargar los inputs.
 */
export const desglosarNombreCompleto = (
  nombreCompleto?: string | null
): { nombre: string; apellido: string } => {
  if (!nombreCompleto || !nombreCompleto.trim()) {
    return { nombre: "", apellido: "" };
  }
  const trimmed = nombreCompleto.trim();
  if (trimmed.includes(",")) {
    const [apellidoPart, ...rest] = trimmed.split(",");
    return {
      apellido: apellidoPart.trim(),
      nombre: rest.join(",").trim(),
    };
  }
  // Fallback si por algún motivo no incluye coma
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { nombre: parts[0], apellido: "" };
  }
  const apellido = parts.pop() || "";
  const nombre = parts.join(" ");
  return { nombre, apellido };
};

/**
 * Valida nombre y apellido por separado y comprueba el límite de longitud combinada.
 */
export const validarNombreYApellido = (
  nombre: string,
  apellido: string
): ValidacionNombreResult => {
  const trimmedNombre = nombre.trim();
  const trimmedApellido = apellido.trim();

  if (!trimmedNombre) {
    return {
      valido: false,
      error: "Por favor, ingresá tu nombre.",
    };
  }

  if (!trimmedApellido) {
    return {
      valido: false,
      error: "Por favor, ingresá tu apellido.",
    };
  }

  if (!NOMBRE_REGEX.test(trimmedNombre)) {
    return {
      valido: false,
      error:
        "El nombre contiene caracteres inválidos. Solo se permiten letras, espacios, guiones y apóstrofes.",
    };
  }

  if (!NOMBRE_REGEX.test(trimmedApellido)) {
    return {
      valido: false,
      error:
        "El apellido contiene caracteres inválidos. Solo se permiten letras, espacios, guiones y apóstrofes.",
    };
  }

  const nombreCompleto = formatearNombreCompleto(trimmedNombre, trimmedApellido);
  if (nombreCompleto.length > NOMBRE_MAX_LENGTH) {
    return {
      valido: false,
      error: `El nombre y apellido combinados no pueden superar los ${NOMBRE_MAX_LENGTH} caracteres (actualmente ${nombreCompleto.length}).`,
    };
  }

  return { valido: true, error: null };
};

/**
 * Valida que el email contenga '@' y termine en '.com' o '.com.ar'.
 */
export const validarEmail = (email: string): ValidacionCampoResult => {
  const trimmed = email.trim();
  if (!trimmed) {
    return {
      valido: false,
      error: "Por favor, ingresá tu correo electrónico.",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.(com|com\.ar)$/i;
  if (!emailRegex.test(trimmed)) {
    return {
      valido: false,
      error: "El email ingresado no es válido.",
    };
  }

  return { valido: true, error: null };
};

/**
 * Valida que el DNI sea numérico y contenga entre 7 y 8 dígitos.
 */
export const validarDni = (dni: string): ValidacionCampoResult => {
  const trimmed = dni.trim();
  if (!trimmed) {
    return {
      valido: false,
      error: "Por favor, ingresá tu DNI.",
    };
  }

  const dniRegex = /^\d{7,8}$/;
  if (!dniRegex.test(trimmed)) {
    return {
      valido: false,
      error: "El DNI ingresado no es válido.",
    };
  }

  return { valido: true, error: null };
};

/**
 * Valida de forma secuencial todos los datos personales del usuario:
 * Nombre y Apellido -> Correo Electrónico -> DNI.
 */
export const validarDatosUsuario = (
  nombre: string,
  apellido: string,
  email: string,
  dni: string
): ValidacionCampoResult => {
  const vNombre = validarNombreYApellido(nombre, apellido);
  if (!vNombre.valido) return vNombre;

  const vEmail = validarEmail(email);
  if (!vEmail.valido) return vEmail;

  const vDni = validarDni(dni);
  if (!vDni.valido) return vDni;

  return { valido: true, error: null };
};
