import { useCallback, useEffect, useRef, useState } from "react";
import { listUsuarios } from "@/services/adminUsuariosService";

const defaultPagination = (pageSize) => ({
  page: 1,
  limit: pageSize,
  total: 0,
});

/**
 * Listado paginado de usuarios del panel (`GET /users`).
 *
 * @param {object} opts
 * @param {number} opts.page
 * @param {number} opts.pageSize
 * @param {string} opts.q búsqueda (nombre, apellido, email, DNI, teléfono)
 * @param {string} opts.rol '' | 'ADMIN' | 'ENCARGADO' | 'VENDEDOR'
 * @param {'all'|'true'|'false'} opts.estadoActivo
 * @param {(params: Record<string, unknown>) => Promise<{ usuarios: object[], pagination: object }>} [opts.listFn]
 * @param {boolean} [opts.enabled] si es false, no llama al API (p. ej. usuario sin permiso en la ruta).
 */
export function useAdminUsuariosList({
  page,
  pageSize,
  q,
  rol,
  estadoActivo,
  listFn = listUsuarios,
  enabled = true,
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

    if (!enabled) {
      setLoadError(null);
      setItems([]);
      setPagination(defaultPagination(pageSize));
      completedOnceRef.current = true;
      setLoadingInitial(false);
      setListRefreshing(false);
      return;
    }

    setLoadError(null);
    if (!completedOnceRef.current) setLoadingInitial(true);
    else setListRefreshing(true);

    try {
      const params = {
        page,
        limit: pageSize,
      };
      const trimmed = typeof q === "string" ? q.trim() : "";
      if (trimmed) params.q = trimmed;
      if (rol) params.rol = rol;
      if (estadoActivo === "true") params.activo = "1";
      if (estadoActivo === "false") params.activo = "0";

      const { usuarios, pagination: pag } = await listFn(params);
      if (seq !== fetchSeqRef.current) return;
      setItems(Array.isArray(usuarios) ? usuarios : []);
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
  }, [page, pageSize, q, rol, estadoActivo, listFn, enabled]);

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
