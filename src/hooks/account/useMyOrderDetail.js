"use client";

import { useCallback, useEffect, useState } from "react";
import { getMyOrderDetail } from "@/services/ordersService";
import { normalizeMyOrderDetail } from "@/utils/orders/orderDisplay";

export function useMyOrderDetail(orderId, { enabled = true } = {}) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled && orderId));
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!enabled || !orderId) return;
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const data = await getMyOrderDetail(orderId);
      const normalized = normalizeMyOrderDetail(data);
      if (!normalized?.id) {
        setOrder(null);
        setNotFound(true);
        return;
      }
      setOrder(normalized);
    } catch (err) {
      setOrder(null);
      const status = Number(err?.status);
      if (status === 404) {
        setNotFound(true);
        setError(null);
      } else {
        setNotFound(false);
        setError(err?.message ?? "No pudimos cargar el pedido.");
      }
    } finally {
      setLoading(false);
    }
  }, [enabled, orderId]);

  useEffect(() => {
    void fetchOrder();
  }, [fetchOrder]);

  return { order, loading, error, notFound, refetch: fetchOrder };
}
