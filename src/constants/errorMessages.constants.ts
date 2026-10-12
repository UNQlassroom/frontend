import type { ErrorSeverity } from "@/types";

export interface ErrorDefinition {
  message: string;
  severity: ErrorSeverity;
}

export const BACKEND_ERROR_CODES = {
  // Cursos
  CURSO_DUPLICADO: "CURSO_DUPLICADO",
  CURSO_NOT_FOUND: "CURSO_NOT_FOUND",
  CURSO_SIN_GITHUB_REPO_ASOCIADO: "CURSO_SIN_GITHUB_REPO_ASOCIADO",
  NOMBRE_MATERIA_VACIO: "NOMBRE_MATERIA_VACIO",
  ANIO_CURSO_INVALIDO: "ANIO_CURSO_INVALIDO",
  SEMESTRE_INVALIDO: "SEMESTRE_INVALIDO",
  COMISION_INVALIDA: "COMISION_INVALIDA",

  // Asignaciones y Grupos
  ASIGNACION_DUPLICADA: "ASIGNACION_DUPLICADA",
  ASIGNACION_NOT_FOUND: "ASIGNACION_NOT_FOUND",
  ASIGNACION_VENCIDA: "ASIGNACION_VENCIDA",
  ASIGNACION_GRUPAL_SIN_GRUPOS: "ASIGNACION_GRUPAL_SIN_GRUPOS",
  ASIGNACION_INDIVIDUAL_CON_GRUPOS: "ASIGNACION_INDIVIDUAL_CON_GRUPOS",
  FECHA_LIMITE_INVALIDA: "FECHA_LIMITE_INVALIDA",
  CALIFICACION_INVALIDA: "CALIFICACION_INVALIDA",
  NOMBRE_GRUPO_DUPLICADO: "NOMBRE_GRUPO_DUPLICADO",
  NOMBRE_GRUPO_VACIO: "NOMBRE_GRUPO_VACIO",
  GRUPO_SIN_INTEGRANTES: "GRUPO_SIN_INTEGRANTES",
  GRUPO_NO_PERTENECE_A_ASIGNACION: "GRUPO_NO_PERTENECE_A_ASIGNACION",
  GRUPO_ID_REQUERIDO_PARA_DOCENTE: "GRUPO_ID_REQUERIDO_PARA_DOCENTE",
  ALUMNO_EN_MULTIPLES_GRUPOS: "ALUMNO_EN_MULTIPLES_GRUPOS",
  ALUMNOS_NO_INSCRIPTOS: "ALUMNOS_NO_INSCRIPTOS",
  USUARIO_NO_PERTENECE_A_GRUPO: "USUARIO_NO_PERTENECE_A_GRUPO",

  // Permisos y Usuarios
  UNAUTHORIZED: "UNAUTHORIZED",
  ACCESS_DENIED: "ACCESS_DENIED",
  USUARIO_NOT_FOUND: "USUARIO_NOT_FOUND",
  USUARIO_NO_ES_DOCENTE: "USUARIO_NO_ES_DOCENTE",
  NO_ES_DOCENTE_DEL_CURSO: "NO_ES_DOCENTE_DEL_CURSO",
  SIN_PERMISO_ACCESO_CURSO: "SIN_PERMISO_ACCESO_CURSO",
  SIN_PERMISO_ACCESO_ASIGNACION: "SIN_PERMISO_ACCESO_ASIGNACION",
  SIN_PERMISO_ACCESO_CORRECCIONES: "SIN_PERMISO_ACCESO_CORRECCIONES",
  SIN_PERMISO_ENTREGA: "SIN_PERMISO_ENTREGA",
  SIN_PERMISO_ENTREGA_OTRO_GRUPO: "SIN_PERMISO_ENTREGA_OTRO_GRUPO",

  // Integración GitHub
  GITHUB_REPO_ALREADY_EXISTS: "GITHUB_REPO_ALREADY_EXISTS",
  GITHUB_RATE_LIMIT_EXCEEDED: "GITHUB_RATE_LIMIT_EXCEEDED",
  GITHUB_SERVICE_UNAVAILABLE: "GITHUB_SERVICE_UNAVAILABLE",
  GITHUB_OAUTH_ERROR: "GITHUB_OAUTH_ERROR",
  GITHUB_UNAUTHORIZED: "GITHUB_UNAUTHORIZED",
  GITHUB_FORBIDDEN: "GITHUB_FORBIDDEN",
  GITHUB_TEMPLATE_REPO_NOT_FOUND: "GITHUB_TEMPLATE_REPO_NOT_FOUND",
  GITHUB_REPO_NOT_FOUND: "GITHUB_REPO_NOT_FOUND",
  GITHUB_RESOURCE_NOT_FOUND: "GITHUB_RESOURCE_NOT_FOUND",
  GITHUB_USER_NOT_FOUND: "GITHUB_USER_NOT_FOUND",
  GITHUB_USERS_NOT_FOUND: "GITHUB_USERS_NOT_FOUND",
  GITHUB_VALIDATION_ERROR: "GITHUB_VALIDATION_ERROR",
  GITHUB_API_ERROR: "GITHUB_API_ERROR",

  // Framework / Sistema
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_ARGUMENT: "INVALID_ARGUMENT",
  INVALID_REQUEST_BODY: "INVALID_REQUEST_BODY",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

export type BackendErrorCode =
  (typeof BACKEND_ERROR_CODES)[keyof typeof BACKEND_ERROR_CODES];

export const ERROR_MESSAGES: Record<string, ErrorDefinition> = {
  // Cursos
  [BACKEND_ERROR_CODES.CURSO_DUPLICADO]: {
    message: "Ya existe un curso registrado con esa materia, año y comisión.",
    severity: "warning",
  },
  [BACKEND_ERROR_CODES.CURSO_NOT_FOUND]: {
    message: "El curso solicitado no existe.",
    severity: "error",
  },
  [BACKEND_ERROR_CODES.CURSO_SIN_GITHUB_REPO_ASOCIADO]: {
    message: "El curso no tiene un repositorio de GitHub asociado.",
    severity: "warning",
  },
  [BACKEND_ERROR_CODES.NOMBRE_MATERIA_VACIO]: {
    message: "El nombre de la materia no puede estar vacío.",
    severity: "warning",
  },
  [BACKEND_ERROR_CODES.ANIO_CURSO_INVALIDO]: {
    message: "El año del curso es inválido.",
    severity: "warning",
  },
  [BACKEND_ERROR_CODES.SEMESTRE_INVALIDO]: {
    message: "El semestre debe ser 1 o 2.",
    severity: "warning",
  },
  [BACKEND_ERROR_CODES.COMISION_INVALIDA]: {
    message: "El número de comisión debe ser mayor a 0.",
    severity: "warning",
  },

  // Asignaciones y Grupos
  [BACKEND_ERROR_CODES.ASIGNACION_DUPLICADA]: {
    message: "Ya existe una asignación con ese título en este curso.",
    severity: "warning",
  },
  [BACKEND_ERROR_CODES.ASIGNACION_NOT_FOUND]: {
    message: "La asignación solicitada no existe.",
    severity: "error",
  },
  [BACKEND_ERROR_CODES.ASIGNACION_VENCIDA]: {
    message: "La fecha límite de la asignación ya venció.",
    severity: "warning",
  },
  [BACKEND_ERROR_CODES.ASIGNACION_GRUPAL_SIN_GRUPOS]: {
    message: "Debe definir al menos un grupo para una asignación grupal.",
    severity: "warning",
  },
  [BACKEND_ERROR_CODES.ASIGNACION_INDIVIDUAL_CON_GRUPOS]: {
    message: "Una asignación individual no puede contener grupos.",
    severity: "warning",
  },
  [BACKEND_ERROR_CODES.FECHA_LIMITE_INVALIDA]: {
    message: "La fecha límite no puede ser anterior a la fecha actual.",
    severity: "warning",
  },
  [BACKEND_ERROR_CODES.CALIFICACION_INVALIDA]: {
    message: "La calificación debe ser un valor entre 1 y 10.",
    severity: "warning",
  },
  [BACKEND_ERROR_CODES.NOMBRE_GRUPO_DUPLICADO]: {
    message: "No puede haber dos grupos con el mismo nombre en la asignación.",
    severity: "warning",
  },
  [BACKEND_ERROR_CODES.NOMBRE_GRUPO_VACIO]: {
    message: "El nombre del grupo no puede estar vacío.",
    severity: "warning",
  },
  [BACKEND_ERROR_CODES.GRUPO_SIN_INTEGRANTES]: {
    message: "Todos los grupos deben tener al menos un integrante.",
    severity: "warning",
  },
  [BACKEND_ERROR_CODES.GRUPO_NO_PERTENECE_A_ASIGNACION]: {
    message: "El grupo indicado no pertenece a esta asignación.",
    severity: "error",
  },
  [BACKEND_ERROR_CODES.GRUPO_ID_REQUERIDO_PARA_DOCENTE]: {
    message: "Debe especificar el grupo a calificar o entregar.",
    severity: "warning",
  },
  [BACKEND_ERROR_CODES.ALUMNO_EN_MULTIPLES_GRUPOS]: {
    message: "Un alumno no puede pertenecer a más de un grupo en la misma asignación.",
    severity: "warning",
  },
  [BACKEND_ERROR_CODES.ALUMNOS_NO_INSCRIPTOS]: {
    message: "Hay alumnos seleccionados que no están inscriptos en el curso.",
    severity: "warning",
  },
  [BACKEND_ERROR_CODES.USUARIO_NO_PERTENECE_A_GRUPO]: {
    message: "No pertenecés al grupo correspondiente para realizar esta acción.",
    severity: "warning",
  },

  // Permisos y Usuarios
  [BACKEND_ERROR_CODES.UNAUTHORIZED]: {
    message: "Tu sesión ha expirado o no estás autenticado.",
    severity: "error",
  },
  [BACKEND_ERROR_CODES.ACCESS_DENIED]: {
    message: "No tenés permisos suficientes para realizar esta acción.",
    severity: "error",
  },
  [BACKEND_ERROR_CODES.USUARIO_NOT_FOUND]: {
    message: "Usuario no encontrado.",
    severity: "error",
  },
  [BACKEND_ERROR_CODES.USUARIO_NO_ES_DOCENTE]: {
    message: "Se requieren permisos de docente para esta acción.",
    severity: "error",
  },
  [BACKEND_ERROR_CODES.NO_ES_DOCENTE_DEL_CURSO]: {
    message: "Solo el docente a cargo del curso puede realizar esta operación.",
    severity: "error",
  },
  [BACKEND_ERROR_CODES.SIN_PERMISO_ACCESO_CURSO]: {
    message: "No tenés acceso a este curso.",
    severity: "error",
  },
  [BACKEND_ERROR_CODES.SIN_PERMISO_ACCESO_ASIGNACION]: {
    message: "No tenés acceso a esta asignación.",
    severity: "error",
  },
  [BACKEND_ERROR_CODES.SIN_PERMISO_ACCESO_CORRECCIONES]: {
    message: "No tenés permisos para ver las correcciones de esta asignación.",
    severity: "error",
  },
  [BACKEND_ERROR_CODES.SIN_PERMISO_ENTREGA]: {
    message: "No estás habilitado para realizar entregas en esta asignación.",
    severity: "error",
  },
  [BACKEND_ERROR_CODES.SIN_PERMISO_ENTREGA_OTRO_GRUPO]: {
    message: "No podés realizar entregas en nombre de otro grupo.",
    severity: "error",
  },

  // Integración GitHub
  [BACKEND_ERROR_CODES.GITHUB_REPO_ALREADY_EXISTS]: {
    message: "Ya existe un repositorio con ese nombre en GitHub.",
    severity: "warning",
  },
  [BACKEND_ERROR_CODES.GITHUB_RATE_LIMIT_EXCEEDED]: {
    message: "Se superó el límite de GitHub. Aguardá unos minutos y reintentá.",
    severity: "warning",
  },
  [BACKEND_ERROR_CODES.GITHUB_SERVICE_UNAVAILABLE]: {
    message: "GitHub se encuentra caído o en mantenimiento temporal.",
    severity: "error",
  },
  [BACKEND_ERROR_CODES.GITHUB_OAUTH_ERROR]: {
    message: "No se pudo iniciar sesión con GitHub. Por favor, reintentá.",
    severity: "error",
  },
  [BACKEND_ERROR_CODES.GITHUB_UNAUTHORIZED]: {
    message: "Credenciales de GitHub inválidas o desactualizadas en el servidor.",
    severity: "error",
  },
  [BACKEND_ERROR_CODES.GITHUB_FORBIDDEN]: {
    message: "La aplicación no tiene permisos suficientes en la organización de GitHub.",
    severity: "error",
  },
  [BACKEND_ERROR_CODES.GITHUB_TEMPLATE_REPO_NOT_FOUND]: {
    message: "El repositorio plantilla indicado no existe en GitHub.",
    severity: "error",
  },
  [BACKEND_ERROR_CODES.GITHUB_REPO_NOT_FOUND]: {
    message: "El repositorio indicado no fue encontrado en GitHub.",
    severity: "error",
  },
  [BACKEND_ERROR_CODES.GITHUB_RESOURCE_NOT_FOUND]: {
    message: "El recurso solicitado en GitHub no existe.",
    severity: "error",
  },
  [BACKEND_ERROR_CODES.GITHUB_USER_NOT_FOUND]: {
    message: "El usuario indicado no existe en GitHub.",
    severity: "warning",
  },
  [BACKEND_ERROR_CODES.GITHUB_USERS_NOT_FOUND]: {
    message: "Uno o más usuarios indicados no existen en GitHub.",
    severity: "warning",
  },
  [BACKEND_ERROR_CODES.GITHUB_VALIDATION_ERROR]: {
    message: "Parámetros inválidos para la operación en GitHub.",
    severity: "warning",
  },
  [BACKEND_ERROR_CODES.GITHUB_API_ERROR]: {
    message: "Error inesperado al comunicarse con GitHub.",
    severity: "error",
  },

  // Framework / Sistema
  [BACKEND_ERROR_CODES.VALIDATION_ERROR]: {
    message: "Por favor, revisá los campos del formulario.",
    severity: "warning",
  },
  [BACKEND_ERROR_CODES.INVALID_ARGUMENT]: {
    message: "Parámetro de solicitud inválido.",
    severity: "warning",
  },
  [BACKEND_ERROR_CODES.INVALID_REQUEST_BODY]: {
    message: "El cuerpo de la solicitud no tiene el formato esperado.",
    severity: "warning",
  },
  [BACKEND_ERROR_CODES.INTERNAL_SERVER_ERROR]: {
    message: "Ocurrió un error interno en el servidor.",
    severity: "error",
  },
};
