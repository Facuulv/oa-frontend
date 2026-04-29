import { useCallback, useEffect, useRef, useState } from "react";
import { listProductos } from "@/services/adminProductosService";
import { TIPO_PRODUCTO } from "@/constants/tipoProducto";

const defaultPagination = (pageSize) => ({
  page: 1,
  limit: pageSize,
  total: 0,
});

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
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(() => defaultPagination(pageSize));
  const [loadError, setLoadError] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [listRefreshing, setListRefreshing] = useState(false);
  const fetchSeqRef = useRef(0);
  const completedOnceRef = useRef(false);

  const load = useCallback(async () => {
    const seq = ++fetchSeqRef.current;

    setLoadError(null);
    if (!completedOnceRef.current) setLoadingInitial(true);
    else setListRefreshing(true);

    try {
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

      const { productos, pagination: pag } = await listFn(params);
      if (seq !== fetchSeqRef.current) return;
      let rows = Array.isArray(productos) ? productos : [];
      if (tipoProducto) {
        rows = rows.filter((p) => (p?.tipo_producto ?? TIPO_PRODUCTO.PRODUCTO) === tipoProducto);
      }
      setItems(rows);
      setPagination({
        page: Number(pag?.page) > 0 ? Number(pag.page) : page,
        limit: Number(pag?.limit) > 0 ? Number(pag.limit) : pageSize,
        total: Number.isFinite(Number(pag?.total)) && Number(pag.total) >= 0 ? Number(pag.total) : 0,
      });
    } catch (e) {
      if (seq !== fetchSeqRef.current) return;
      setLoadError(e);
    } finally {
      if (seq !== fetchSeqRef.current) return;
      completedOnceRef.current = true;
      setLoadingInitial(false);
      setListRefreshing(false);
    }
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

  useEffect(() => {
    load();
  }, [load]);

  return {
    items,
    pagination,
    loadError,
    load,
    loadingInitial,
    listRefreshing,
  };
}
