"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { buildComboCartItem } from "@/features/combo/comboBuilder";
import { useCartStore } from "@/store/useCartStore";
import { useSavedCombosStore } from "@/store/useSavedCombosStore";
import {
  useAuthStore,
  selectIsSessionLoaded,
} from "@/store/useAuthStore";
import { toast } from "@/lib/toast";

/**
 * Persistencia: nombre, guardar en Mis Combos, carga `?combo=`, finalizar y reset del wizard.
 *
 * Cuidado: tras `useComboTotals`, el orquestador debe asignar `finalizeSnapshotRef.current`
 * (total, labels, selección). Si `saveOnFinalize` y no hay sesión, no agrega al carrito.
 * `loadedComboRef` evita doble carga del mismo id.
 *
 * @param {object} opts
 * @param {boolean} opts.mounted
 * @param {string | null} opts.comboId — query ?combo=
 * @param {object | null} opts.selectedBase
 * @param {object | null} opts.selectedMixer
 * @param {Record<string, { product: object, cantidad: number }>} opts.extras
 * @param {(value: object | null) => void} opts.setSelectedBase
 * @param {(value: object | null) => void} opts.setSelectedMixer
 * @param {(value: Record<string, object>) => void} opts.setExtras
 * @param {() => void} opts.resetSelections
 * @param {(step: number) => void} opts.setCurrentStep
 * @param {(value: string) => void} opts.setSearchBase
 * @param {(value: string) => void} opts.setSearchMixer
 * @param {(value: string) => void} opts.setSearchExtras
 * @param {(value: object) => void} opts.setListPage
 */
export function useComboPersistence({
  mounted,
  comboId,
  selectedBase,
  selectedMixer,
  extras,
  setSelectedBase,
  setSelectedMixer,
  setExtras,
  resetSelections,
  setCurrentStep,
  setSearchBase,
  setSearchMixer,
  setSearchExtras,
  setListPage,
}) {
  const [comboName, setComboName] = useState("");
  const [saveOnFinalize, setSaveOnFinalize] = useState(false);

  const loadedComboRef = useRef(null);
  const finalizeSnapshotRef = useRef({
    total: 0,
    ingredientList: [],
    resolvedComboName: "",
    selectedBase: null,
    selectedMixer: null,
    extras: {},
  });

  const addItem = useCartStore((s) => s.addItem);
  const saveComboForCliente = useSavedCombosStore((s) => s.saveComboForCliente);
  const getComboById = useSavedCombosStore((s) => s.getComboById);

  const canSaveCombo = Boolean(selectedBase && selectedMixer);

  useEffect(() => {
    if (!mounted || !comboId || loadedComboRef.current === comboId) return;

    const applySavedCombo = () => {
      const saved = getComboById(comboId);
      if (!saved) return false;
      if (!saved.base || !saved.mixer) {
        toast.error("Este combo guardado está incompleto. Armá uno nuevo.");
        return false;
      }
      loadedComboRef.current = comboId;
      setSelectedBase(saved.base);
      setSelectedMixer(saved.mixer);
      setExtras(saved.extras ?? {});
      setComboName(saved.name ?? "");
      setCurrentStep(3);
      toast.success("Combo cargado desde Tus combos");
      if (saved.legacyIceSkipped) {
        toast.info(
          "El hielo de este combo usaba un formato anterior. Agregalo de nuevo desde Extras si lo necesitás."
        );
      }
      return true;
    };

    if (applySavedCombo()) return;

    const persistApi = useSavedCombosStore.persist;
    if (persistApi?.hasHydrated?.()) {
      toast.error("No encontramos ese combo guardado");
      return;
    }

    const unsub = persistApi?.onFinishHydration?.(() => {
      if (loadedComboRef.current === comboId) return;
      if (!applySavedCombo()) {
        toast.error("No encontramos ese combo guardado");
      }
    });

    return () => unsub?.();
  }, [
    mounted,
    comboId,
    getComboById,
    setSelectedBase,
    setSelectedMixer,
    setExtras,
    setCurrentStep,
  ]);

  const handleFinalize = useCallback(async () => {
    const snap = finalizeSnapshotRef.current;
    const base = snap.selectedBase;
    const mixer = snap.selectedMixer;

    if (!base || !mixer) {
      toast.error("Elegí una base y un acompañante para armar tu combo");
      return;
    }

    if (saveOnFinalize) {
      const authState = useAuthStore.getState();
      if (!selectIsSessionLoaded(authState)) {
        await authState.validateSession({ force: true });
      }

      const result = await saveComboForCliente({
        name: comboName,
        base,
        mixer,
        extras: snap.extras,
      });

      if (result.reason === "unauthenticated") {
        toast.info("Iniciá sesión para guardar combos");
        return;
      } else if (result.ok) {
        toast.success("Combo guardado en Mis Combos");
      } else {
        toast.error("No pudimos guardar el combo. Intentá nuevamente.");
      }
    }

    addItem(
      buildComboCartItem({
        resolvedComboName: snap.resolvedComboName,
        selectedBase: base,
        selectedMixer: mixer,
        extras: snap.extras,
        total: snap.total,
        ingredientList: snap.ingredientList,
        stamp: Date.now(),
      })
    );

    toast.success("¡Combo creado y agregado al carrito!");

    resetSelections();
    setComboName("");
    setSaveOnFinalize(false);
    setCurrentStep(1);
    setSearchBase("");
    setSearchMixer("");
    setSearchExtras("");
    setListPage({ 1: 1, 2: 1, 3: 1 });
  }, [
    saveOnFinalize,
    comboName,
    saveComboForCliente,
    addItem,
    resetSelections,
    setCurrentStep,
    setSearchBase,
    setSearchMixer,
    setSearchExtras,
    setListPage,
  ]);

  return {
    comboName,
    setComboName,
    saveOnFinalize,
    setSaveOnFinalize,
    canSaveCombo,
    handleFinalize,
    finalizeSnapshotRef,
  };
}
