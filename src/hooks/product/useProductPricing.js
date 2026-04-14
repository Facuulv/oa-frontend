import { useMemo } from "react";

/**
 * Computes total price = base price + selected extras.
 */
export function useProductPricing({ precioBase = 0, extrasSeleccionados = [] }) {
  return useMemo(() => {
    const base = Number(precioBase) || 0;
    const extrasTotal = extrasSeleccionados.reduce(
      (acc, e) => acc + Number(e.precioExtra ?? e.precio ?? 0),
      0
    );
    return {
      base,
      extrasTotal,
      total: base + extrasTotal,
    };
  }, [precioBase, extrasSeleccionados]);
}
