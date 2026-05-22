"use client";

import { useMemo } from "react";
import {
  buildIngredientList,
  computeComboTotal,
  getComboSummaryLabel,
  getNextDisabled,
  getPrimaryActionLabel,
} from "@/features/combo/comboBuilder";
import { resolveComboName } from "@/store/useSavedCombosStore";

/**
 * Totales y labels derivados (barra, panel, carrito). Solo memos; sin side effects.
 *
 * Cuidado: `resolvedComboName` usa `resolveComboName` del store; llamar después de tener `comboName`.
 *
 * @param {object} opts
 * @param {number} opts.currentStep
 * @param {object | null} opts.selectedBase
 * @param {object | null} opts.selectedMixer
 * @param {Record<string, { product: object, cantidad: number }>} opts.extras
 * @param {string} opts.comboName
 */
export function useComboTotals({
  currentStep,
  selectedBase,
  selectedMixer,
  extras = {},
  comboName = "",
} = {}) {
  const total = useMemo(
    () => computeComboTotal(selectedBase, selectedMixer, extras),
    [selectedBase, selectedMixer, extras]
  );

  const comboSummaryLabel = useMemo(
    () =>
      getComboSummaryLabel({
        selectedBase,
        selectedMixer,
        currentStep,
      }),
    [selectedBase, selectedMixer, currentStep]
  );

  const resolvedComboName = useMemo(
    () =>
      resolveComboName({
        name: comboName,
        base: selectedBase,
        mixer: selectedMixer,
      }),
    [comboName, selectedBase, selectedMixer]
  );

  const ingredientList = useMemo(
    () => buildIngredientList(selectedBase, selectedMixer, extras),
    [selectedBase, selectedMixer, extras]
  );

  const nextDisabled = useMemo(
    () => getNextDisabled(currentStep, selectedBase, selectedMixer),
    [currentStep, selectedBase, selectedMixer]
  );

  const nextLabel = useMemo(
    () => getPrimaryActionLabel(currentStep),
    [currentStep]
  );

  return {
    total,
    comboSummaryLabel,
    resolvedComboName,
    ingredientList,
    nextDisabled,
    nextLabel,
  };
}
