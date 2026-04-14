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

export function jwtRoleIsAdmin(token) {
  const payload = parseJwtPayload(token);
  if (!payload) return null;
  const role = payload.role ?? payload.rol;
  if (role == null || role === "") return null;
  return String(role).toUpperCase() === "ADMIN";
}
