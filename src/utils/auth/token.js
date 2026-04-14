import { AUTH_TOKEN_COOKIE_MAX_AGE, AUTH_TOKEN_KEY } from "@/utils/auth/constants";

export { AUTH_TOKEN_KEY };

function writeAuthCookie(token) {
  if (typeof document === "undefined") return;
  try {
    const enc = encodeURIComponent(token);
    const secure = typeof window !== "undefined" && window.location?.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${AUTH_TOKEN_KEY}=${enc}; Path=/; Max-Age=${AUTH_TOKEN_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
  } catch {
    // silent
  }
}

function clearAuthCookie() {
  if (typeof document === "undefined") return;
  try {
    document.cookie = `${AUTH_TOKEN_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
  } catch {
    // silent
  }
}

export function getToken() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  if (!token) {
    removeToken();
    return;
  }
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    writeAuthCookie(token);
  } catch {
    // silent
  }
}

export function removeToken() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    clearAuthCookie();
  } catch {
    // silent
  }
}

/** Call on app load if the session exists in localStorage but the cookie is missing. */
export function syncTokenToCookie() {
  const t = getToken();
  if (t) writeAuthCookie(t);
  else clearAuthCookie();
}
