import apiClient from "./apiClient";
import { apiPaths } from "@/config/apiPaths";
import { apiErrorFromAxios } from "@/utils/api/apiError";
import { sanitizeUsuario } from "@/services/adminUsuariosService";

/** Códigos de error del perfil propio del staff. */
export const ADMIN_PROFILE_CODES = {
  USER_NOT_FOUND: "USER_NOT_FOUND",
  USER_INACTIVE: "USER_INACTIVE",
  EMAIL_EXISTS: "EMAIL_EXISTS",
  DNI_EXISTS: "DNI_EXISTS",
  NO_FIELDS: "NO_FIELDS",
  CURRENT_PASSWORD_INVALID: "CURRENT_PASSWORD_INVALID",
};

/**
 * @template T
 * @param {() => Promise<{ data: unknown }>} fn
 * @returns {Promise<T>}
 */
async function request(fn) {
  try {
    return await fn();
  } catch (e) {
    throw apiErrorFromAxios(e);
  }
}

/**
 * @returns {Promise<object|null>}
 */
export async function getAdminProfile() {
  const { data } = await request(() => apiClient.get(apiPaths.admin.usuariosMe));
  return sanitizeUsuario(data?.data ?? data);
}

/**
 * @param {object} payload
 * @returns {Promise<object|null>}
 */
export async function patchAdminProfile(payload) {
  const { data } = await request(() => apiClient.patch(apiPaths.admin.usuariosMe, payload));
  return sanitizeUsuario(data?.data ?? data);
}

/**
 * @param {{ currentPassword: string, newPassword: string, confirmPassword: string }} payload
 * @returns {Promise<object|null>}
 */
export async function changeAdminOwnPassword(payload) {
  const { data } = await request(() =>
    apiClient.patch(apiPaths.admin.usuariosMePassword, payload)
  );
  return sanitizeUsuario(data?.data ?? data);
}
