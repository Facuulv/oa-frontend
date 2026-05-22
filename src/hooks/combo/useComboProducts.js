"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PRODUCTOS_ENDPOINT,
  classifyProducts,
  filterByText,
  mapSelectableProduct,
} from "@/features/combo/combo.constants";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";

/**
 * Catálogo del wizard /arma-tu-combo: fetch, clasificación base/mix/extras y filtros por búsqueda.
 *
 * Cuidado: pasar `enabled: mounted` para no fetchear en SSR; el fetch usa AbortController y `retry()`.
 *
 * @param {object} opts
 * @param {boolean} opts.enabled — true tras hidratación (`mounted`)
 * @param {string} opts.searchBase
 * @param {string} opts.searchMixer
 * @param {string} opts.searchExtras
 */
export function useComboProducts({
  enabled = false,
  searchBase = "",
  searchMixer = "",
  searchExtras = "",
} = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  const fetchProducts = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(PRODUCTOS_ENDPOINT, {
        cache: "no-store",
        signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const raw = Array.isArray(json) ? json : (json?.data ?? []);
      const normalized = raw
        .filter((p) => p && (p.disponible === undefined || p.disponible))
        .map(mapSelectableProduct)
        .filter(Boolean);
      setProducts(normalized);
    } catch (err) {
      if (err?.name === "AbortError") return;
      setError(err?.message || "No pudimos cargar los productos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    void fetchProducts(controller.signal);
    return () => controller.abort();
  }, [enabled, fetchProducts, retryKey]);

  const showLoadingSkeleton = useDelayedLoading(loading);

  const { bases, mixers, extrasCatalog } = useMemo(() => {
    const c = classifyProducts(products);
    return { bases: c.bases, mixers: c.mixers, extrasCatalog: c.extras };
  }, [products]);

  const filteredBases = useMemo(
    () => filterByText(bases, searchBase),
    [bases, searchBase]
  );
  const filteredMixers = useMemo(
    () => filterByText(mixers, searchMixer),
    [mixers, searchMixer]
  );
  const filteredExtras = useMemo(
    () => filterByText(extrasCatalog, searchExtras),
    [extrasCatalog, searchExtras]
  );

  const retry = useCallback(() => {
    setRetryKey((k) => k + 1);
  }, []);

  return {
    products,
    loading,
    showLoadingSkeleton,
    error,
    retry,
    bases,
    mixers,
    extrasCatalog,
    filteredBases,
    filteredMixers,
    filteredExtras,
  };
}
