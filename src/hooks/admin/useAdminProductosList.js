import { useCallback, useEffect, useRef, useState } from "react";
import { listProductos } from "@/services/adminProductosService";

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
}) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(() => defaultPagination(pageSize));
  const [loadError, setLoadError] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [listRefreshing, setListRefreshing] = useState(false);
  const firstLoadPendingRef = useRef(true);

  const load = useCallback(async () => {
    setLoadError(null);
    const isFirst = firstLoadPendingRef.current;
    if (isFirst) setLoadingInitial(true);
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

      const { productos, pagination: pag } = await listProductos(params);
      setItems(productos);
      setPagination(pag);
    } catch (e) {
      setLoadError(e);
    } finally {
      if (isFirst) {
        firstLoadPendingRef.current = false;
        setLoadingInitial(false);
      }
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
