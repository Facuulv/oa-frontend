import apiClient from "./apiClient";
import { apiPaths } from "@/config/apiPaths";
import { apiErrorFromAxios } from "@/utils/api/apiError";

/** Campos públicos del backend; nunca incluir `password_hash` ni `username`. */
const USUARIO_PUBLIC_KEYS = [
  "id",
  "nombre",
  "apellido",
  "dni",
  "email",
  "telefono",
  "rol",
  "activo",
  "fecha_creacion",
  "fecha_modificacion",
];

/** Códigos de error OA! para usuarios admin (`/users`). */
export const ADMIN_USUARIO_CODES = {
  USER_NOT_FOUND: "USER_NOT_FOUND",
  EMAIL_EXISTS: "EMAIL_EXISTS",
  DNI_EXISTS: "DNI_EXISTS",
  LAST_ACTIVE_ADMIN_DEACTIVATE: "LAST_ACTIVE_ADMIN_DEACTIVATE",
  LAST_ACTIVE_ADMIN_ROLE: "LAST_ACTIVE_ADMIN_ROLE",
  SELF_DEACTIVATE_FORBIDDEN: "SELF_DEACTIVATE_FORBIDDEN",
  NO_FIELDS: "NO_FIELDS",
};

/**
 * @param {unknown} row
 * @returns {object|null}
 */
export function sanitizeUsuario(row) {
  if (!row || typeof row !== "object") return null;
  const out = {};
  for (const k of USUARIO_PUBLIC_KEYS) {
    if (Object.prototype.hasOwnProperty.call(row, k)) {
      out[k] = row[k];
    }
  }
  return Object.keys(out).length ? out : null;
}

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
 * @param {object} params
 * @param {number} [params.page]
 * @param {number} [params.limit]
 * @param {string} [params.q]
 * @param {string} [params.rol] ADMIN | ENCARGADO | VENDEDOR
 * @param {'0'|'1'|undefined} [params.activo] filtro estado (query del backend)
 * @returns {Promise<{ usuarios: object[], pagination: object }>}
 */
export async function listUsuarios(params = {}) {
  const query = { ...params };
  if (query.activo === undefined || query.activo === null || query.activo === "") {
    delete query.activo;
  }
  const { data } = await request(() => apiClient.get(apiPaths.admin.usuarios, { params: query }));
  const raw = data?.data;
  const list = Array.isArray(raw) ? raw.map((r) => sanitizeUsuario(r)).filter(Boolean) : [];
  const pag = data?.pagination && typeof data.pagination === "object" ? data.pagination : {};
  return {
    usuarios: list,
    pagination: {
      page: Number(pag.page) > 0 ? Number(pag.page) : Number(query.page) || 1,
      limit: Number(pag.limit) > 0 ? Number(pag.limit) : Number(query.limit) || 20,
      total: Number.isFinite(Number(pag.total)) && Number(pag.total) >= 0 ? Number(pag.total) : 0,
    },
  };
}

/**
 * @param {string|number} id
 * @returns {Promise<object|null>}
 */
export async function getUsuario(id) {
  const { data: body } = await request(() => apiClient.get(apiPaths.admin.usuarioById(id)));
  return sanitizeUsuario(body?.data ?? body);
}

/**
 * @typedef {object} CrearUsuarioPayload
 * @property {string} nombre
 * @property {string} apellido
 * @property {string} email
 * @property {string} password
 * @property {string} rol
 * @property {string|null} [dni]
 * @property {string|null} [telefono]
 */

/**
 * @param {CrearUsuarioPayload} data
 * @returns {Promise<object|null>}
 */
export async function createUsuario(data) {
  const { data: body } = await request(() => apiClient.post(apiPaths.admin.usuarios, data));
  return sanitizeUsuario(body?.data ?? body);
}

/**
 * @typedef {object} ActualizarUsuarioPayload
 * @property {string} [nombre]
 * @property {string} [apellido]
 * @property {string|null} [dni]
 * @property {string} [email]
 * @property {string|null} [telefono]
 * @property {string} [rol]
 * @property {boolean} [activo]
 */

/**
 * @param {string|number} id
 * @param {ActualizarUsuarioPayload} data
 * @returns {Promise<object|null>}
 */
export async function updateUsuario(id, data) {
  const { data: body } = await request(() => apiClient.put(apiPaths.admin.usuarioById(id), data));
  return sanitizeUsuario(body?.data ?? body);
}

/**
 * @param {string|number} id
 * @param {string} password
 * @returns {Promise<object|null>}
 */
export async function changeUsuarioPassword(id, password) {
  const { data: body } = await request(() =>
    apiClient.patch(apiPaths.admin.usuarioPasswordById(id), { password })
  );
  return sanitizeUsuario(body?.data ?? body);
}

/**
 * Desactiva vía `DELETE /users/:id` (misma semántica que update activo=false).
 * @param {string|number} id
 * @returns {Promise<object|null>}
 */
export async function deactivateUsuario(id) {
  const { data: body } = await request(() => apiClient.delete(apiPaths.admin.usuarioById(id)));
  return sanitizeUsuario(body?.data ?? body);
}
