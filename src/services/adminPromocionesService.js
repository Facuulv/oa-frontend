import apiClient from "./apiClient";
import { apiPaths } from "@/config/apiPaths";
import { apiErrorFromAxios } from "@/utils/api/apiError";
import { TIPO_PRODUCTO } from "@/constants/tipoProducto";
import { normalizeProductosListBody, listProductos } from "./adminProductosService";

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
 * Normaliza componentes desde distintas formas de respuesta del API.
 * @param {Record<string, unknown>} row producto promo (detalle o listado enriquecido)
 * @returns {{ producto_id: number, cantidad: number, nombre?: string, precio?: number|null, stock?: number|null }[]}
 */
export function normalizeComponentesFromProducto(row) {
  const raw =
    row.componentes ??
    row.productos_componentes ??
    row.items_componentes ??
    row.items ??
    [];
  if (!Array.isArray(raw)) return [];
  return raw
    .map((c) => {
      const rec = c && typeof c === "object" ? /** @type {Record<string, unknown>} */ (c) : {};
      const nested =
        rec.producto && typeof rec.producto === "object"
          ? /** @type {Record<string, unknown>} */ (rec.producto)
          : rec.producto_hijo && typeof rec.producto_hijo === "object"
            ? /** @type {Record<string, unknown>} */ (rec.producto_hijo)
            : {};
      const pidRaw =
        rec.producto_id ??
        rec.producto_hijo_id ??
        rec.hijo_id ??
        rec.id_producto_componente ??
        nested.id;
      const producto_id = Number(pidRaw);
      const cantidad = Math.max(1, Math.floor(Number(rec.cantidad) || 1));
      const nombre =
        typeof nested.nombre === "string"
          ? nested.nombre
          : typeof rec.nombre === "string"
            ? rec.nombre
            : "";
      const precio = nested.precio != null ? Number(nested.precio) : rec.precio != null ? Number(rec.precio) : null;
      const stock =
        nested.stock != null ? Number(nested.stock) : rec.stock != null ? Number(rec.stock) : null;
      return {
        producto_id,
        cantidad,
        nombre,
        precio: Number.isFinite(precio) ? precio : null,
        stock: Number.isFinite(stock) ? stock : null,
      };
    })
    .filter((x) => Number.isFinite(x.producto_id) && x.producto_id > 0);
}

/**
 * Listado paginado desde `/admin/promociones-producto` (incluye disponibilidad y métricas de combo).
 * @param {Record<string, unknown>} params mismos query que productos admin (sin `tipo_producto`)
 * @returns {Promise<{ productos: object[], pagination: { page: number, limit: number, total: number } }>}
 */
export async function listPromocionesAdmin(params = {}) {
  const { data } = await request(() => apiClient.get(apiPaths.admin.promocionesProducto, { params }));
  return normalizeProductosListBody(data, {
    page: Number(params.page),
    limit: Number(params.limit),
  });
}

/**
 * Productos elegibles como componentes de un combo (solo PRODUCTO, idealmente activos y disponibles).
 * @param {Record<string, unknown>} [params]
 */
export async function listProductosParaComponentes(params = {}) {
  return listProductos({
    page: 1,
    limit: 100,
    activo: true,
    disponible: true,
    ...params,
    tipo_producto: TIPO_PRODUCTO.PRODUCTO,
  });
}

/**
 * Cuerpo para crear/actualizar una promoción (producto compuesto).
 * @param {object} values salida validada del formulario admin
 */
export function buildPromocionPayload(values) {
  const componentes = Array.isArray(values.componentes) ? values.componentes : [];
  return {
    categoria_id: values.categoria_id,
    nombre: values.nombre.trim(),
    descripcion: values.descripcion,
    precio: values.precio,
    imagen_url: values.imagen_url,
    destacado: values.destacado,
    disponible: values.disponible,
    activo: values.activo,
    orden: values.orden,
    stock: 0,
    componentes: componentes.map((c) => ({
      producto_hijo_id: c.producto_id,
      cantidad: c.cantidad,
    })),
  };
}

/**
 * @param {string|number} id
 * @returns {Promise<object>}
 */
export async function getPromocion(id) {
  const { data: body } = await request(() => apiClient.get(apiPaths.admin.promocionProductoById(id)));
  return body?.data ?? body;
}

/**
 * @param {object} data
 */
export async function createPromocion(data) {
  const { data: body } = await request(() => apiClient.post(apiPaths.admin.promocionesProducto, data));
  return body?.data ?? body;
}

/**
 * @param {string|number} id
 * @param {object} data
 */
export async function updatePromocion(id, data) {
  const { data: body } = await request(() => apiClient.put(apiPaths.admin.promocionProductoById(id), data));
  return body?.data ?? body;
}

/**
 * @param {string|number} id
 * @param {boolean} activo
 * @returns {Promise<object>}
 */
export async function togglePromocionEstado(id, activo) {
  const { data: body } = await request(() =>
    apiClient.patch(apiPaths.admin.promocionProductoEstadoById(id), { activo }),
  );
  return body?.data ?? body;
}
