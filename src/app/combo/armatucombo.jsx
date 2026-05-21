"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Beer, CupSoda, Loader2, Search } from "lucide-react";
import ComboActionBar from "@/components/combo/ComboActionBar";
import ComboExtraRow from "@/components/combo/ComboExtraRow";
import ComboIceRow from "@/components/combo/ComboIceRow";
import ComboProductRow from "@/components/combo/ComboProductRow";
import ComboSectionList from "@/components/combo/ComboSectionList";
import ComboSummaryCard from "@/components/combo/ComboSummaryCard";
import ComboStepper from "@/components/combo/ComboStepper";
import ComboWizardHeader from "@/components/combo/ComboWizardHeader";
import { useCartStore } from "@/store/useCartStore";
import { useSavedCombosStore } from "@/store/useSavedCombosStore";
import { toast } from "@/lib/toast";
import { formatPrice } from "@/utils/format/price";
import {
  PRODUCTOS_ENDPOINT,
  ICE_BAG_PRICE,
  AUTO_ADVANCE_MS,
  classifyProducts,
  filterByText,
  mapSelectableProduct,
  paginateList,
} from "@/features/combo/combo.constants";
import {
  COMBO_ACTION_BAR_CLASS,
  COMBO_CONTENT_CLASS,
  COMBO_PAGE_CLASS,
  COMBO_SCROLL_AREA_CLASS,
  COMBO_WIZARD_CHROME_CLASS,
  COMBO_WIZARD_COLUMN_CLASS,
} from "@/constants/homeTheme";

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
          className="flex-1 rounded-xl border border-zinc-200 bg-white py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Anterior
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex-1 rounded-xl border border-zinc-200 bg-white py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
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

function SearchInput({ value, onChange, placeholder, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
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

  // Wizard
  const [currentStep, setCurrentStep] = useState(1);

  // Selecciones
  const [selectedBase, setSelectedBase] = useState(null);
  const [selectedMixer, setSelectedMixer] = useState(null);
  const [extras, setExtras] = useState({}); // { [id]: { product, cantidad } }
  const [iceBags, setIceBags] = useState(0);

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
  const saveCombo = useSavedCombosStore((s) => s.saveCombo);
  const syncCombosFromApi = useSavedCombosStore((s) => s.syncCombosFromApi);
  const getComboById = useSavedCombosStore((s) => s.getComboById);

  useEffect(() => {
    setMounted(true);
    void syncCombosFromApi();
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, [syncCombosFromApi]);

  useEffect(() => {
    if (!mounted) return;
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(PRODUCTOS_ENDPOINT, {
          cache: "no-store",
          signal: controller.signal,
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
    })();

    return () => controller.abort();
  }, [mounted]);

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
      loadedComboRef.current = loadComboId;
      setSelectedBase(saved.base ?? null);
      setSelectedMixer(saved.mixer ?? null);
      setExtras(saved.extras ?? {});
      setIceBags(saved.iceBags ?? 0);
      setCurrentStep(3);
      toast.success("Combo cargado desde Tus combos");
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
    for (const id in extras) {
      sum += (Number(extras[id].product.precio) || 0) * extras[id].cantidad;
    }
    sum += iceBags * ICE_BAG_PRICE;
    return sum;
  }, [selectedBase, selectedMixer, extras, iceBags]);

  const comboSummaryLabel = useMemo(() => {
    if (selectedBase && selectedMixer) return "1 Combo personalizado";
    if (selectedBase) return "Elegí tu mix";
    if (currentStep === 2 && selectedMixer) return "Elegí tu base";
    return "Armá tu combo";
  }, [selectedBase, selectedMixer, currentStep]);

  const canSaveCombo = Boolean(selectedBase && selectedMixer);

  const resolvedComboName = useMemo(() => {
    const trimmed = comboName.trim();
    return trimmed.length > 0 ? trimmed : "Mi Combo Custom";
  }, [comboName]);

  /** Lista legible de ingredientes para descripción/observaciones del combo. */
  const ingredientList = useMemo(() => {
    const lines = [];
    if (selectedBase) lines.push(`1× ${selectedBase.nombre}`);
    if (selectedMixer) lines.push(`1× ${selectedMixer.nombre}`);
    for (const id in extras) {
      const { product, cantidad } = extras[id];
      lines.push(`${cantidad}× ${product.nombre}`);
    }
    if (iceBags > 0) lines.push(`${iceBags}× Bolsa de Hielo`);
    return lines;
  }, [selectedBase, selectedMixer, extras, iceBags]);

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

  const handleFinalize = () => {
    if (!selectedBase || !selectedMixer) {
      toast.error("Elegí una base y un acompañante para armar tu combo");
      return;
    }

    // 1) Persistir en "Tus combos" si el usuario lo pidió.
    if (saveOnFinalize) {
      saveCombo({
        name: resolvedComboName,
        base: selectedBase,
        mixer: selectedMixer,
        extras,
        iceBags,
      });
    }

    // 2) Agregar al carrito como un único ítem agrupado.
    const stamp = Date.now();
    const description = ingredientList.join(" + ");
    addItem({
      articuloId: `combo-personalizado-${stamp}`,
      slug: `combo-personalizado-${stamp}`,
      nombre: resolvedComboName,
      precioBase: total,
      cantidad: 1,
      categoria_nombre: "Combo Personalizado",
      imagen_url: selectedBase.imagen_url ?? selectedMixer.imagen_url ?? null,
      observaciones: `Combo Personalizado · ${description}`,
    });

    toast.success(
      saveOnFinalize
        ? "¡Combo creado y guardado en «Tus combos»!"
        : "¡Combo creado y agregado al carrito!"
    );

    setSelectedBase(null);
    setSelectedMixer(null);
    setExtras({});
    setIceBags(0);
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
    return (
      <div className={COMBO_PAGE_CLASS}>
        <div className={COMBO_CONTENT_CLASS}>
          <div className={COMBO_WIZARD_COLUMN_CLASS}>
            <div className={COMBO_WIZARD_CHROME_CLASS}>
              <div className="h-6 w-40 animate-pulse rounded bg-zinc-100" />
              <div className="mt-3 h-8 w-full animate-pulse rounded-lg bg-zinc-100" />
            </div>
            <div className={COMBO_SCROLL_AREA_CLASS}>
              <div className="mt-2 h-24 animate-pulse rounded-xl bg-zinc-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={COMBO_PAGE_CLASS}>
      <div className={COMBO_CONTENT_CLASS}>
        <div className={COMBO_WIZARD_COLUMN_CLASS}>
          <div className={COMBO_WIZARD_CHROME_CLASS}>
            <ComboWizardHeader
              title="Armá tu Combo"
              currentStep={currentStep}
              onBack={handleBack}
            />
            <ComboStepper currentStep={currentStep} />
          </div>

          <div className={COMBO_SCROLL_AREA_CLASS}>
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center text-zinc-400">
            <Loader2 className="animate-spin" size={28} />
          </div>
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
                    <p className="rounded-xl bg-zinc-50 p-4 text-center text-sm text-zinc-400">
                      {searchBase
                        ? "No encontramos coincidencias."
                        : "No hay bebidas base disponibles."}
                    </p>
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
                    <p className="rounded-xl bg-zinc-50 p-4 text-center text-sm text-zinc-400">
                      {searchMixer
                        ? "No encontramos coincidencias."
                        : "No hay acompañantes disponibles."}
                    </p>
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
                    Sumá snacks, extras y bolsas de hielo. Todo opcional.
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
                  <ComboIceRow
                    quantity={iceBags}
                    unitPrice={ICE_BAG_PRICE}
                    onInc={() => setIceBags((c) => c + 1)}
                    onDec={() => setIceBags((c) => Math.max(0, c - 1))}
                  />
                  {filteredExtras.length === 0 ? (
                    <p className="border-t border-zinc-100/80 px-4 py-6 text-center text-sm text-zinc-400">
                      {searchExtras
                        ? "No encontramos coincidencias."
                        : "No hay extras disponibles."}
                    </p>
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

          {/* Barra de acción en flujo (no fixed): evita clipping AppShell + tapa contenido */}
          <footer className={COMBO_ACTION_BAR_CLASS} aria-label="Resumen y acción del combo">
            <ComboActionBar
              currentStep={currentStep}
              total={total}
              summaryLabel={comboSummaryLabel}
              nextDisabled={nextDisabled}
              primaryActionLabel={nextLabel}
              onPrimaryAction={handleNext}
            />
          </footer>
        </div>
      </div>
    </div>
  );
}

function ArmaTuComboFallback() {
  return (
    <div className={COMBO_PAGE_CLASS}>
      <div className={COMBO_CONTENT_CLASS}>
        <div className={COMBO_WIZARD_COLUMN_CLASS}>
          <div className={COMBO_WIZARD_CHROME_CLASS}>
            <div className="h-6 w-40 animate-pulse rounded bg-zinc-100" />
            <div className="mt-3 h-8 w-full animate-pulse rounded-lg bg-zinc-100" />
          </div>
          <div className={COMBO_SCROLL_AREA_CLASS}>
            <div className="mt-2 h-24 animate-pulse rounded-xl bg-zinc-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ArmaTuCombo() {
  return (
    <Suspense fallback={<ArmaTuComboFallback />}>
      <ArmaTuComboContent />
    </Suspense>
  );
}
