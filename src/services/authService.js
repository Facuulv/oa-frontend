import { apiPaths } from "@/config/apiPaths";
import { requireApiBaseUrl } from "@/utils/api/baseUrl";
import { logApiRequest } from "@/utils/api/requestLog";
import { getToken } from "@/utils/auth/token";
import { ApiError, flattenValidationErrors } from "@/utils/api/apiError";

function apiErrorMessage(data, fallback) {
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

export async function login({ email, password, remember = false }) {
  const base = requireApiBaseUrl();
  const url = `${base}${apiPaths.auth.login}`;
  logApiRequest("POST", url, { email });
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, remember }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(apiErrorMessage(data, "Credenciales inválidas"));
  }

  return data;
}

export async function register({ nombre, apellido, email, password }) {
  const base = requireApiBaseUrl();
  const url = `${base}${apiPaths.auth.register}`;
  const body = {
    nombre: (nombre ?? "").trim(),
    apellido: (apellido ?? "").trim(),
    email: (email ?? "").trim(),
    password,
  };

  logApiRequest("POST", url, { email: body.email });
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const fieldErrors = flattenValidationErrors(data);
    const msg = apiErrorMessage(data, "Error al registrarse");
    throw new ApiError(msg, { fieldErrors, status: response.status, body: data });
  }

  return data;
}

/**
 * Sesión actual (usuario autenticado). Usa Bearer desde `getToken()` si no pasás token.
 */
export async function me(token) {
  const t = token ?? getToken();
  if (!t) {
    throw new Error("No autenticado");
  }
  const base = requireApiBaseUrl();
  const url = `${base}${apiPaths.auth.me}`;
  logApiRequest("GET", url);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${t}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(apiErrorMessage(data, "Error al obtener perfil"));
  }

  return data;
}

/** @deprecated Usar `me`. */
export const getProfile = me;
