import { useCallback } from "react";
import { listProductos } from "@/services/adminProductosService";
import { TIPO_PRODUCTO } from "@/constants/tipoProducto";
import { useAdminPaginatedList } from "@/hooks/admin/useAdminPaginatedList";

/**
 * Listado paginado de productos admin: sincroniza filtros + página con el API.
 *
 * @param {object} opts
 * @param {number} opts.page
 * @param {number} opts.pageSize
 * @param {string} opts.busqueda
 * @param {string} opts.filtroCategoria
 * @param {string} opts.filtroActivo
 * @param {string} opts.filtroDestacado
 * @param {string} opts.filtroDisponible
 * @param {string} opts.ordenar
 * @param {string} [opts.tipoProducto] PRODUCTO | PROMOCION
 * @param {(params: Record<string, unknown>) => Promise<{ productos: object[], pagination: object }>} [opts.listFn]
 */
export function useAdminProductosList({
  page,
  pageSize,
  busqueda,
  filtroCategoria,
  filtroActivo,
  filtroDestacado,
  filtroDisponible,
  ordenar,
  tipoProducto = TIPO_PRODUCTO.PRODUCTO,
  listFn = listProductos,
}) {
  const fetchPage = useCallback(async () => {
    const params = {
      page,
      limit: pageSize,
      ordenar,
    };
    if (busqueda) params.busqueda = busqueda;
    if (filtroCategoria) params.categoria_id = Number(filtroCategoria);
    if (filtroActivo === "true") params.activo = true;
    if (filtroActivo === "false") params.activo = false;
    if (filtroDestacado === "true") params.destacado = true;
    if (filtroDestacado === "false") params.destacado = false;
    if (filtroDisponible === "true") params.disponible = true;
    if (filtroDisponible === "false") params.disponible = false;
    if (tipoProducto && listFn === listProductos) params.tipo_producto = tipoProducto;

    const { productos, pagination } = await listFn(params);
    let rows = Array.isArray(productos) ? productos : [];
    if (tipoProducto) {
      rows = rows.filter((p) => (p?.tipo_producto ?? TIPO_PRODUCTO.PRODUCTO) === tipoProducto);
    }

    return { items: rows, pagination };
  }, [
    page,
    pageSize,
    busqueda,
    filtroCategoria,
    filtroActivo,
    filtroDestacado,
    filtroDisponible,
    ordenar,
    tipoProducto,
    listFn,
  ]);

  return useAdminPaginatedList({
    page,
    pageSize,
    fetchPage,
  });
}
