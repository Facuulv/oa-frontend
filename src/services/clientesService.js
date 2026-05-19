import { apiPaths } from "@/config/apiPaths";
import { requireApiBaseUrl } from "@/utils/api/baseUrl";
import { logApiRequest } from "@/utils/api/requestLog";
import { ApiError, flattenValidationErrors } from "@/utils/api/apiError";
import { apiErrorMessage } from "@/services/authApiHelpers";

export const CLIENTE_ERROR_CODES = {
  DNI_EXISTS: "DNI_EXISTS",
};

function notifyClientUnauthorized(status) {
  if (status === 401 && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
  }
}

function usuarioFromPayload(data) {
  if (!data || typeof data !== "object") return null;
  return data.usuario ?? data.user ?? null;
}

/**
 * `PATCH /clientes/me` — actualiza perfil del cliente logueado.
 * @param {{ nombre?: string, apellido?: string, telefono?: string|null, dni?: string, fecha_nacimiento?: string|null }} body
 */
export async function patchClienteProfile(body) {
  const base = requireApiBaseUrl();
  const url = `${base}${apiPaths.clientes.me}`;
  logApiRequest("PATCH", url);

  const response = await fetch(url, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  notifyClientUnauthorized(response.status);

  if (!response.ok) {
    const fieldErrors = flattenValidationErrors(data);
    const code = typeof data?.code === "string" ? data.code : undefined;
    const msg = apiErrorMessage(data, "No pudimos guardar tu perfil");
    throw new ApiError(msg, { fieldErrors, status: response.status, body: data, code });
  }

  return {
    ...data,
    usuario: usuarioFromPayload(data),
  };
}
