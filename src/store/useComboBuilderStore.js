import { create } from "zustand";

function incInMap(prev, product) {
  const current = prev[product.id]?.cantidad ?? 0;
  return { ...prev, [product.id]: { product, cantidad: current + 1 } };
}

function decInMap(prev, product) {
  const current = prev[product.id]?.cantidad ?? 0;
  if (current <= 1) {
    const next = { ...prev };
    delete next[product.id];
    return next;
  }
  return { ...prev, [product.id]: { product, cantidad: current - 1 } };
}

function selectInMap(prev, product) {
  if ((prev[product.id]?.cantidad ?? 0) > 0) return prev;
  return { ...prev, [product.id]: { product, cantidad: 1 } };
}

/**
 * Estado global del wizard /arma-tu-combo.
 * Cada paso guarda un mapa { [productId]: { product, cantidad } }.
 */
export const useComboBuilderStore = create((set) => ({
  bases: {},
  mixers: {},
  extras: {},

  selectBase: (product) =>
    set((state) => ({ bases: selectInMap(state.bases, product) })),
  incBase: (product) =>
    set((state) => ({ bases: incInMap(state.bases, product) })),
  decBase: (product) =>
    set((state) => ({ bases: decInMap(state.bases, product) })),

  selectMixer: (product) =>
    set((state) => ({ mixers: selectInMap(state.mixers, product) })),
  incMixer: (product) =>
    set((state) => ({ mixers: incInMap(state.mixers, product) })),
  decMixer: (product) =>
    set((state) => ({ mixers: decInMap(state.mixers, product) })),

  incExtra: (product) =>
    set((state) => ({ extras: incInMap(state.extras, product) })),
  decExtra: (product) =>
    set((state) => ({ extras: decInMap(state.extras, product) })),

  setBases: (bases) => set({ bases: bases ?? {} }),
  setMixers: (mixers) => set({ mixers: mixers ?? {} }),
  setExtras: (extras) => set({ extras: extras ?? {} }),

  resetSelections: () => set({ bases: {}, mixers: {}, extras: {} }),
}));
