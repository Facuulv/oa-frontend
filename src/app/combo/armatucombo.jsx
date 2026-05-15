"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Beer,
  Check,
  CupSoda,
  Loader2,
  Minus,
  PartyPopper,
  Plus,
  Save,
  Search,
  Sparkles,
  Snowflake,
} from "lucide-react";
import ImageWithFade from "@/components/ImageWithFade";
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
      <div className="space-y-2.5">{pageItems.map(children)}</div>
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

function Stepper({ current }) {
  const steps = [
    { id: 1, label: "Base" },
    { id: 2, label: "Mix" },
    { id: 3, label: "Combo" },
  ];
  return (
    <div className="mb-5 flex items-center justify-center">
      {steps.map((s, i) => {
        const isActive = current === s.id;
        const isDone = current > s.id;
        return (
          <div key={s.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold transition-colors ${
                  isActive
                    ? "bg-[#C1121F] text-white shadow-sm"
                    : isDone
                      ? "bg-[#C1121F]/15 text-[#C1121F]"
                      : "bg-zinc-100 text-zinc-400"
                }`}
              >
                {isDone ? <Check size={14} strokeWidth={3} /> : s.id}
              </span>
              <span
                className={`text-xs font-semibold ${
                  current >= s.id ? "text-zinc-900" : "text-zinc-400"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span
                className={`mx-3 h-px w-7 ${
                  isDone ? "bg-[#C1121F]/40" : "bg-zinc-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

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
        className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#C1121F]/40 focus:ring-2 focus:ring-[#C1121F]/15"
      />
    </div>
  );
}

function StickySearchBar({ value, onChange, placeholder }) {
  return (
    <div className="sticky top-0 z-20 -mx-4 mb-3 border-b border-zinc-100 bg-white/95 px-4 pb-3 pt-1 backdrop-blur-md">
      <SearchInput value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  );
}

function ProductRow({ product, isSelected, onSelect, fallbackIcon: FallbackIcon = Beer }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className={`flex w-full items-center gap-3 rounded-2xl border bg-white p-2.5 text-left shadow-sm transition active:scale-[0.99] ${
        isSelected
          ? "border-[#C1121F] ring-2 ring-[#C1121F]/30"
          : "border-zinc-200 hover:border-zinc-300"
      }`}
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-50">
        {product.imagen_url ? (
          <ImageWithFade
            src={product.imagen_url}
            alt={product.nombre}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-300">
            <FallbackIcon size={26} />
          </div>
        )}
        {isSelected && (
          <span className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#C1121F] text-white shadow">
            <Check size={12} strokeWidth={3} />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-bold text-zinc-900">
          {product.nombre}
        </p>
        {product.categoria_nombre && (
          <p className="text-xs text-zinc-500">{product.categoria_nombre}</p>
        )}
      </div>
      <span className="ml-2 text-sm font-extrabold text-[#C1121F]">
        {formatPrice(product.precio)}
      </span>
    </button>
  );
}


function ExtraListRow({ product, cantidad, onInc, onDec }) {
  return (
    <div className="flex items-center gap-3 border-b border-zinc-100 py-3 last:border-b-0">
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-zinc-100">
        {product.imagen_url ? (
          <ImageWithFade
            src={product.imagen_url}
            alt={product.nombre}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400">
            <PartyPopper size={18} />
          </div>
        )}
        {cantidad > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C1121F] px-1 text-[10px] font-bold text-white">
            {cantidad}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-semibold text-zinc-900">
          {product.nombre}
        </p>
        <p className="text-sm font-bold text-[#C1121F]">
          {formatPrice(product.precio)}
        </p>
      </div>
      {cantidad === 0 ? (
        <button
          type="button"
          onClick={onInc}
          aria-label={`Agregar ${product.nombre}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C1121F] text-white shadow-sm transition active:scale-95"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      ) : (
        <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-1 py-0.5">
          <button
            type="button"
            onClick={onDec}
            aria-label={`Quitar ${product.nombre}`}
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-700 transition active:scale-95"
          >
            <Minus size={14} />
          </button>
          <span className="min-w-[1.25rem] text-center text-sm font-bold text-zinc-900">
            {cantidad}
          </span>
          <button
            type="button"
            onClick={onInc}
            aria-label={`Sumar ${product.nombre}`}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C1121F] text-white transition active:scale-95"
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}

function IceListRow({ value, onInc, onDec }) {
  return (
    <div className="flex items-center gap-3 border-b border-zinc-100 py-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-500">
        <Snowflake size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-zinc-900">Bolsa de Hielo</p>
        <p className="text-sm font-bold text-[#C1121F]">
          {formatPrice(ICE_BAG_PRICE)}
        </p>
      </div>
      {value === 0 ? (
        <button
          type="button"
          onClick={onInc}
          aria-label="Agregar bolsa de hielo"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C1121F] text-white shadow-sm transition active:scale-95"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      ) : (
        <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-1 py-0.5">
          <button
            type="button"
            onClick={onDec}
            aria-label="Quitar bolsa de hielo"
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-700 transition active:scale-95"
          >
            <Minus size={14} />
          </button>
          <span className="min-w-[1.25rem] text-center text-sm font-bold text-zinc-900">
            {value}
          </span>
          <button
            type="button"
            onClick={onInc}
            aria-label="Agregar bolsa de hielo"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C1121F] text-white transition active:scale-95"
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
        </div>
      )}
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
  const getComboById = useSavedCombosStore((s) => s.getComboById);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

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
      <div className="min-h-screen bg-white px-4 pt-4">
        <div className="mx-auto w-full max-w-[480px]">
          <div className="h-6 w-40 animate-pulse rounded bg-zinc-100" />
          <div className="mt-4 h-7 w-56 animate-pulse rounded bg-zinc-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto w-full max-w-[480px] px-4 pb-24 pt-3">
        {/* Header con Volver + título */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Volver"
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-700 transition hover:bg-zinc-100 active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-base font-extrabold tracking-tight text-zinc-900">
            Armá tu Combo
          </h1>
          <span className="h-9 w-9" aria-hidden />
        </div>

        <Stepper current={currentStep} />

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
                    <ProductRow
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
                    <ProductRow
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

                <StickySearchBar
                  value={searchExtras}
                  onChange={setSearchExtras}
                  placeholder="¡No te olvides de nada!"
                />

                <div ref={listTopRef} className="scroll-mt-24" tabIndex={-1} />

                <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white">
                  <IceListRow
                    value={iceBags}
                    onInc={() => setIceBags((c) => c + 1)}
                    onDec={() => setIceBags((c) => Math.max(0, c - 1))}
                  />
                  {filteredExtras.length === 0 ? (
                    <p className="border-t border-zinc-100 px-4 py-6 text-center text-sm text-zinc-400">
                      {searchExtras
                        ? "No encontramos coincidencias."
                        : "No hay extras disponibles."}
                    </p>
                  ) : (
                    extrasPaginated.pageItems.map((p) => (
                      <ExtraListRow
                        key={p.id}
                        product={p}
                        cantidad={extras[p.id]?.cantidad ?? 0}
                        onInc={() => incExtra(p)}
                        onDec={() => decExtra(p)}
                      />
                    ))
                  )}
                </div>

                {extrasPaginated.showPagination && (
                  <ListPaginationControls
                    page={extrasPaginated.page}
                    totalPages={extrasPaginated.totalPages}
                    onPageChange={(p) => goToListPage(3, p)}
                  />
                )}

                {/* Crea tu combo personalizado: nombre + opción de guardar */}
                <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#C1121F]/10 text-[#C1121F]">
                      <Sparkles size={16} strokeWidth={2.5} />
                    </span>
                    <h3 className="text-sm font-extrabold text-zinc-900">
                      Tu Combo Personalizado
                    </h3>
                  </div>

                  <label
                    htmlFor="combo-name"
                    className="block text-xs font-semibold uppercase tracking-wider text-zinc-500"
                  >
                    Nombre del combo
                  </label>
                  <input
                    id="combo-name"
                    type="text"
                    value={comboName}
                    onChange={(e) => setComboName(e.target.value)}
                    placeholder="Mi Combo Custom"
                    maxLength={48}
                    className="mt-1 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-900 outline-none transition placeholder:font-normal placeholder:text-zinc-400 focus:border-[#C1121F]/40 focus:ring-2 focus:ring-[#C1121F]/15"
                  />

                  {ingredientList.length > 0 && (
                    <ul className="mt-3 space-y-1 text-xs text-zinc-600">
                      {ingredientList.map((line, idx) => (
                        <li key={`${line}-${idx}`} className="flex items-center gap-1.5">
                          <span className="inline-block h-1 w-1 rounded-full bg-[#C1121F]" />
                          {line}
                        </li>
                      ))}
                    </ul>
                  )}

                  <label
                    htmlFor="combo-save-toggle"
                    className={`mt-4 flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                      saveOnFinalize
                        ? "border-[#C1121F] bg-[#C1121F]/4"
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    } ${!canSaveCombo ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    <input
                      id="combo-save-toggle"
                      type="checkbox"
                      checked={saveOnFinalize}
                      disabled={!canSaveCombo}
                      onChange={(e) => setSaveOnFinalize(e.target.checked)}
                      className="mt-0.5 h-5 w-5 shrink-0 accent-[#C1121F]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 text-sm font-bold text-zinc-900">
                        <Save size={14} strokeWidth={2.5} className="text-[#C1121F]" />
                        Guardar en Mis Combos
                      </p>
                      <p className="text-xs text-zinc-500">
                        Lo vas a encontrar después en la barra lateral, listo para volver a pedirlo.
                      </p>
                    </div>
                  </label>
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* ─────────── Resumen flotante ─────────── */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950 antialiased shadow-[0_-8px_30px_rgba(0,0,0,0.35)]"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex w-full max-w-[480px] items-center justify-between gap-4 px-4 py-4">
          <div className="min-w-0 shrink">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white">
              {comboSummaryLabel}
            </p>
            <p className="mt-0.5 truncate text-2xl font-bold tabular-nums leading-none text-white">
              {formatPrice(total)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleNext}
            disabled={nextDisabled}
            className="flex min-h-[48px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#C1121F] px-6 py-3.5 text-base font-bold text-white shadow-lg transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-white"
          >
            {currentStep === 3 && <Sparkles size={18} strokeWidth={2.5} />}
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ArmaTuComboFallback() {
  return (
    <div className="min-h-screen bg-white px-4 pt-4">
      <div className="mx-auto w-full max-w-[480px]">
        <div className="h-6 w-40 animate-pulse rounded bg-zinc-100" />
        <div className="mt-4 h-7 w-56 animate-pulse rounded bg-zinc-100" />
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
