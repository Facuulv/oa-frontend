"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ComboActionBar from "@/components/combo/ComboActionBar";
import ComboBuilderSkeleton, {
  ComboActionBarSkeleton,
  ComboSummaryPanelSkeleton,
} from "@/components/combo/ComboBuilderSkeleton";
import ComboStepBaseSection from "@/components/combo/ComboStepBaseSection";
import ComboStepExtrasSection from "@/components/combo/ComboStepExtrasSection";
import ComboStepMixerSection from "@/components/combo/ComboStepMixerSection";
import { ComboErrorState } from "@/components/combo/ComboStatusCard";
import ComboSummaryPanel from "@/components/combo/ComboSummaryPanel";
import ComboStepper from "@/components/combo/ComboStepper";
import ComboWizardHeader from "@/components/combo/ComboWizardHeader";

import {
  COMBO_ACTION_BAR_MOBILE_CLASS,
  COMBO_CONTENT_CLASS,
  COMBO_PAGE_CLASS,
  COMBO_SCROLL_AREA_CLASS,
  COMBO_WIZARD_CHROME_CLASS,
  COMBO_WIZARD_LAYOUT_CLASS,
  COMBO_WIZARD_MAIN_CLASS,
} from "@/constants/homeTheme";
import { paginateList } from "@/features/combo/combo.constants";
import { useComboPersistence } from "@/hooks/combo/useComboPersistence";
import { useComboProducts } from "@/hooks/combo/useComboProducts";
import { useComboSelections } from "@/hooks/combo/useComboSelections";
import { useComboTotals } from "@/hooks/combo/useComboTotals";
import { useComboWizard } from "@/hooks/combo/useComboWizard";
import { useSavedCombosStore } from "@/store/useSavedCombosStore";
import {
  useAuthStore,
  selectIsAuthenticatedCliente,
} from "@/store/useAuthStore";

/**
 * Orquestador de /arma-tu-combo: compone hooks (catálogo, selección, wizard, totales,
 * persistencia) y componentes presentacionales por paso. Sin lógica de negocio inline.
 */

function ArmaTuComboContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const comboId = searchParams.get("combo");

  const [mounted, setMounted] = useState(false);
  const onFinalizeRef = useRef(null);

  const {
    selectedBase,
    setSelectedBase,
    selectedMixer,
    setSelectedMixer,
    extras,
    setExtras,
    incExtra,
    decExtra,
    resetSelections,
  } = useComboSelections();

  const {
    currentStep,
    setCurrentStep,
    handleSelectBase,
    handleSelectMixer,
    handleBack,
    handleNext,
  } = useComboWizard({
    selectedBase,
    selectedMixer,
    setSelectedBase,
    setSelectedMixer,
    onFinalize: () => onFinalizeRef.current?.(),
    router,
  });

  const [searchBase, setSearchBase] = useState("");
  const [searchMixer, setSearchMixer] = useState("");
  const [searchExtras, setSearchExtras] = useState("");
  const [listPage, setListPage] = useState({ 1: 1, 2: 1, 3: 1 });
  const listTopRef = useRef(null);

  const syncCombosFromApi = useSavedCombosStore((s) => s.syncCombosFromApi);

  const catalog = useComboProducts({
    enabled: mounted,
    searchBase,
    searchMixer,
    searchExtras,
  });
  const {
    showLoadingSkeleton,
    error,
    retry,
    filteredBases,
    filteredMixers,
    filteredExtras,
  } = catalog;

  useEffect(() => {
    setMounted(true);
    if (selectIsAuthenticatedCliente(useAuthStore.getState())) {
      void syncCombosFromApi();
    }
  }, [syncCombosFromApi]);

  useEffect(() => {
    setListPage((p) => ({ ...p, 1: 1 }));
  }, [searchBase]);
  useEffect(() => {
    setListPage((p) => ({ ...p, 2: 1 }));
  }, [searchMixer]);
  useEffect(() => {
    setListPage((p) => ({ ...p, 3: 1 }));
  }, [searchExtras]);

  const persistence = useComboPersistence({
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
  });
  const {
    comboName,
    setComboName,
    saveOnFinalize,
    setSaveOnFinalize,
    canSaveCombo,
    handleFinalize,
    finalizeSnapshotRef,
  } = persistence;

  const goToListPage = (step, page) => {
    setListPage((prev) => ({ ...prev, [step]: page }));
    requestAnimationFrame(() => {
      listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const extrasPaginated = useMemo(
    () => paginateList(filteredExtras, listPage[3]),
    [filteredExtras, listPage[3]]
  );

  const totals = useComboTotals({
    currentStep,
    selectedBase,
    selectedMixer,
    extras,
    comboName,
  });
  const {
    total,
    comboSummaryLabel,
    resolvedComboName,
    ingredientList,
    nextDisabled,
    nextLabel,
  } = totals;

  finalizeSnapshotRef.current = {
    total,
    ingredientList,
    resolvedComboName,
    selectedBase,
    selectedMixer,
    extras,
  };
  onFinalizeRef.current = handleFinalize;

  if (!mounted) {
    return <ComboBuilderSkeleton mode="page" />;
  }

  const showStepContent = !error && !showLoadingSkeleton;

  return (
    <div className={COMBO_PAGE_CLASS}>
      <div className={COMBO_CONTENT_CLASS}>
        <div className={COMBO_WIZARD_LAYOUT_CLASS}>
          <div className={COMBO_WIZARD_MAIN_CLASS}>
            <div className={COMBO_WIZARD_CHROME_CLASS}>
              <ComboWizardHeader
                title="Armá tu Combo"
                currentStep={currentStep}
                onBack={handleBack}
              />
              <ComboStepper currentStep={currentStep} />
            </div>

            <div className={COMBO_SCROLL_AREA_CLASS}>
              {error ? (
                <ComboErrorState message={error} onRetry={retry} />
              ) : showLoadingSkeleton ? (
                <ComboBuilderSkeleton mode="content" />
              ) : (
                <>
                  {currentStep === 1 && (
                    <ComboStepBaseSection
                      searchValue={searchBase}
                      onSearchChange={setSearchBase}
                      items={filteredBases}
                      page={listPage[1]}
                      onPageChange={(p) => goToListPage(1, p)}
                      listAnchorRef={listTopRef}
                      selectedProduct={selectedBase}
                      onSelectProduct={handleSelectBase}
                    />
                  )}
                  {currentStep === 2 && (
                    <ComboStepMixerSection
                      searchValue={searchMixer}
                      onSearchChange={setSearchMixer}
                      items={filteredMixers}
                      page={listPage[2]}
                      onPageChange={(p) => goToListPage(2, p)}
                      listAnchorRef={listTopRef}
                      selectedProduct={selectedMixer}
                      onSelectProduct={handleSelectMixer}
                    />
                  )}
                  {currentStep === 3 && (
                    <ComboStepExtrasSection
                      searchValue={searchExtras}
                      onSearchChange={setSearchExtras}
                      filteredExtras={filteredExtras}
                      extrasPaginated={extrasPaginated}
                      extras={extras}
                      onIncExtra={incExtra}
                      onDecExtra={decExtra}
                      onPageChange={(p) => goToListPage(3, p)}
                      listTopRef={listTopRef}
                      comboName={comboName}
                      onComboNameChange={setComboName}
                      ingredientList={ingredientList}
                      saveOnFinalize={saveOnFinalize}
                      onSaveToggle={setSaveOnFinalize}
                      canSaveCombo={canSaveCombo}
                    />
                  )}
                </>
              )}
            </div>

            {showStepContent ? (
              <footer
                className={COMBO_ACTION_BAR_MOBILE_CLASS}
                aria-label="Resumen y acción del combo"
              >
                <ComboActionBar
                  currentStep={currentStep}
                  total={total}
                  summaryLabel={comboSummaryLabel}
                  nextDisabled={nextDisabled}
                  primaryActionLabel={nextLabel}
                  onPrimaryAction={handleNext}
                />
              </footer>
            ) : (
              <div className={COMBO_ACTION_BAR_MOBILE_CLASS} aria-hidden>
                <ComboActionBarSkeleton />
              </div>
            )}
          </div>

          {showStepContent ? (
            <ComboSummaryPanel
              currentStep={currentStep}
              total={total}
              summaryLabel={comboSummaryLabel}
              primaryActionLabel={nextLabel}
              nextDisabled={nextDisabled}
              onPrimaryAction={handleNext}
              selectedBase={selectedBase}
              selectedMixer={selectedMixer}
              ingredientList={ingredientList}
            />
          ) : (
            <ComboSummaryPanelSkeleton />
          )}
        </div>
      </div>
    </div>
  );
}

function ArmaTuComboFallback() {
  return <ComboBuilderSkeleton mode="page" />;
}

export default function ArmaTuCombo() {
  return (
    <Suspense fallback={<ArmaTuComboFallback />}>
      <ArmaTuComboContent />
    </Suspense>
  );
}
