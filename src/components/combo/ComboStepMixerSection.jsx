"use client";

import { CupSoda, Search } from "lucide-react";
import ComboPaginatedProductList from "@/components/combo/ComboPaginatedProductList";
import ComboProductRow from "@/components/combo/ComboProductRow";
import ComboSearchInput from "@/components/combo/ComboSearchInput";
import ComboStepNextButton from "@/components/combo/ComboStepNextButton";
import { ComboEmptyState } from "@/components/combo/ComboStatusCard";

/**
 * Paso 2 del wizard: elegir mix (presentacional).
 */
export default function ComboStepMixerSection({
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
      <h2 className="text-xl font-extrabold text-zinc-900">Elegí el mix</h2>
      <p className="mb-3 text-sm text-zinc-500">
        Sumá uno o más acompañantes y ajustá las cantidades.
      </p>

      <ComboSearchInput
        value={searchValue}
        onChange={onSearchChange}
        placeholder="Buscar acompañante..."
        className="mb-4"
      />

      <ComboPaginatedProductList
        items={items}
        page={page}
        onPageChange={onPageChange}
        listAnchorRef={listAnchorRef}
        emptyState={
          <ComboEmptyState
            icon={searchValue ? Search : CupSoda}
            title={
              searchValue
                ? "No encontramos productos"
                : "No hay acompañantes disponibles"
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
            fallbackIcon={CupSoda}
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
