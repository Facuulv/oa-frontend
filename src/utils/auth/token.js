import { AUTH_TOKEN_COOKIE_MAX_AGE, AUTH_TOKEN_KEY } from "@/utils/auth/constants";

export { AUTH_TOKEN_KEY };

const LEGACY_LS_KEY = AUTH_TOKEN_KEY;

function clearAuthCookieMirror() {
  if (typeof document === "undefined") return;
  try {
    document.cookie = `${AUTH_TOKEN_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
  } catch {
    // silent
  }
}

/**
 * Limpia restos de la sesión basada en token en cliente (localStorage / cookie espejo).
 * La sesión HttpOnly de cliente la invalida `POST /clientes/logout` en el backend.
 */
export function clearLegacyClientToken() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LEGACY_LS_KEY);
  } catch {
    // silent
  }
  clearAuthCookieMirror();
}

/**
 * @deprecated La app usa sesión por cookie HttpOnly; no leer token en render ni usar como fuente de verdad.
 * Se mantiene por compatibilidad con datos viejos en localStorage (migración).
 */
export function getToken() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LEGACY_LS_KEY);
  } catch {
    return null;
  }
}

/** @deprecated El login fija la cookie vía `Set-Cookie` del backend. */
export function setToken(token) {
  if (typeof window === "undefined" || !token) return;
  try {
    window.localStorage.setItem(LEGACY_LS_KEY, token);
    const enc = encodeURIComponent(token);
    const secure = window.location?.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${AUTH_TOKEN_KEY}=${enc}; Path=/; Max-Age=${AUTH_TOKEN_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
  } catch {
    // silent
  }
}

/** Limpia almacenamiento legado en cliente (localStorage + cookie no HttpOnly). */
export function removeToken() {
  clearLegacyClientToken();
}
