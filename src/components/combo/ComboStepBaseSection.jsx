"use client";

import { Beer, Search } from "lucide-react";
import ComboPaginatedProductList from "@/components/combo/ComboPaginatedProductList";
import ComboProductRow from "@/components/combo/ComboProductRow";
import ComboSearchInput from "@/components/combo/ComboSearchInput";
import ComboStepNextButton from "@/components/combo/ComboStepNextButton";
import { ComboEmptyState } from "@/components/combo/ComboStatusCard";

/**
 * Paso 1 del wizard: elegir base (presentacional).
 */
export default function ComboStepBaseSection({
  searchValue,
  onSearchChange,
  items,
  page,
  onPageChange,
  listAnchorRef,
  selections,
  onSelectProduct,
  onIncProduct,
  onDecProduct,
  nextLabel,
  nextDisabled,
  onNext,
}) {
  return (
    <section className="card-fade-in">
      <h2 className="text-xl font-extrabold text-zinc-900">Elegí tu base</h2>
      <p className="mb-3 text-sm text-zinc-500">
        Elegí una o más bases y ajustá las cantidades.
      </p>

      <ComboSearchInput
        value={searchValue}
        onChange={onSearchChange}
        placeholder="¿Qué te gustaría tomar hoy?"
        className="mb-4"
      />

      <ComboPaginatedProductList
        items={items}
        page={page}
        onPageChange={onPageChange}
        listAnchorRef={listAnchorRef}
        emptyState={
          <ComboEmptyState
            icon={searchValue ? Search : Beer}
            title={
              searchValue
                ? "No encontramos productos"
                : "No hay bebidas base disponibles"
            }
            description={
              searchValue
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
            quantity={selections[p.id]?.cantidad ?? 0}
            onSelect={onSelectProduct}
            onIncrement={onIncProduct}
            onDecrement={onDecProduct}
            fallbackIcon={Beer}
          />
        )}
      </ComboPaginatedProductList>

      {items.length > 0 ? (
        <ComboStepNextButton
          label={nextLabel}
          disabled={nextDisabled}
          onClick={onNext}
        />
      ) : null}
    </section>
  );
}
