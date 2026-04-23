import apiClient from "./apiClient";
import { apiPaths } from "@/config/apiPaths";
import { apiErrorFromAxios } from "@/utils/api/apiError";

/** Códigos de error del backend OA! para productos admin. */
export const ADMIN_PRODUCTO_CODES = {
  NO_ENCONTRADO: "PRODUCTO_NO_ENCONTRADO",
  CATEGORIA_NO_ENCONTRADA: "CATEGORIA_NO_ENCONTRADA",
  CATEGORIA_INACTIVA: "CATEGORIA_INACTIVA",
  /** PUT sin campos o sin cambios reconocibles por el validador. */
  SIN_CAMPOS_ACTUALIZACION: "SIN_CAMPOS_ACTUALIZACION",
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
 * @param {unknown} body cuerpo JSON del API (sin envoltorio axios)
 * @param {{ page?: number, limit?: number }} [requestParams] query enviada (fallbacks de paginación)
 * @returns {{ productos: object[], pagination: { page: number, limit: number, total: number } }}
 */
export function normalizeProductosListBody(body, requestParams = {}) {
  const reqLimit = Number(requestParams?.limit);
  const reqPage = Number(requestParams?.page);

  /** @type {unknown} */
  const root = body && typeof body === "object" ? body : {};
  const d = /** @type {Record<string, unknown>} */ (root).data;

  let items = [];
  if (Array.isArray(d)) {
    items = d;
  } else if (d && typeof d === "object") {
    const obj = /** @type {Record<string, unknown>} */ (d);
    if (Array.isArray(obj.data)) items = obj.data;
    else if (Array.isArray(obj.items)) items = obj.items;
    else if (Array.isArray(obj.productos)) items = obj.productos;
    else if (Array.isArray(obj.rows)) items = obj.rows;
    else if (Array.isArray(obj.list)) items = obj.list;
  }
  if (items.length === 0) {
    const o = /** @type {Record<string, unknown>} */ (root);
    if (Array.isArray(o.items)) items = o.items;
    else if (Array.isArray(o.productos)) items = o.productos;
  }

  const rawPag =
    /** @type {Record<string, unknown>} */ (root).pagination ??
    /** @type {Record<string, unknown>} */ (root).meta ??
    (d && typeof d === "object" && !Array.isArray(d)
      ? /** @type {Record<string, unknown>} */ (d).pagination ??
        /** @type {Record<string, unknown>} */ (d).meta
      : undefined);

  const pag = rawPag && typeof rawPag === "object" ? /** @type {Record<string, unknown>} */ (rawPag) : {};

  const limitRaw = pag.limit ?? pag.per_page ?? pag.pageSize ?? (Number.isFinite(reqLimit) && reqLimit > 0 ? reqLimit : 20);
  let limit = Number(limitRaw);
  if (!Number.isFinite(limit) || limit <= 0) limit = 20;

  let total = Number(pag.total ?? pag.total_count ?? pag.count ?? pag.totalItems);
  if (!Number.isFinite(total) || total < 0) total = 0;

  let page = Number(pag.page ?? pag.current_page);
  if (!Number.isFinite(page) || page < 1) page = Number.isFinite(reqPage) && reqPage > 0 ? reqPage : 1;

  return {
    productos: items,
    pagination: { page, limit, total },
  };
}

/**
 * Listado paginado (admin).
 * @param {Record<string, unknown>} [params] busqueda, categoria_id, activo, destacado, disponible, ordenar, page, limit
 * @returns {Promise<{ productos: object[], pagination: { page: number, limit: number, total: number } }>}
 */
export async function listProductos(params = {}) {
  const { data } = await request(() => apiClient.get(apiPaths.admin.productos, { params }));
  return normalizeProductosListBody(data, {
    page: Number(params.page),
    limit: Number(params.limit),
  });
}

/**
 * @param {string|number} id
 * @returns {Promise<object>}
 */
export async function getProducto(id) {
  const { data: body } = await request(() => apiClient.get(apiPaths.admin.productoById(id)));
  return body?.data ?? body;
}

/**
 * @param {object} data cuerpo POST (español, alineado al backend)
 * @returns {Promise<object>}
 */
export async function createProducto(data) {
  const { data: body } = await request(() => apiClient.post(apiPaths.admin.productos, data));
  return body?.data ?? body;
}

/**
 * @param {string|number} id
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function updateProducto(id, data) {
  const { data: body } = await request(() => apiClient.put(apiPaths.admin.productoById(id), data));
  return body?.data ?? body;
}

/**
 * @param {string|number} id
 * @param {boolean} activo
 * @returns {Promise<object>}
 */
export async function toggleProductoEstado(id, activo) {
  const { data: body } = await request(() =>
    apiClient.patch(apiPaths.admin.productoEstadoById(id), { activo }),
  );
  return body?.data ?? body;
}
