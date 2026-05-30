"use client";

import { Save, Sparkles } from "lucide-react";
import ComboSummaryItemRow from "@/components/combo/ComboSummaryItemRow";
import {
  COMBO_SAVE_OPTION_ACTIVE_CLASS,
  COMBO_SAVE_OPTION_IDLE_CLASS,
  COMBO_SUMMARY_CARD_CLASS,
  COMBO_SUMMARY_INPUT_CLASS,
} from "@/constants/homeTheme";
import { getSelectionMapEntries } from "@/features/combo/comboBuilder";
import { cn } from "@/lib/cn";

/**
 * Resumen final del wizard: nombre, ingredientes editables y guardar en Mis Combos.
 */
export default function ComboSummaryCard({
  comboName,
  onComboNameChange,
  bases = {},
  mixers = {},
  extras = {},
  onIncBase,
  onDecBase,
  onIncMixer,
  onDecMixer,
  onIncExtra,
  onDecExtra,
  saveOnFinalize,
  onSaveToggle,
  canSaveCombo,
  className,
}) {
  const ingredientEntries = [
    ...getSelectionMapEntries(bases).map((entry) => ({
      ...entry,
      onInc: onIncBase,
      onDec: onDecBase,
    })),
    ...getSelectionMapEntries(mixers).map((entry) => ({
      ...entry,
      onInc: onIncMixer,
      onDec: onDecMixer,
    })),
    ...getSelectionMapEntries(extras).map((entry) => ({
      ...entry,
      onInc: onIncExtra,
      onDec: onDecExtra,
    })),
  ];
  const hasIngredients = ingredientEntries.length > 0;

  return (
    <section
      className={cn(COMBO_SUMMARY_CARD_CLASS, className)}
      aria-labelledby="combo-summary-title"
    >
      <div className="mb-4 flex items-start gap-3">
        <span
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10"
          aria-hidden
        >
          <Sparkles size={18} strokeWidth={2.25} />
        </span>
        <div className="min-w-0 flex-1">
          <h3
            id="combo-summary-title"
            className="text-base font-bold tracking-tight text-foreground"
          >
            Tu Combo Personalizado
          </h3>
          <p className="mt-0.5 text-sm leading-snug text-zinc-500">
            Revisá tu pedido antes de crearlo
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="combo-name"
          className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
        >
          Nombre del combo
        </label>
        <input
          id="combo-name"
          type="text"
          value={comboName}
          onChange={(e) => onComboNameChange(e.target.value)}
          placeholder="Mi Combo Personalizado"
          maxLength={48}
          className={COMBO_SUMMARY_INPUT_CLASS}
          autoComplete="off"
        />
      </div>

      {hasIngredients ? (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Tu pedido
          </p>
          <ul className="flex flex-col gap-1.5" aria-label="Ingredientes del combo">
            {ingredientEntries.map(({ id, product, cantidad, onInc, onDec }) => (
              <ComboSummaryItemRow
                key={id}
                product={product}
                cantidad={cantidad}
                onInc={() => onInc(product)}
                onDec={() => onDec(product)}
              />
            ))}
          </ul>
        </div>
      ) : null}

      <label
        htmlFor="combo-save-toggle"
        className={cn(
          "mt-4 flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 motion-safe:transition-colors",
          saveOnFinalize ? COMBO_SAVE_OPTION_ACTIVE_CLASS : COMBO_SAVE_OPTION_IDLE_CLASS,
          !canSaveCombo && "cursor-not-allowed opacity-60",
        )}
      >
        <input
          id="combo-save-toggle"
          type="checkbox"
          checked={saveOnFinalize}
          disabled={!canSaveCombo}
          onChange={(e) => onSaveToggle(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-zinc-300 accent-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
            <Save size={14} strokeWidth={2.5} className="shrink-0 text-primary" aria-hidden />
            Guardar en Mis Combos
          </p>
          <p className="mt-1 text-xs leading-snug text-zinc-500">
            {canSaveCombo
              ? "Lo vas a encontrar en tu perfil, en la sección de Mis Combos."
              : "Elegí base y mix para poder guardarlo."}
          </p>
        </div>
      </label>
    </section>
  );
}
