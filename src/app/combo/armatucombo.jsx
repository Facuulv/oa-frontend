"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Beer, CupSoda, Package, Search } from "lucide-react";
import ComboActionBar from "@/components/combo/ComboActionBar";
import ComboBuilderSkeleton, {
  ComboActionBarSkeleton,
  ComboSummaryPanelSkeleton,
} from "@/components/combo/ComboBuilderSkeleton";
import { ComboEmptyState, ComboErrorState } from "@/components/combo/ComboStatusCard";
import ComboExtraRow from "@/components/combo/ComboExtraRow";
import ComboProductRow from "@/components/combo/ComboProductRow";
import ComboSectionList from "@/components/combo/ComboSectionList";
import ComboSummaryCard from "@/components/combo/ComboSummaryCard";
import ComboSummaryPanel from "@/components/combo/ComboSummaryPanel";
import ComboStepper from "@/components/combo/ComboStepper";
import ComboWizardHeader from "@/components/combo/ComboWizardHeader";
import { useCartStore, CUSTOM_COMBO_LINE_KIND } from "@/store/useCartStore";
import {
  useSavedCombosStore,
  resolveComboName,
} from "@/store/useSavedCombosStore";
import {
  useAuthStore,
  selectIsAuthenticatedCliente,
  selectIsSessionLoaded,
} from "@/store/useAuthStore";
import { toast } from "@/lib/toast";
import { formatPrice } from "@/utils/format/price";
import {
  PRODUCTOS_ENDPOINT,
  AUTO_ADVANCE_MS,
  classifyProducts,
  filterByText,
  mapSelectableProduct,
  paginateList,
  sumSelectionMap,
} from "@/features/combo/combo.constants";
import {
  COMBO_ACTION_BAR_MOBILE_CLASS,
  COMBO_CONTENT_CLASS,
  COMBO_PAGE_CLASS,
  COMBO_SCROLL_AREA_CLASS,
  COMBO_WIZARD_CHROME_CLASS,
  COMBO_WIZARD_LAYOUT_CLASS,
  COMBO_WIZARD_MAIN_CLASS,
} from "@/constants/homeTheme";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";

/**
 * ArmaTuCombo — Wizard paginado por pasos (Base → Mix → Combo).
 *
 *  Paso 1: buscador + lista de bases. Al seleccionar, auto-avanza al paso 2.
 *  Paso 2: lista de mixers. Al seleccionar, auto-avanza al paso 3.
 *  Paso 3: lista compacta de extras + bolsas de hielo.
 *
 * Hidratación segura: no se renderiza nada interactivo antes de `mounted`.
 * Catálogo: solo productos unitarios (excluye promos/combos prearmados del back).
 */

function ListPaginationControls({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div
      className="mt-4 flex flex-col items-center gap-3 border-t border-zinc-100 pt-4"
      role="navigation"
      aria-label="Paginación de productos"
    >
      <p className="text-sm font-medium text-zinc-600">
        Página {page} de {totalPages}
      </p>
      <div className="flex w-full max-w-xs gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex-1 rounded-xl border border-zinc-200 bg-white py-2.5 text-sm font-semibold text-zinc-800 motion-safe:transition hover:bg-zinc-50 motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Anterior
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex-1 rounded-xl border border-zinc-200 bg-white py-2.5 text-sm font-semibold text-zinc-800 motion-safe:transition hover:bg-zinc-50 motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

function PaginatedProductList({ items, page, onPageChange, listAnchorRef, emptyState, children }) {
  const { pageItems, totalPages, page: safePage, showPagination } = paginateList(
    items,
    page
  );

  if (items.length === 0) return emptyState;

  return (
    <>
      <div ref={listAnchorRef} className="scroll-mt-24" tabIndex={-1} />
      <div className="space-y-3">{pageItems.map(children)}</div>
      {showPagination && (
        <ListPaginationControls
          page={safePage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}

// ───────────────────────────── Subcomponentes ─────────────────────────────

function SearchInput({ value, onChange, placeholder, className = "", ariaLabel }) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 outline-none motion-safe:transition placeholder:text-zinc-400 focus:border-primary/40 focus:ring-2 focus:ring-primary/15 focus-visible:outline-none"
      />
    </div>
  );
}

// ───────────────────────────── Componente principal ─────────────────────────────

function ArmaTuComboContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loadComboId = searchParams.get("combo");

  // Hydration safety
  const [mounted, setMounted] = useState(false);

  // Catálogo
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  // Wizard
  const [currentStep, setCurrentStep] = useState(1);

  // Selecciones
  const [selectedBase, setSelectedBase] = useState(null);
  const [selectedMixer, setSelectedMixer] = useState(null);
  const [extras, setExtras] = useState({}); // { [id]: { product, cantidad } } — categoría Extras (hielo + snacks)

  // Personalización del combo final
  const [comboName, setComboName] = useState("");
  const [saveOnFinalize, setSaveOnFinalize] = useState(false);

  // Búsqueda por paso
  const [searchBase, setSearchBase] = useState("");
  const [searchMixer, setSearchMixer] = useState("");
  const [searchExtras, setSearchExtras] = useState("");

  // Paginación local por paso (solo cliente post-mount; default 1 evita mismatch SSR)
  const [listPage, setListPage] = useState({ 1: 1, 2: 1, 3: 1 });

  // Timer de auto-advance (lo limpio si el usuario re-toca o vuelve atrás)
  const advanceTimer = useRef(null);
  const listTopRef = useRef(null);

  const addItem = useCartStore((s) => s.addItem);
  const saveComboForCliente = useSavedCombosStore((s) => s.saveComboForCliente);
  const syncCombosFromApi = useSavedCombosStore((s) => s.syncCombosFromApi);
  const getComboById = useSavedCombosStore((s) => s.getComboById);

  useEffect(() => {
    setMounted(true);
    if (selectIsAuthenticatedCliente(useAuthStore.getState())) {
      void syncCombosFromApi();
    }
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, [syncCombosFromApi]);

  const fetchProducts = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(PRODUCTOS_ENDPOINT, {
        cache: "no-store",
        signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const raw = Array.isArray(json) ? json : (json?.data ?? []);
      const normalized = raw
        .filter((p) => p && (p.disponible === undefined || p.disponible))
        .map(mapSelectableProduct)
        .filter(Boolean);
      setProducts(normalized);
    } catch (err) {
      if (err?.name === "AbortError") return;
      setError(err?.message || "No pudimos cargar los productos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const controller = new AbortController();
    void fetchProducts(controller.signal);
    return () => controller.abort();
  }, [mounted, fetchProducts, retryKey]);

  const showLoadingSkeleton = useDelayedLoading(loading);

  useEffect(() => {
    setListPage((p) => ({ ...p, 1: 1 }));
  }, [searchBase]);

  useEffect(() => {
    setListPage((p) => ({ ...p, 2: 1 }));
  }, [searchMixer]);

  useEffect(() => {
    setListPage((p) => ({ ...p, 3: 1 }));
  }, [searchExtras]);

  const loadedComboRef = useRef(null);

  useEffect(() => {
    if (!mounted || !loadComboId || loadedComboRef.current === loadComboId) return;

    const applySavedCombo = () => {
      const saved = getComboById(loadComboId);
      if (!saved) return false;
      if (!saved.base || !saved.mixer) {
        toast.error("Este combo guardado está incompleto. Armá uno nuevo.");
        return false;
      }
      loadedComboRef.current = loadComboId;
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
      if (loadedComboRef.current === loadComboId) return;
      if (!applySavedCombo()) {
        toast.error("No encontramos ese combo guardado");
      }
    });

    return () => unsub?.();
  }, [mounted, loadComboId, getComboById]);

  const goToListPage = (step, page) => {
    setListPage((prev) => ({ ...prev, [step]: page }));
    requestAnimationFrame(() => {
      listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const { bases, mixers, extrasCatalog } = useMemo(() => {
    const c = classifyProducts(products);
    return { bases: c.bases, mixers: c.mixers, extrasCatalog: c.extras };
  }, [products]);

  const filteredBases = useMemo(
    () => filterByText(bases, searchBase),
    [bases, searchBase]
  );
  const filteredMixers = useMemo(
    () => filterByText(mixers, searchMixer),
    [mixers, searchMixer]
  );
  const filteredExtras = useMemo(
    () => filterByText(extrasCatalog, searchExtras),
    [extrasCatalog, searchExtras]
  );

  const extrasPaginated = useMemo(
    () => paginateList(filteredExtras, listPage[3]),
    [filteredExtras, listPage[3]]
  );

  const total = useMemo(() => {
    let sum = 0;
    if (selectedBase) sum += Number(selectedBase.precio) || 0;
    if (selectedMixer) sum += Number(selectedMixer.precio) || 0;
    sum += sumSelectionMap(extras);
    return sum;
  }, [selectedBase, selectedMixer, extras]);

  const comboSummaryLabel = useMemo(() => {
    if (selectedBase && selectedMixer) return "Total";
    if (selectedBase) return "Elegí tu mix";
    if (currentStep === 2 && selectedMixer) return "Elegí tu base";
    return "Armá tu combo";
  }, [selectedBase, selectedMixer, currentStep]);

  const canSaveCombo = Boolean(selectedBase && selectedMixer);

  const resolvedComboName = useMemo(
    () =>
      resolveComboName({
        name: comboName,
        base: selectedBase,
        mixer: selectedMixer,
      }),
    [comboName, selectedBase, selectedMixer]
  );

  /** Lista legible de ingredientes para descripción/observaciones del combo. */
  const ingredientList = useMemo(() => {
    const lines = [];
    if (selectedBase) lines.push(`1× ${selectedBase.nombre}`);
    if (selectedMixer) lines.push(`1× ${selectedMixer.nombre}`);
    for (const id in extras) {
      const { product, cantidad } = extras[id];
      lines.push(`${cantidad}× ${product.nombre}`);
    }
    return lines;
  }, [selectedBase, selectedMixer, extras]);

  // Auto-advance helper
  const scheduleAdvance = (toStep) => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      setCurrentStep(toStep);
      advanceTimer.current = null;
    }, AUTO_ADVANCE_MS);
  };

  const handleSelectBase = (p) => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (selectedBase?.id === p.id) {
      setSelectedBase(null);
      return;
    }
    setSelectedBase(p);
    scheduleAdvance(2);
  };

  const handleSelectMixer = (p) => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (selectedMixer?.id === p.id) {
      setSelectedMixer(null);
      return;
    }
    setSelectedMixer(p);
    scheduleAdvance(3);
  };

  const incExtra = (product) => {
    setExtras((prev) => {
      const current = prev[product.id]?.cantidad ?? 0;
      return { ...prev, [product.id]: { product, cantidad: current + 1 } };
    });
  };

  const decExtra = (product) => {
    setExtras((prev) => {
      const current = prev[product.id]?.cantidad ?? 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[product.id];
        return next;
      }
      return { ...prev, [product.id]: { product, cantidad: current - 1 } };
    });
  };

  const handleBack = () => {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    } else {
      router.back();
    }
  };

  const handleNext = () => {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    if (currentStep === 1) {
      if (!selectedBase) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedMixer) return;
      setCurrentStep(3);
    } else {
      handleFinalize();
    }
  };

  const handleFinalize = async () => {
    if (!selectedBase || !selectedMixer) {
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
        base: selectedBase,
        mixer: selectedMixer,
        extras,
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

    const stamp = Date.now();
    const description = ingredientList.join(" + ");
    addItem({
      lineKind: CUSTOM_COMBO_LINE_KIND,
      comboComponents: {
        displayName: resolvedComboName,
        base: selectedBase,
        mixer: selectedMixer,
        extras: { ...extras },
      },
      articuloId: `combo-personalizado-${stamp}`,
      slug: `combo-personalizado-${stamp}`,
      nombre: resolvedComboName,
      precioBase: total,
      cantidad: 1,
      categoria_nombre: "Combo Personalizado",
      imagen_url: selectedBase.imagen_url ?? selectedMixer.imagen_url ?? null,
      observaciones: `Combo Personalizado · ${description}`,
    });

    toast.success("¡Combo creado y agregado al carrito!");

    setSelectedBase(null);
    setSelectedMixer(null);
    setExtras({});
    setComboName("");
    setSaveOnFinalize(false);
    setCurrentStep(1);
    setSearchBase("");
    setSearchMixer("");
    setSearchExtras("");
    setListPage({ 1: 1, 2: 1, 3: 1 });
  };

  const nextDisabled =
    (currentStep === 1 && !selectedBase) ||
    (currentStep === 2 && !selectedMixer);

  const nextLabel = currentStep === 3 ? "Crear mi Combo" : "Siguiente";

  // ─── Render ───
  if (!mounted) {
    return <ComboBuilderSkeleton mode="page" />;
  }

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
          <ComboErrorState
            message={error}
            onRetry={() => setRetryKey((k) => k + 1)}
          />
        ) : showLoadingSkeleton ? (
          <ComboBuilderSkeleton mode="content" />
        ) : (
          <>
            {/* ─────────── Paso 1 — La Base ─────────── */}
            {currentStep === 1 && (
              <section className="card-fade-in">
                <h2 className="text-xl font-extrabold text-zinc-900">
                  Elegí tu base
                </h2>
                <p className="mb-3 text-sm text-zinc-500">
                  El protagonista de tu combo.
                </p>

                <SearchInput
                  value={searchBase}
                  onChange={setSearchBase}
                  placeholder="¿Qué te gustaría tomar hoy?"
                  className="mb-4"
                />

                <PaginatedProductList
                  items={filteredBases}
                  page={listPage[1]}
                  onPageChange={(p) => goToListPage(1, p)}
                  listAnchorRef={listTopRef}
                  emptyState={
                    <ComboEmptyState
                      icon={searchBase ? Search : Beer}
                      title={
                        searchBase
                          ? "No encontramos productos"
                          : "No hay bebidas base disponibles"
                      }
                      description={
                        searchBase
                          ? "Probá con otra búsqueda."
                          : "Volvé a intentar más tarde."
                      }
                    />
                  }
                >
                  {(p) => (
                    <ComboProductRow
                      key={p.id}
                      product={p}
                      isSelected={selectedBase?.id === p.id}
                      onSelect={handleSelectBase}
                      fallbackIcon={Beer}
                    />
                  )}
                </PaginatedProductList>
              </section>
            )}

            {/* ─────────── Paso 2 — El Mix ─────────── */}
            {currentStep === 2 && (
              <section className="card-fade-in">
                <h2 className="text-xl font-extrabold text-zinc-900">
                  Elegí el mix
                </h2>
                <p className="mb-3 text-sm text-zinc-500">
                  ¿Con qué lo acompañamos?
                </p>

                <SearchInput
                  value={searchMixer}
                  onChange={setSearchMixer}
                  placeholder="Buscar acompañante..."
                  className="mb-4"
                />

                <PaginatedProductList
                  items={filteredMixers}
                  page={listPage[2]}
                  onPageChange={(p) => goToListPage(2, p)}
                  listAnchorRef={listTopRef}
                  emptyState={
                    <ComboEmptyState
                      icon={searchMixer ? Search : CupSoda}
                      title={
                        searchMixer
                          ? "No encontramos productos"
                          : "No hay acompañantes disponibles"
                      }
                      description={
                        searchMixer
                          ? "Probá con otra búsqueda."
                          : "Volvé a intentar más tarde."
                      }
                    />
                  }
                >
                  {(p) => (
                    <ComboProductRow
                      key={p.id}
                      product={p}
                      isSelected={selectedMixer?.id === p.id}
                      onSelect={handleSelectMixer}
                      fallbackIcon={CupSoda}
                    />
                  )}
                </PaginatedProductList>
              </section>
            )}

            {/* ─────────── Paso 3 — ¿Te quedaste manija? ─────────── */}
            {currentStep === 3 && (
              <section className="card-fade-in">
                <div className="mb-3">
                  <h2 className="text-xl font-extrabold text-zinc-900">
                    ¿Te quedaste manija?
                  </h2>
                  <p className="text-sm text-zinc-500">
                    Sumá extras de la categoría Extras (hielo, snacks y más). Todo opcional.
                  </p>
                </div>

                <SearchInput
                  value={searchExtras}
                  onChange={setSearchExtras}
                  placeholder="¡No te olvides de nada!"
                  className="mb-4"
                />

                <div ref={listTopRef} className="scroll-mt-24" tabIndex={-1} />

                <ComboSectionList>
                  {filteredExtras.length === 0 ? (
                    <ComboEmptyState
                      compact
                      className="border-t border-zinc-100/80"
                      icon={searchExtras ? Search : Package}
                      title={
                        searchExtras
                          ? "No encontramos productos"
                          : "No hay productos en Extras"
                      }
                      description={
                        searchExtras
                          ? "Probá con otra búsqueda."
                          : "Cargá productos en la categoría Extras en el admin."
                      }
                    />
                  ) : (
                    extrasPaginated.pageItems.map((p) => (
                      <ComboExtraRow
                        key={p.id}
                        product={p}
                        cantidad={extras[p.id]?.cantidad ?? 0}
                        onInc={() => incExtra(p)}
                        onDec={() => decExtra(p)}
                      />
                    ))
                  )}
                </ComboSectionList>

                {extrasPaginated.showPagination && (
                  <ListPaginationControls
                    page={extrasPaginated.page}
                    totalPages={extrasPaginated.totalPages}
                    onPageChange={(p) => goToListPage(3, p)}
                  />
                )}

                <ComboSummaryCard
                  comboName={comboName}
                  onComboNameChange={setComboName}
                  ingredientList={ingredientList}
                  saveOnFinalize={saveOnFinalize}
                  onSaveToggle={setSaveOnFinalize}
                  canSaveCombo={canSaveCombo}
                />
              </section>
            )}
          </>
        )}
            </div>

            {showLoadingSkeleton || error ? (
              <div className={COMBO_ACTION_BAR_MOBILE_CLASS} aria-hidden>
                <ComboActionBarSkeleton />
              </div>
            ) : (
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
            )}
          </div>

          {showLoadingSkeleton || error ? (
            <ComboSummaryPanelSkeleton />
          ) : (
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
