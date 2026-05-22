"use client";

import { Plus } from "lucide-react";
import {
  COMBO_ACTION_BAR_SURFACE_CLASS,
  PUBLIC_PRESSABLE_CLASS,
} from "@/constants/homeTheme";
import { cn } from "@/lib/cn";
import ProductQuantityStepper from "@/components/product/ProductQuantityStepper";

/**
 * Barra fija mobile: cantidad + CTA agregar (presentacional).
 */
export default function ProductDetailActionBar({
  cantidad,
  onDecrement,
  onIncrement,
  totalFormatted,
  onAdd,
  disabled = false,
  className,
}) {
  return (
    <div className={cn(COMBO_ACTION_BAR_SURFACE_CLASS, className)}>
      <div className="flex items-center gap-3 px-3.5 py-3.5 sm:gap-4 sm:px-4 sm:py-4">
        <ProductQuantityStepper
          quantity={cantidad}
          onDecrement={onDecrement}
          onIncrement={onIncrement}
          decrementDisabled={cantidad <= 1}
        />

        <button
          type="button"
          onClick={onAdd}
          disabled={disabled}
          aria-disabled={disabled || undefined}
          className={cn(
            PUBLIC_PRESSABLE_CLASS,
            "home-cta-primary-shadow flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold text-white",
            "bg-gradient-to-br from-primary via-primary to-primary-dark",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:border disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:shadow-none",
          )}
        >
          <Plus size={16} strokeWidth={2.5} aria-hidden />
          <span className="truncate">Agregar {totalFormatted}</span>
        </button>
      </div>
    </div>
  );
}
