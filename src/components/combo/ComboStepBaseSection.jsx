"use client";

import { Beer, Search } from "lucide-react";
import ComboPaginatedProductList from "@/components/combo/ComboPaginatedProductList";
import ComboProductRow from "@/components/combo/ComboProductRow";
import ComboSearchInput from "@/components/combo/ComboSearchInput";
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
  selectedProduct,
  onSelectProduct,
}) {
  return (
    <section className="card-fade-in">
      <h2 className="text-xl font-extrabold text-zinc-900">Elegí tu base</h2>
      <p className="mb-3 text-sm text-zinc-500">El protagonista de tu combo.</p>

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
            isSelected={selectedProduct?.id === p.id}
            onSelect={onSelectProduct}
            fallbackIcon={Beer}
          />
        )}
      </ComboPaginatedProductList>
    </section>
  );
}
