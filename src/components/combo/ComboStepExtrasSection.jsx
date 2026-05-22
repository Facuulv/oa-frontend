"use client";

import { Package, Search } from "lucide-react";
import ComboExtraRow from "@/components/combo/ComboExtraRow";
import ComboListPagination from "@/components/combo/ComboListPagination";
import ComboSearchInput from "@/components/combo/ComboSearchInput";
import ComboSectionList from "@/components/combo/ComboSectionList";
import ComboSummaryCard from "@/components/combo/ComboSummaryCard";
import { ComboEmptyState } from "@/components/combo/ComboStatusCard";

/**
 * Paso 3 del wizard: extras + resumen final (presentacional).
 */
export default function ComboStepExtrasSection({
  searchValue,
  onSearchChange,
  filteredExtras,
  extrasPaginated,
  extras,
  onIncExtra,
  onDecExtra,
  onPageChange,
  listTopRef,
  comboName,
  onComboNameChange,
  ingredientList,
  saveOnFinalize,
  onSaveToggle,
  canSaveCombo,
}) {
  return (
    <section className="card-fade-in">
      <div className="mb-3">
        <h2 className="text-xl font-extrabold text-zinc-900">
          ¿Te quedaste manija?
        </h2>
        <p className="text-sm text-zinc-500">
          Sumá extras de la categoría Extras (hielo, snacks y más). Todo opcional.
        </p>
      </div>

      <ComboSearchInput
        value={searchValue}
        onChange={onSearchChange}
        placeholder="¡No te olvides de nada!"
        className="mb-4"
      />

      <div ref={listTopRef} className="scroll-mt-24" tabIndex={-1} />

      <ComboSectionList>
        {filteredExtras.length === 0 ? (
          <ComboEmptyState
            compact
            className="border-t border-zinc-100/80"
            icon={searchValue ? Search : Package}
            title={
              searchValue
                ? "No encontramos productos"
                : "No hay productos en Extras"
            }
            description={
              searchValue
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
              onInc={() => onIncExtra(p)}
              onDec={() => onDecExtra(p)}
            />
          ))
        )}
      </ComboSectionList>

      {extrasPaginated.showPagination && (
        <ComboListPagination
          page={extrasPaginated.page}
          totalPages={extrasPaginated.totalPages}
          onPageChange={onPageChange}
        />
      )}

      <ComboSummaryCard
        comboName={comboName}
        onComboNameChange={onComboNameChange}
        ingredientList={ingredientList}
        saveOnFinalize={saveOnFinalize}
        onSaveToggle={onSaveToggle}
        canSaveCombo={canSaveCombo}
      />
    </section>
  );
}
