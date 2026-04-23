/**
 * Cookie HttpOnly de sesión admin tras `POST /auth/login` cuando la identidad es ADMIN
 * (`ADMIN_SESSION_COOKIE_NAME` en el API; por defecto `oa_admin_token`).
 * El middleware de Next debe usar el mismo nombre para ver la sesión en el origen de la app.
 */
export const ADMIN_SESSION_COOKIE_NAME = "oa_admin_token";

/**
 * Clave legada (localStorage / cookie espejo en cliente). No es la cookie HttpOnly del admin.
 */
export const AUTH_TOKEN_KEY = "oa-auth-token";

/** Max-Age para cookie espejo legada en cliente (solo si el backend no usa HttpOnly). */
export const AUTH_TOKEN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
