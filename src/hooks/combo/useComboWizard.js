"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AUTO_ADVANCE_MS } from "@/features/combo/combo.constants";

/**
 * Paso del wizard, auto-advance (280ms) y navegación Base → Mix → Combo.
 *
 * Cuidado: `onFinalize` suele ir vía ref desde el orquestador; cancelar timer en back/next.
 * Re-tap en el mismo producto deselecciona y no avanza.
 *
 * @param {object} opts
 * @param {object | null} opts.selectedBase
 * @param {object | null} opts.selectedMixer
 * @param {(value: object | null) => void} opts.setSelectedBase
 * @param {(value: object | null) => void} opts.setSelectedMixer
 * @param {() => void} opts.onFinalize — paso 3, CTA principal
 * @param {{ back: () => void }} opts.router — salir en paso 1
 */
export function useComboWizard({
  selectedBase,
  selectedMixer,
  setSelectedBase,
  setSelectedMixer,
  onFinalize,
  router,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const advanceTimer = useRef(null);

  const cancelAdvance = useCallback(() => {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  const scheduleAdvance = useCallback((toStep) => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      setCurrentStep(toStep);
      advanceTimer.current = null;
    }, AUTO_ADVANCE_MS);
  }, []);

  const handleSelectBase = useCallback(
    (p) => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      if (selectedBase?.id === p.id) {
        setSelectedBase(null);
        return;
      }
      setSelectedBase(p);
      scheduleAdvance(2);
    },
    [selectedBase, setSelectedBase, scheduleAdvance]
  );

  const handleSelectMixer = useCallback(
    (p) => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      if (selectedMixer?.id === p.id) {
        setSelectedMixer(null);
        return;
      }
      setSelectedMixer(p);
      scheduleAdvance(3);
    },
    [selectedMixer, setSelectedMixer, scheduleAdvance]
  );

  const handleBack = useCallback(() => {
    cancelAdvance();
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    } else {
      router.back();
    }
  }, [cancelAdvance, currentStep, router]);

  const handleNext = useCallback(() => {
    cancelAdvance();
    if (currentStep === 1) {
      if (!selectedBase) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedMixer) return;
      setCurrentStep(3);
    } else {
      onFinalize?.();
    }
  }, [cancelAdvance, currentStep, selectedBase, selectedMixer, onFinalize]);

  return {
    currentStep,
    setCurrentStep,
    handleSelectBase,
    handleSelectMixer,
    handleBack,
    handleNext,
    cancelAdvance,
  };
}
