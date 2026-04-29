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
 * @param {Record<string, unknown>} obj
 * @returns {object[]}
 */
function firstArrayFromObject(obj) {
  if (!obj || typeof obj !== "object") return [];
  const keys = ["data", "items", "productos", "rows", "list", "results", "content", "records"];
  for (const k of keys) {
    const v = obj[k];
    if (Array.isArray(v)) return v;
  }
  return [];
}

/**
 * @param {unknown} body cuerpo JSON del API (sin envoltorio axios)
 * @param {{ page?: number, limit?: number }} [requestParams] query enviada (fallbacks de paginación)
 * @returns {{ productos: object[], pagination: { page: number, limit: number, total: number } }}
 */
export function normalizeProductosListBody(body, requestParams = {}) {
  const reqLimit = Number(requestParams?.limit);
  const reqPage = Number(requestParams?.page);
  const fallbackLimit = Number.isFinite(reqLimit) && reqLimit > 0 ? reqLimit : 20;
  const fallbackPage = Number.isFinite(reqPage) && reqPage > 0 ? reqPage : 1;

  // Respuesta legacy: array plano (sin meta). Se asume un solo bloque; total = cantidad devuelta.
  if (Array.isArray(body)) {
    return {
      productos: body,
      pagination: {
        page: fallbackPage,
        limit: fallbackLimit,
        total: body.length,
      },
    };
  }

  const root = body && typeof body === "object" ? /** @type {Record<string, unknown>} */ (body) : {};
  const d = root.data;

  let items = [];
  if (Array.isArray(d)) {
    items = d;
  } else if (d && typeof d === "object") {
    items = firstArrayFromObject(/** @type {Record<string, unknown>} */ (d));
  }
  if (items.length === 0) {
    items = firstArrayFromObject(root);
  }

  const innerObj = d && typeof d === "object" && !Array.isArray(d) ? /** @type {Record<string, unknown>} */ (d) : null;

  const rawPag =
    root.pagination ??
    root.meta ??
    (innerObj ? innerObj.pagination ?? innerObj.meta : undefined);

  const pag = rawPag && typeof rawPag === "object" ? /** @type {Record<string, unknown>} */ (rawPag) : {};

  const limitRaw =
    pag.limit ??
    pag.per_page ??
    pag.pageSize ??
    pag.size ??
    (innerObj && Number(innerObj.limit) > 0 ? innerObj.limit : null) ??
    (Number.isFinite(reqLimit) && reqLimit > 0 ? reqLimit : 20);
  let limit = Number(limitRaw);
  if (!Number.isFinite(limit) || limit <= 0) limit = 20;

  // total explícito (varios backends)
  let total = Number(
    pag.total ??
      pag.total_count ??
      pag.count ??
      pag.totalItems ??
      pag.total_elements ??
      pag.totalElements,
  );
  if (innerObj != null) {
    if (!Number.isFinite(total) || total < 0) {
      total = Number(
        innerObj.total ??
          innerObj.total_count ??
          innerObj.totalCount ??
          innerObj.total_items ??
          innerObj.totalItems,
      );
    }
  }
  if (!Number.isFinite(total) || total < 0) total = 0;

  // Spring Data / estilo "number" 0-based
  let page = Number(pag.page ?? pag.current_page ?? pag.currentPage);
  if (pag.number != null && Number.isFinite(Number(pag.number))) {
    page = Number(pag.number) + 1;
  }
  if (!Number.isFinite(page) || page < 1) page = fallbackPage;

  const totalPagesHint = Number(pag.total_pages ?? pag.totalPages ?? pag.last_page ?? pag.lastPage);
  if ((!Number.isFinite(total) || total <= 0) && Number.isFinite(totalPagesHint) && totalPagesHint > 0 && limit > 0) {
    total = totalPagesHint * limit;
  }

  // Hay filas en la página pero el backend no mandó total: estimación mínima coherente con la página pedida
  if (items.length > 0 && total === 0 && limit > 0) {
    total = Math.max(items.length, (fallbackPage - 1) * limit + items.length);
  }

  return {
    productos: items,
    pagination: { page, limit, total },
  };
}

/**
 * Listado paginado (admin).
 * @param {Record<string, unknown>} [params] busqueda, categoria_id, activo, destacado, disponible, ordenar, page, limit, tipo_producto (PRODUCTO | PROMOCION)
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
