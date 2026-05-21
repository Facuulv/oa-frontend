"use client";

import { Sparkles } from "lucide-react";
import { formatPrice } from "@/utils/format/price";
import { cn } from "@/lib/cn";
import {
  COMBO_ACTION_BAR_SURFACE_CLASS,
  PUBLIC_PRESSABLE_CLASS,
} from "@/constants/homeTheme";

/**
 * Barra de acción presentacional para /arma-tu-combo.
 * No contiene lógica del wizard; solo renderiza estado y CTA.
 */
export default function ComboActionBar({
  currentStep,
  total,
  summaryLabel,
  nextDisabled,
  primaryActionLabel,
  onPrimaryAction,
  className,
}) {
  const showSparkles = currentStep === 3;

  return (
    <div className={cn(COMBO_ACTION_BAR_SURFACE_CLASS, className)}>
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:gap-4 sm:px-5 sm:py-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            {summaryLabel}
          </p>
          <p className="product-price mt-1 truncate text-2xl leading-none text-primary sm:text-[1.65rem]">
            {formatPrice(total)}
          </p>
        </div>

        <button
          type="button"
          onClick={onPrimaryAction}
          disabled={nextDisabled}
          aria-disabled={nextDisabled || undefined}
          aria-label={primaryActionLabel}
          className={cn(
            PUBLIC_PRESSABLE_CLASS,
            "home-cta-primary-shadow inline-flex min-h-12 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-bold text-white",
            "bg-gradient-to-br from-primary via-primary to-primary-dark",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            "sm:min-h-[3rem] sm:px-6 sm:text-base",
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
  );
}
