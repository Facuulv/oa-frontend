"use client";

import { Plus } from "lucide-react";
import {
  COMBO_ACTION_BAR_SURFACE_CLASS,
  PRODUCT_DETAIL_PURCHASE_PANEL_CLASS,
  PUBLIC_PRESSABLE_CLASS,
} from "@/constants/homeTheme";
import { cn } from "@/lib/cn";
import ProductQuantityStepper from "@/components/product/ProductQuantityStepper";

/**
 * Panel lateral desktop: total, cantidad y CTA (presentacional).
 */
export default function ProductPurchasePanel({
  cantidad,
  onDecrement,
  onIncrement,
  unitPriceFormatted,
  totalFormatted,
  onAdd,
  disabled = false,
  className,
}) {
  return (
    <aside
      className={cn(PRODUCT_DETAIL_PURCHASE_PANEL_CLASS, className)}
      aria-label="Agregar al pedido"
    >
      <div className={cn(COMBO_ACTION_BAR_SURFACE_CLASS, "p-4 sm:p-5")}>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          Total
        </p>
        <p className="product-price mt-1 text-2xl leading-none text-primary sm:text-[1.75rem]">
          {totalFormatted}
        </p>
        {cantidad > 1 ? (
          <p className="mt-1 text-sm text-zinc-500">
            {unitPriceFormatted} c/u
          </p>
        ) : null}

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-zinc-100/90 pt-4">
          <span className="text-sm font-semibold text-foreground">Cantidad</span>
          <ProductQuantityStepper
            quantity={cantidad}
            onDecrement={onDecrement}
            onIncrement={onIncrement}
            decrementDisabled={cantidad <= 1}
          />
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={disabled}
          aria-disabled={disabled || undefined}
          className={cn(
            PUBLIC_PRESSABLE_CLASS,
            "home-cta-primary-shadow mt-4 flex w-full min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold text-white",
            "bg-gradient-to-br from-primary via-primary to-primary-dark",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:border disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:shadow-none",
          )}
        >
          <Plus size={18} strokeWidth={2.5} aria-hidden />
          Agregar al pedido
        </button>
      </div>
    </aside>
  );
}
