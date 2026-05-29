"use client";

import CheckoutDiscountCodeTeaser from "@/components/checkout/CheckoutDiscountCodeTeaser";
import { formatPrice } from "@/utils/format/price";
import { cn } from "@/lib/cn";
import {
  CHECKOUT_MOBILE_BAR_CLASS,
  COMBO_ACTION_BAR_SURFACE_CLASS,
  PUBLIC_PRESSABLE_CLASS,
} from "@/constants/homeTheme";

function formatItemCountSubtitle(lineCount, unitCount) {
  const lines =
    lineCount === 1 ? "1 producto" : `${lineCount} productos`;
  if (unitCount === lineCount) return lines;
  const units =
    unitCount === 1 ? "1 unidad" : `${unitCount} unidades`;
  return `${lines} · ${units}`;
}

/**
 * Resumen del carrito + CTA (mobile bar fija o panel desktop sticky).
 */
export default function CheckoutSummaryCard({
  total,
  itemLineCount,
  unitCount,
  onCheckout,
  isSubmitting = false,
  checkoutDisabled = false,
  closedHint = null,
  variant = "desktop-panel",
  className,
}) {
  const ctaDisabled = isSubmitting || checkoutDisabled;
  const subtitle = formatItemCountSubtitle(itemLineCount, unitCount);

  const surface = (
    <div className={cn(COMBO_ACTION_BAR_SURFACE_CLASS, className)}>
      {variant === "desktop-panel" ? (
        <div className="border-b border-zinc-100/90 px-4 pb-4 pt-4 sm:px-5 sm:pt-5">
          <h2 className="text-base font-bold tracking-tight text-foreground">Resumen</h2>
          <p className="mt-1 text-sm leading-snug text-zinc-500">{subtitle}</p>
        </div>
      ) : null}

      {variant === "mobile-bar" ? (
        <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:gap-4 sm:px-5 sm:py-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Total
            </p>
            <p className="product-price mt-1 truncate text-2xl leading-none text-primary sm:text-[1.65rem]">
              {formatPrice(total)}
            </p>
            <p className="mt-0.5 truncate text-xs text-zinc-500">{subtitle}</p>
          </div>
          <CheckoutCtaButton
            onCheckout={onCheckout}
            isSubmitting={ctaDisabled}
            disabled={ctaDisabled}
          />
        </div>
      ) : (
        <div className="px-4 pb-4 pt-0 sm:px-5 sm:pb-5">
          <CheckoutDiscountCodeTeaser className="mb-4" />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Total del pedido
          </p>
          <p className="product-price mt-1 text-2xl leading-none text-primary sm:text-[1.75rem]">
            {formatPrice(total)}
          </p>
          <CheckoutCtaButton
            onCheckout={onCheckout}
            isSubmitting={ctaDisabled}
            disabled={ctaDisabled}
            fullWidth
            className="mt-4"
          />
          {closedHint ? (
            <p className="mt-3 text-center text-xs font-medium text-amber-800">{closedHint}</p>
          ) : null}
        </div>
      )}
    </div>
  );

  if (variant === "mobile-bar") {
    return (
      <div className={CHECKOUT_MOBILE_BAR_CLASS} aria-label="Resumen y finalizar pedido">
        {surface}
      </div>
    );
  }

  return (
    <aside className="min-w-0" aria-label="Resumen del pedido">
      {surface}
    </aside>
  );
}

function CheckoutCtaButton({ onCheckout, isSubmitting, disabled, fullWidth, className }) {
  const isDisabled = disabled ?? isSubmitting;
  return (
    <button
      type="button"
      onClick={onCheckout}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      className={cn(
        PUBLIC_PRESSABLE_CLASS,
        "home-cta-primary-shadow inline-flex min-h-12 shrink-0 items-center justify-center whitespace-nowrap rounded-xl px-4 py-3 text-sm font-bold text-white",
        "bg-gradient-to-br from-primary via-primary to-primary-dark",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "sm:min-h-[3rem] sm:px-6 sm:text-base",
        "disabled:cursor-not-allowed disabled:border disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:shadow-none",
        fullWidth && "w-full",
        className,
      )}
    >
      {isSubmitting ? "Procesando..." : "Finalizar pedido"}
    </button>
  );
}
