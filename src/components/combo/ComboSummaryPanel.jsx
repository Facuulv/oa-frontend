"use client";

import { Sparkles } from "lucide-react";
import { formatPrice } from "@/utils/format/price";
import { cn } from "@/lib/cn";
import {
  COMBO_ACTION_BAR_SURFACE_CLASS,
  COMBO_SUMMARY_PANEL_CLASS,
  PUBLIC_PRESSABLE_CLASS,
} from "@/constants/homeTheme";

const PANEL_SUBTITLES = {
  1: "Elegí una base para empezar",
  2: "Sumá el mix ideal",
  3: "Revisá y creá tu combo",
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
  selectedBase,
  selectedMixer,
  ingredientList,
  className,
}) {
  const showSparkles = currentStep === 3;
  const panelSubtitle = PANEL_SUBTITLES[currentStep] ?? "";
  const extraLines =
    ingredientList.length > 2
      ? ingredientList.slice(2)
      : ingredientList.length > 0 && selectedBase && selectedMixer
        ? []
        : ingredientList;

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
          <SummaryLine
            label="Base"
            value={selectedBase?.nombre ?? "Sin elegir"}
            pending={!selectedBase}
          />
          <SummaryLine
            label="Mix"
            value={selectedMixer?.nombre ?? "Sin elegir"}
            pending={!selectedMixer}
          />
          {extraLines.length > 0 ? (
            <div className="pt-1">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Extras
              </p>
              <ul className="space-y-1">
                {extraLines.map((line, idx) => (
                  <li
                    key={`${line}-${idx}`}
                    className="text-sm leading-snug text-zinc-700 break-words"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
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
