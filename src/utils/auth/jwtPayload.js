/**
 * Best-effort JWT payload parse (no signature verification).
 * Used by middleware for role hints; real authorization remains on the API.
 */
export function parseJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    let b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4;
    if (pad) b64 += "=".repeat(4 - pad);
    const json = atob(b64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Alineado con `JWT_TOKEN_USE.INTERNAL_USER` en el backend OA!. */
const JWT_INTERNAL_USER = "internal_user";

/** Roles con acceso a rutas `/admin/*` en el front (VENDEDOR queda fuera del panel). */
const PANEL_ACCESS_ROLES = new Set(["ADMIN", "ENCARGADO"]);

/**
 * `true` si el JWT de la cookie admin corresponde a personal del panel (no cliente tienda).
 * @returns {boolean|null} `null` si no se pudo interpretar el token.
 */
export function jwtAllowsAdminPanel(token) {
  const payload = parseJwtPayload(token);
  if (!payload) return null;
  if (payload.tu !== JWT_INTERNAL_USER) return false;
  const role = payload.role ?? payload.rol;
  if (role == null || role === "") return false;
  return PANEL_ACCESS_ROLES.has(String(role).toUpperCase());
}

/** Solo rol ADMIN en el JWT (pistas de UI; la API valida permisos). */
export function jwtRoleIsAdmin(token) {
  const payload = parseJwtPayload(token);
  if (!payload) return null;
  const role = payload.role ?? payload.rol;
  if (role == null || role === "") return null;
  return String(role).toUpperCase() === "ADMIN";
}
