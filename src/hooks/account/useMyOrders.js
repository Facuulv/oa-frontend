"use client";

import { useCallback, useEffect, useState } from "react";
import { getMyOrders } from "@/services/ordersService";
import { createEmptyPagination, normalizeMyOrdersPage } from "@/utils/orders/orderDisplay";

const DEFAULT_LIMIT = 8;

export function useMyOrders({ enabled = true, limit = DEFAULT_LIMIT } = {}) {
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(() => createEmptyPagination(limit));
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getMyOrders({ page, limit });
      const normalized = normalizeMyOrdersPage(data);
      setOrders(normalized.orders);
      setPagination(normalized.pagination);
      if (
        normalized.pagination.totalPages > 0 &&
        page > normalized.pagination.totalPages
      ) {
        setPage(normalized.pagination.totalPages);
      }
    } catch (err) {
      setOrders([]);
      setPagination(createEmptyPagination(limit));
      setError(err?.message ?? "No pudimos cargar tus pedidos.");
    } finally {
      setLoading(false);
    }
  }, [enabled, page, limit]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const goToPrevPage = useCallback(() => {
    setPage((current) => Math.max(1, current - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPage((current) => current + 1);
  }, []);

  return {
    orders,
    pagination,
    loading,
    error,
    page,
    setPage,
    goToPrevPage,
    goToNextPage,
    refetch: fetchOrders,
  };
}
