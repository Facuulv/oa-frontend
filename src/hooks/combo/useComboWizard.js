"use client";

import { useCallback, useState } from "react";
import { hasSelectionInMap } from "@/features/combo/comboBuilder";

/**
 * Paso del wizard y navegación manual Base → Mix → Extras.
 *
 * @param {object} opts
 * @param {Record<string, { product: object, cantidad: number }>} opts.bases
 * @param {Record<string, { product: object, cantidad: number }>} opts.mixers
 * @param {() => void} opts.onFinalize — paso 3, CTA principal
 * @param {{ back: () => void }} opts.router — salir en paso 1
 */
export function useComboWizard({ bases, mixers, onFinalize, router }) {
  const [currentStep, setCurrentStep] = useState(1);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    } else {
      router.back();
    }
  }, [currentStep, router]);

  const handleNext = useCallback(() => {
    if (currentStep === 1) {
      if (!hasSelectionInMap(bases)) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!hasSelectionInMap(mixers)) return;
      setCurrentStep(3);
    } else {
      onFinalize?.();
    }
  }, [currentStep, bases, mixers, onFinalize]);

  return {
    currentStep,
    setCurrentStep,
    handleBack,
    handleNext,
  };
}
