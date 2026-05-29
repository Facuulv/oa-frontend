/** Mensaje genérico cuando falla el envío del email de recuperación. */
export const FORGOT_PASSWORD_GENERIC_ERROR =
  "No pudimos enviar el email de recuperación. Intentá nuevamente más tarde.";

const FORGOT_PASSWORD_SAFE_ERROR_CODES = new Set([
  "EMAIL_SEND_FAILED",
  "EMAIL_CONFIG_ERROR",
  "FORGOT_PASSWORD_UNAVAILABLE",
]);

const TECHNICAL_FORGOT_PASSWORD_PATTERNS = [
  /invalid login/i,
  /username and password/i,
  /badcredentials/i,
  /eauth/i,
  /smtp/i,
  /\b535\b/,
  /support\.google\.com/i,
  /auth plain/i,
];

/** @param {string} message */
export function isTechnicalForgotPasswordError(message) {
  if (typeof message !== "string" || !message.trim()) return false;
  return TECHNICAL_FORGOT_PASSWORD_PATTERNS.some((pattern) => pattern.test(message));
}

/**
 * Mensaje seguro para mostrar al usuario en forgot-password.
 * @param {unknown} data
 * @param {number} [status]
 */
export function forgotPasswordUserMessage(data, status = 500) {
  const fallback = "No pudimos procesar tu solicitud";

  if (data && typeof data === "object") {
    const code = typeof data.code === "string" ? data.code : "";
    if (FORGOT_PASSWORD_SAFE_ERROR_CODES.has(code)) {
      return FORGOT_PASSWORD_GENERIC_ERROR;
    }
  }

  if (typeof status === "number" && status >= 500) {
    return FORGOT_PASSWORD_GENERIC_ERROR;
  }

  const raw = apiErrorMessage(data, fallback);
  if (isTechnicalForgotPasswordError(raw)) {
    return FORGOT_PASSWORD_GENERIC_ERROR;
  }

  return raw;
}

/** Mensaje legible desde cuerpo JSON de error de la API (auth y afines). */
export function apiErrorMessage(data, fallback) {
  if (!data || typeof data !== "object") return fallback;
  const m = data.message;
  if (typeof m === "string" && m.trim()) return m.trim();
  if (Array.isArray(m) && m.length) {
    const parts = m.filter((x) => typeof x === "string").map((x) => x.trim());
    if (parts.length) return parts.join("; ");
  }
  if (typeof data.error === "string" && data.error.trim()) return data.error.trim();
  return fallback;
}
