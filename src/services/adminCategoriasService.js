import apiClient from "./apiClient";
import { apiPaths } from "@/config/apiPaths";
import { apiErrorFromAxios } from "@/utils/api/apiError";

/** Códigos de error del backend OA! para categorías admin. */
export const ADMIN_CATEGORIA_CODES = {
  DUPLICADA: "CATEGORIA_DUPLICADA",
  NO_ENCONTRADA: "CATEGORIA_NO_ENCONTRADA",
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
 * Lista todas las categorías (admin).
 * @returns {Promise<object[]>}
 */
export async function getCategorias() {
  const { data } = await request(() => apiClient.get(apiPaths.admin.categorias));
  const list = data?.data;
  return Array.isArray(list) ? list : [];
}

/**
 * @typedef {object} CrearCategoriaPayload
 * @property {string} nombre
 * @property {string|null} [descripcion]
 * @property {string|null} [imagen_url]
 * @property {number} [orden]
 * @property {boolean} [activo]
 */

/**
 * @param {CrearCategoriaPayload} data
 * @returns {Promise<object>}
 */
export async function createCategoria(data) {
  const { data: body } = await request(() => apiClient.post(apiPaths.admin.categorias, data));
  return body?.data ?? body;
}

/**
 * @typedef {object} ActualizarCategoriaPayload
 * @property {string} [nombre]
 * @property {string|null} [descripcion]
 * @property {string|null} [imagen_url]
 * @property {number} [orden]
 * @property {boolean} [activo]
 */

/**
 * @param {string|number} id
 * @param {ActualizarCategoriaPayload} data
 * @returns {Promise<object>}
 */
export async function updateCategoria(id, data) {
  const { data: body } = await request(() =>
    apiClient.put(apiPaths.admin.categoriaById(id), data)
  );
  return body?.data ?? body;
}

/**
 * @param {string|number} id
 * @param {boolean} activo
 * @returns {Promise<object>}
 */
export async function toggleCategoriaEstado(id, activo) {
  const { data: body } = await request(() =>
    apiClient.patch(apiPaths.admin.categoriaEstadoById(id), { activo })
  );
  return body?.data ?? body;
}

/**
 * Borrado lógico. Respuesta: categoria, productos_relacionados, mensaje.
 * @param {string|number} id
 * @returns {Promise<{ categoria: object, productos_relacionados: number, mensaje: string }>}
 */
export async function deleteCategoria(id) {
  const { data: body } = await request(() => apiClient.delete(apiPaths.admin.categoriaById(id)));
  const inner = body?.data ?? body;
  return {
    categoria: inner?.categoria ?? null,
    productos_relacionados: Number(inner?.productos_relacionados ?? 0),
    mensaje: typeof inner?.mensaje === "string" ? inner.mensaje : "",
  };
}
