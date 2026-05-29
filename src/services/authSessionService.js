import { apiPaths } from "@/config/apiPaths";
import { requireApiBaseUrl } from "@/utils/api/baseUrl";
import { logApiRequest } from "@/utils/api/requestLog";
import { ApiError, flattenValidationErrors } from "@/utils/api/apiError";
import { apiErrorMessage, forgotPasswordUserMessage } from "@/services/authApiHelpers";

/** `POST /auth/login` — cookie HttpOnly admin o cliente según identidad. */
export async function authLogin({ email, password }) {
  const base = requireApiBaseUrl();
  const url = `${base}${apiPaths.auth.login}`;
  logApiRequest("POST", url, { email });
  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(apiErrorMessage(data, "Credenciales inválidas"));
  }

  if (!data || data.ok !== true) {
    throw new Error(apiErrorMessage(data, "No pudimos iniciar sesión"));
  }

  return data;
}

/** `GET /auth/me` — sesión admin o cliente según cookies. */
export async function authMe() {
  const base = requireApiBaseUrl();
  const url = `${base}${apiPaths.auth.me}`;
  logApiRequest("GET", url);
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(apiErrorMessage(data, "Error al obtener perfil"), {
      status: response.status,
      body: data,
    });
  }

  return data;
}

/** `POST /auth/logout` — borra cookies de sesión admin y cliente. */
export async function authLogout() {
  const base = requireApiBaseUrl();
  const url = `${base}${apiPaths.auth.logout}`;
  logApiRequest("POST", url);
  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const data = await response.text().then((t) => {
      try {
        return JSON.parse(t);
      } catch {
        return {};
      }
    });
    throw new Error(apiErrorMessage(data, "Error al cerrar sesión"));
  }
}

/** `POST /auth/register` — alta cliente; cookie si `useCookie`. */
export async function authRegisterCliente({
  nombre,
  apellido,
  dni,
  email,
  password,
  telefono,
  useCookie = true,
}) {
  const base = requireApiBaseUrl();
  const url = `${base}${apiPaths.auth.register}`;
  const body = {
    nombre: (nombre ?? "").trim(),
    apellido: (apellido ?? "").trim(),
    dni: String(dni ?? "").trim(),
    email: (email ?? "").trim(),
    password,
    useCookie,
    ...(telefono != null && String(telefono).trim() ? { telefono: String(telefono).trim() } : {}),
  };

  logApiRequest("POST", url, { email: body.email });
  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const fieldErrors = flattenValidationErrors(data);
    const code = typeof data?.code === "string" ? data.code : undefined;
    const msg = apiErrorMessage(data, "Error al registrarse");
    throw new ApiError(msg, { fieldErrors, status: response.status, body: data, code });
  }

  return data;
}

/** `POST /auth/forgot-password` — respuesta genérica para evitar enumeración de emails. */
export async function authForgotPassword({ email }) {
  const base = requireApiBaseUrl();
  const url = `${base}${apiPaths.auth.forgotPassword}`;
  const body = { email: (email ?? "").trim() };

  logApiRequest("POST", url, { email: body.email });
  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const fieldErrors = flattenValidationErrors(data);
    const code = typeof data.code === "string" ? data.code : undefined;
    const msg = forgotPasswordUserMessage(data, response.status);
    throw new ApiError(msg, { fieldErrors, status: response.status, body: data, code });
  }

  return data;
}

/** `POST /auth/reset-password` — aplica nueva contraseña para token válido/no vencido. */
export async function authResetPassword({ token, password }) {
  const base = requireApiBaseUrl();
  const url = `${base}${apiPaths.auth.resetPassword}`;
  const body = { token: (token ?? "").trim(), password };

  logApiRequest("POST", url);
  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const fieldErrors = flattenValidationErrors(data);
    const msg = apiErrorMessage(data, "No pudimos restablecer tu contraseña");
    throw new ApiError(msg, { fieldErrors, status: response.status, body: data });
  }

  return data;
}
