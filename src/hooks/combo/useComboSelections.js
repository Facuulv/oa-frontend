"use client";

import { useComboBuilderStore } from "@/store/useComboBuilderStore";

/**
 * Hook de selección del wizard /arma-tu-combo (wrapper del store Zustand).
 *
 * Cada paso usa mapas `{ [productId]: { product, cantidad } }`.
 */
export function useComboSelections() {
  const bases = useComboBuilderStore((s) => s.bases);
  const mixers = useComboBuilderStore((s) => s.mixers);
  const extras = useComboBuilderStore((s) => s.extras);

  const selectBase = useComboBuilderStore((s) => s.selectBase);
  const incBase = useComboBuilderStore((s) => s.incBase);
  const decBase = useComboBuilderStore((s) => s.decBase);

  const selectMixer = useComboBuilderStore((s) => s.selectMixer);
  const incMixer = useComboBuilderStore((s) => s.incMixer);
  const decMixer = useComboBuilderStore((s) => s.decMixer);

  const incExtra = useComboBuilderStore((s) => s.incExtra);
  const decExtra = useComboBuilderStore((s) => s.decExtra);

  const setBases = useComboBuilderStore((s) => s.setBases);
  const setMixers = useComboBuilderStore((s) => s.setMixers);
  const setExtras = useComboBuilderStore((s) => s.setExtras);
  const resetSelections = useComboBuilderStore((s) => s.resetSelections);

  return {
    bases,
    mixers,
    extras,
    selectBase,
    incBase,
    decBase,
    selectMixer,
    incMixer,
    decMixer,
    incExtra,
    decExtra,
    setBases,
    setMixers,
    setExtras,
    resetSelections,
  };
}
