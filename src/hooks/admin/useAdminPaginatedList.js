import { useCallback, useEffect, useRef, useState } from "react";

const defaultPagination = (pageSize) => ({
  page: 1,
  limit: pageSize,
  total: 0,
});

/**
 * Base reutilizable para listados admin paginados con protección de carrera.
 */
export function useAdminPaginatedList({
  page,
  pageSize,
  enabled = true,
  fetchPage,
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
      const result = await fetchPage();
      if (seq !== fetchSeqRef.current) return;

      let rows = Array.isArray(result?.items) ? result.items : [];
      const rawPagination = result?.pagination;

      const limit =
        Number.isFinite(Number(rawPagination?.limit)) && Number(rawPagination.limit) > 0
          ? Number(rawPagination.limit)
          : pageSize;
      let total =
        Number.isFinite(Number(rawPagination?.total)) && Number(rawPagination.total) >= 0
          ? Number(rawPagination.total)
          : 0;
      let resolvedPage =
        Number.isFinite(Number(rawPagination?.page)) && Number(rawPagination.page) > 0
          ? Number(rawPagination.page)
          : page;

      // Fallback legacy: el backend devuelve más filas que el límite pedido.
      if (rows.length > limit) {
        total = Math.max(total, rows.length);
        resolvedPage = page;
        const start = (page - 1) * limit;
        rows = rows.slice(start, start + limit);
      } else if (rows.length > 0 && total === 0) {
        total = rows.length;
      }

      setItems(rows);
      setPagination({
        page: resolvedPage,
        limit,
        total,
      });
    } catch (error) {
      if (seq !== fetchSeqRef.current) return;
      setLoadError(error);
    } finally {
      if (seq !== fetchSeqRef.current) return;
      completedOnceRef.current = true;
      setLoadingInitial(false);
      setListRefreshing(false);
    }
  }, [enabled, fetchPage, page, pageSize]);

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
