export const API_ERROR_CODES = [
  "AUTH_INVALID_CREDENTIALS",
  "AUTH_REQUIRED",
  "SESSION_EXPIRED",
  "SESSION_REVOKED",
  "ACCESS_EXPIRED",
  "ACCOUNT_SUSPENDED",
  "ACCOUNT_REVOKED",
  "ADMIN_REQUIRED",
  "RESOURCE_NOT_FOUND",
  "VALIDATION_FAILED",
  "RATE_LIMITED",
  "IDEMPOTENCY_CONFLICT",
  "RESOURCE_CONFLICT",
  "BUSINESS_RULE_VIOLATION",
  "VIEWER_UNAVAILABLE",
  "PAYLOAD_TOO_LARGE",
  "UNSUPPORTED_MEDIA_TYPE",
  "INTERNAL_ERROR",
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export type ApiFieldError = {
  field: string;
  code: string;
};

export type ApiProblem = {
  type: string;
  title: string;
  status: number;
  code: ApiErrorCode;
  request_id: string;
  errors?: ApiFieldError[];
  retry_after_seconds?: number;
};

export type ApiErrorView = {
  title: string;
  message: string;
  action: "login" | "contact" | "retry" | "back" | "none";
  state: "error" | "unauthenticated" | "expired" | "suspended" | "revoked" | "forbidden";
  retryable: boolean;
  requestId?: string;
};

const FALLBACK_VIEW: Omit<ApiErrorView, "requestId"> = {
  title: "No pudimos completar la operación",
  message: "Intentá nuevamente. Si el problema continúa, compartí el código de solicitud con soporte.",
  action: "retry",
  state: "error",
  retryable: true,
};

const ERROR_VIEWS: Record<ApiErrorCode, Omit<ApiErrorView, "requestId">> = {
  AUTH_INVALID_CREDENTIALS: {
    title: "No pudimos iniciar sesión",
    message: "Revisá tus datos e intentá nuevamente.",
    action: "retry",
    state: "unauthenticated",
    retryable: true,
  },
  AUTH_REQUIRED: {
    title: "Necesitás iniciar sesión",
    message: "Ingresá nuevamente para continuar.",
    action: "login",
    state: "unauthenticated",
    retryable: false,
  },
  SESSION_EXPIRED: {
    title: "Tu sesión venció",
    message: "Ingresá nuevamente para continuar de forma segura.",
    action: "login",
    state: "expired",
    retryable: false,
  },
  SESSION_REVOKED: {
    title: "Esta sesión fue cerrada",
    message: "Ingresá nuevamente. Si no reconocés este cierre, contactá al administrador.",
    action: "login",
    state: "revoked",
    retryable: false,
  },
  ACCESS_EXPIRED: {
    title: "Tu acceso está vencido",
    message: "Contactá al administrador para renovar tu acceso.",
    action: "contact",
    state: "expired",
    retryable: false,
  },
  ACCOUNT_SUSPENDED: {
    title: "Tu cuenta está suspendida",
    message: "Contactá al administrador para revisar el estado de tu cuenta.",
    action: "contact",
    state: "suspended",
    retryable: false,
  },
  ACCOUNT_REVOKED: {
    title: "Tu acceso fue revocado",
    message: "Contactá al administrador si necesitás más información.",
    action: "contact",
    state: "revoked",
    retryable: false,
  },
  ADMIN_REQUIRED: {
    title: "No tenés permiso para esta acción",
    message: "Esta sección está disponible únicamente para administradores.",
    action: "back",
    state: "forbidden",
    retryable: false,
  },
  RESOURCE_NOT_FOUND: {
    title: "No encontramos este contenido",
    message: "Puede que ya no esté disponible o que no tengas acceso.",
    action: "back",
    state: "error",
    retryable: false,
  },
  VALIDATION_FAILED: {
    title: "Revisá los datos ingresados",
    message: "Hay campos que necesitan corrección.",
    action: "none",
    state: "error",
    retryable: false,
  },
  RATE_LIMITED: {
    title: "Demasiados intentos",
    message: "Esperá un momento antes de volver a intentar.",
    action: "retry",
    state: "error",
    retryable: true,
  },
  IDEMPOTENCY_CONFLICT: {
    title: "No pudimos confirmar la operación",
    message: "Actualizá los datos antes de volver a intentarlo.",
    action: "retry",
    state: "error",
    retryable: true,
  },
  RESOURCE_CONFLICT: {
    title: "Los datos cambiaron",
    message: "Actualizá la pantalla y revisá el estado actual.",
    action: "retry",
    state: "error",
    retryable: true,
  },
  BUSINESS_RULE_VIOLATION: {
    title: "La operación no está permitida",
    message: "Revisá el estado actual antes de continuar.",
    action: "back",
    state: "error",
    retryable: false,
  },
  VIEWER_UNAVAILABLE: {
    title: "El material no está disponible ahora",
    message: "Puede estar procesándose. Intentá nuevamente en unos minutos.",
    action: "retry",
    state: "error",
    retryable: true,
  },
  PAYLOAD_TOO_LARGE: {
    title: "El archivo supera el límite permitido",
    message: "Seleccioná un archivo más pequeño.",
    action: "none",
    state: "error",
    retryable: false,
  },
  UNSUPPORTED_MEDIA_TYPE: {
    title: "El formato del archivo no es válido",
    message: "Seleccioná un PDF válido.",
    action: "none",
    state: "error",
    retryable: false,
  },
  INTERNAL_ERROR: FALLBACK_VIEW,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isApiErrorCode(value: unknown): value is ApiErrorCode {
  return typeof value === "string" && API_ERROR_CODES.some((code) => code === value);
}

export function parseApiProblem(value: unknown): ApiProblem | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.type !== "string" ||
    typeof value.title !== "string" ||
    typeof value.status !== "number" ||
    !isApiErrorCode(value.code) ||
    typeof value.request_id !== "string"
  ) return null;

  return value as ApiProblem;
}

export function apiProblemToView(value: unknown): ApiErrorView {
  const problem = parseApiProblem(value);
  if (!problem) return { ...FALLBACK_VIEW };

  return apiErrorCodeToView(problem.code, problem.request_id);
}

export function apiErrorCodeToView(code: ApiErrorCode, requestId?: string): ApiErrorView {
  return {
    ...ERROR_VIEWS[code],
    ...(requestId ? { requestId } : {}),
  };
}
