"use client";

import { useCallback, useState } from "react";

/**
 * Selección del wizard /arma-tu-combo: base, mix y extras.
 *
 * Cuidado: extras es `{ [productId]: { product, cantidad } }`; no cambiar el shape (carrito/checkout).
 */
export function useComboSelections() {
  const [selectedBase, setSelectedBase] = useState(null);
  const [selectedMixer, setSelectedMixer] = useState(null);
  const [extras, setExtras] = useState({});

  const incExtra = useCallback((product) => {
    setExtras((prev) => {
      const current = prev[product.id]?.cantidad ?? 0;
      return { ...prev, [product.id]: { product, cantidad: current + 1 } };
    });
  }, []);

  const decExtra = useCallback((product) => {
    setExtras((prev) => {
      const current = prev[product.id]?.cantidad ?? 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[product.id];
        return next;
      }
      return { ...prev, [product.id]: { product, cantidad: current - 1 } };
    });
  }, []);

  const resetSelections = useCallback(() => {
    setSelectedBase(null);
    setSelectedMixer(null);
    setExtras({});
  }, []);

  return {
    selectedBase,
    setSelectedBase,
    selectedMixer,
    setSelectedMixer,
    extras,
    setExtras,
    incExtra,
    decExtra,
    resetSelections,
  };
}
