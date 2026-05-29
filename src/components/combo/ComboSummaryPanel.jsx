"use client";

import { Sparkles } from "lucide-react";
import ComboSummaryItemRow from "@/components/combo/ComboSummaryItemRow";
import { formatPrice } from "@/utils/format/price";
import { cn } from "@/lib/cn";
import {
  formatSelectionMapSummary,
  getSelectionMapEntries,
} from "@/features/combo/comboBuilder";
import {
  COMBO_ACTION_BAR_SURFACE_CLASS,
  COMBO_SUMMARY_PANEL_CLASS,
  PUBLIC_PRESSABLE_CLASS,
} from "@/constants/homeTheme";

const PANEL_SUBTITLES = {
  1: "Elegí una o más bases",
  2: "Sumá el mix ideal",
  3: "Revisá y agregá al carrito",
};

function SummaryLine({ label, value, pending }) {
  return (
    <div className="flex items-start justify-between gap-2 text-sm">
      <span className="shrink-0 text-zinc-500">{label}</span>
      <span
        className={cn(
          "min-w-0 text-right font-medium leading-snug",
          pending ? "text-zinc-400" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function EditableSummarySection({ label, entries, onInc, onDec, emptyLabel }) {
  if (entries.length === 0) {
    return <SummaryLine label={label} value={emptyLabel} pending />;
  }

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <ul className="space-y-1.5" aria-label={label}>
        {entries.map(({ id, product, cantidad }) => (
          <ComboSummaryItemRow
            key={id}
            product={product}
            cantidad={cantidad}
            onInc={() => onInc(product)}
            onDec={() => onDec(product)}
            compact
          />
        ))}
      </ul>
    </div>
  );
}

/**
 * Panel lateral desktop: resumen del combo + total + CTA (presentacional).
 */
export default function ComboSummaryPanel({
  currentStep,
  total,
  summaryLabel,
  primaryActionLabel,
  nextDisabled,
  onPrimaryAction,
  bases = {},
  mixers = {},
  extras = {},
  onIncBase,
  onDecBase,
  onIncMixer,
  onDecMixer,
  onIncExtra,
  onDecExtra,
  className,
}) {
  const showSparkles = currentStep === 3;
  const isEditableSummary = currentStep === 3;
  const panelSubtitle = PANEL_SUBTITLES[currentStep] ?? "";
  const baseSummary = formatSelectionMapSummary(bases);
  const mixerSummary = formatSelectionMapSummary(mixers);
  const baseEntries = getSelectionMapEntries(bases);
  const mixerEntries = getSelectionMapEntries(mixers);
  const extraEntries = getSelectionMapEntries(extras);

  return (
    <aside
      className={cn(COMBO_SUMMARY_PANEL_CLASS, className)}
      aria-label="Resumen del combo"
    >
      <div className={cn(COMBO_ACTION_BAR_SURFACE_CLASS, "p-4 sm:p-5")}>
        <div className="mb-4 border-b border-zinc-100/90 pb-4">
          <h2 className="text-base font-bold tracking-tight text-foreground">Tu combo</h2>
          {panelSubtitle ? (
            <p className="mt-1 text-sm leading-snug text-zinc-500">{panelSubtitle}</p>
          ) : null}
        </div>

        <div className="space-y-2.5" aria-label="Selección actual">
          {isEditableSummary ? (
            <>
              <EditableSummarySection
                label="Base"
                entries={baseEntries}
                onInc={onIncBase}
                onDec={onDecBase}
                emptyLabel="Sin elegir"
              />
              <EditableSummarySection
                label="Mix"
                entries={mixerEntries}
                onInc={onIncMixer}
                onDec={onDecMixer}
                emptyLabel="Sin elegir"
              />
              {extraEntries.length > 0 ? (
                <EditableSummarySection
                  label="Extras"
                  entries={extraEntries}
                  onInc={onIncExtra}
                  onDec={onDecExtra}
                  emptyLabel="Sin extras"
                />
              ) : null}
            </>
          ) : (
            <>
              <SummaryLine
                label="Base"
                value={baseSummary ?? "Sin elegir"}
                pending={!baseSummary}
              />
              <SummaryLine
                label="Mix"
                value={mixerSummary ?? "Sin elegir"}
                pending={!mixerSummary}
              />
              {extraEntries.length > 0 ? (
                <div className="pt-1">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Extras
                  </p>
                  <ul className="space-y-1">
                    {extraEntries.map(({ id, product, cantidad }) => (
                      <li
                        key={id}
                        className="break-words text-sm leading-snug text-zinc-700"
                      >
                        {cantidad}× {product.nombre}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          )}
        </div>

        <div className="mt-5 border-t border-zinc-100/90 pt-4">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            {summaryLabel}
          </p>
          <p className="product-price mt-1 text-2xl leading-none text-primary sm:text-[1.75rem]">
            {formatPrice(total)}
          </p>

          <button
            type="button"
            onClick={onPrimaryAction}
            disabled={nextDisabled}
            aria-disabled={nextDisabled || undefined}
            className={cn(
              PUBLIC_PRESSABLE_CLASS,
              "home-cta-primary-shadow mt-4 flex w-full min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold text-white",
              "bg-gradient-to-br from-primary via-primary to-primary-dark",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:border disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:shadow-none",
            )}
          >
            {showSparkles ? (
              <Sparkles size={18} strokeWidth={2.5} aria-hidden />
            ) : null}
            {primaryActionLabel}
          </button>
        </div>
      </div>
    </aside>
  );
}
