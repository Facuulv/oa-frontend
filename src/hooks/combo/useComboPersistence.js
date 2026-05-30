"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildComboCartItem,
  hasSelectionInMap,
} from "@/features/combo/comboBuilder";
import { useCartStore } from "@/store/useCartStore";
import { useSavedCombosStore } from "@/store/useSavedCombosStore";
import {
  useAuthStore,
  selectIsSessionLoaded,
} from "@/store/useAuthStore";
import { toast } from "@/lib/toast";

function mapFromLegacyProduct(product) {
  if (!product?.id) return {};
  return { [product.id]: { product, cantidad: 1 } };
}

function normalizeSavedSelections(saved) {
  const bases =
    saved?.bases && typeof saved.bases === "object"
      ? saved.bases
      : mapFromLegacyProduct(saved?.base);
  const mixers =
    saved?.mixers && typeof saved.mixers === "object"
      ? saved.mixers
      : mapFromLegacyProduct(saved?.mixer);
  return { bases, mixers, extras: saved?.extras ?? {} };
}

/**
 * Persistencia: nombre, guardar en Mis Combos, carga `?combo=`, finalizar y reset del wizard.
 */
export function useComboPersistence({
  mounted,
  comboId,
  bases,
  mixers,
  extras,
  setBases,
  setMixers,
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
    bases: {},
    mixers: {},
    extras: {},
  });

  const addItem = useCartStore((s) => s.addItem);
  const saveComboForCliente = useSavedCombosStore((s) => s.saveComboForCliente);
  const getComboById = useSavedCombosStore((s) => s.getComboById);

  const canSaveCombo =
    hasSelectionInMap(bases) && hasSelectionInMap(mixers);

  useEffect(() => {
    if (!mounted || !comboId || loadedComboRef.current === comboId) return;

    const applySavedCombo = () => {
      const saved = getComboById(comboId);
      if (!saved) return false;

      const normalized = normalizeSavedSelections(saved);
      if (
        !hasSelectionInMap(normalized.bases) ||
        !hasSelectionInMap(normalized.mixers)
      ) {
        toast.error("Este combo guardado está incompleto. Armá uno nuevo.");
        return false;
      }

      loadedComboRef.current = comboId;
      setBases(normalized.bases);
      setMixers(normalized.mixers);
      setExtras(normalized.extras);
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
    setBases,
    setMixers,
    setExtras,
    setCurrentStep,
  ]);

  const handleFinalize = useCallback(async () => {
    const snap = finalizeSnapshotRef.current;

    if (
      !hasSelectionInMap(snap.bases) ||
      !hasSelectionInMap(snap.mixers)
    ) {
      toast.error("Elegí al menos una base y un acompañante para armar tu combo");
      return;
    }

    if (saveOnFinalize) {
      const authState = useAuthStore.getState();
      if (!selectIsSessionLoaded(authState)) {
        await authState.validateSession({ force: true });
      }

      const result = await saveComboForCliente({
        name: comboName,
        bases: snap.bases,
        mixers: snap.mixers,
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
        bases: snap.bases,
        mixers: snap.mixers,
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
