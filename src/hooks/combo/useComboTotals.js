"use client";

import { useMemo } from "react";
import {
  buildIngredientList,
  computeComboTotal,
  getComboSummaryLabel,
  getNextDisabled,
  getPrimaryActionLabel,
  getFirstProductFromMap,
} from "@/features/combo/comboBuilder";
import { resolveComboName } from "@/store/useSavedCombosStore";

/**
 * Totales y labels derivados (barra, panel, carrito). Solo memos; sin side effects.
 *
 * @param {object} opts
 * @param {number} opts.currentStep
 * @param {Record<string, { product: object, cantidad: number }>} opts.bases
 * @param {Record<string, { product: object, cantidad: number }>} opts.mixers
 * @param {Record<string, { product: object, cantidad: number }>} opts.extras
 * @param {string} opts.comboName
 */
export function useComboTotals({
  currentStep,
  bases = {},
  mixers = {},
  extras = {},
  comboName = "",
} = {}) {
  const total = useMemo(
    () => computeComboTotal(bases, mixers, extras),
    [bases, mixers, extras]
  );

  const comboSummaryLabel = useMemo(
    () =>
      getComboSummaryLabel({
        bases,
        mixers,
        currentStep,
      }),
    [bases, mixers, currentStep]
  );

  const resolvedComboName = useMemo(
    () =>
      resolveComboName({
        name: comboName,
        base: getFirstProductFromMap(bases),
        mixer: getFirstProductFromMap(mixers),
      }),
    [comboName, bases, mixers]
  );

  const ingredientList = useMemo(
    () => buildIngredientList(bases, mixers, extras),
    [bases, mixers, extras]
  );

  const nextDisabled = useMemo(
    () => getNextDisabled(currentStep, bases, mixers, extras),
    [currentStep, bases, mixers, extras]
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
