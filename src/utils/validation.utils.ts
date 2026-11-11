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

export const validarNombreCompleto = (
  nombre: string
): ValidacionNombreResult => {
  const trimmed = nombre.trim();
  if (!trimmed) {
    return {
      valido: false,
      error: "El nombre y apellido no puede estar vacío.",
    };
  }
  if (trimmed.length > NOMBRE_MAX_LENGTH) {
    return {
      valido: false,
      error: `El nombre no puede exceder los ${NOMBRE_MAX_LENGTH} caracteres.`,
    };
  }
  if (!NOMBRE_REGEX.test(trimmed)) {
    return {
      valido: false,
      error:
        "El nombre contiene caracteres inválidos. Solo se permiten letras, espacios, guiones y apóstrofes.",
    };
  }
  return { valido: true, error: null };
};
