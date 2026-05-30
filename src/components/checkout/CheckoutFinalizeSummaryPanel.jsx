"use client";

import { formatPrice } from "@/utils/format/price";
import { getItemSubtotal } from "@/store/useCartStore";
import { cn } from "@/lib/cn";
import {
  COMBO_ACTION_BAR_SURFACE_CLASS,
  PUBLIC_PRESSABLE_CLASS,
} from "@/constants/homeTheme";

function formatItemCountSubtitle(lineCount, unitCount) {
  const lines = lineCount === 1 ? "1 producto" : `${lineCount} productos`;
  if (unitCount === lineCount) return lines;
  const units = unitCount === 1 ? "1 unidad" : `${unitCount} unidades`;
  return `${lines} · ${units}`;
}

/**
 * Resumen del pedido + CTA confirmar (panel desktop sticky o card mobile).
 */
export default function CheckoutFinalizeSummaryPanel({
  items,
  total,
  isSubmitting = false,
  isFormReady = false,
  checkoutBlocked = false,
  checkoutBlockedReason = null,
  nextOpeningText = null,
  storeStatusLoading = false,
  configLoading = false,
  isDelivery = false,
  onConfirm,
  className,
}) {
  const lineCount = items.length;
  const unitCount = items.reduce((acc, item) => acc + (item.cantidad ?? 1), 0);
  const subtitle = formatItemCountSubtitle(lineCount, unitCount);

  const ctaDisabled =
    isSubmitting || lineCount === 0 || !isFormReady || checkoutBlocked;

  const ctaLabel = isSubmitting
    ? "Procesando..."
    : storeStatusLoading || configLoading
      ? "Verificando horario..."
      : "Confirmar pedido";

  return (
    <aside className={cn("min-w-0", className)} aria-label="Resumen del pedido">
      <div className={COMBO_ACTION_BAR_SURFACE_CLASS}>
        <div className="border-b border-zinc-100/90 px-4 pb-4 pt-4 sm:px-5 sm:pt-5">
          <h2 className="text-base font-bold tracking-tight text-foreground">Resumen</h2>
          <p className="mt-1 text-sm leading-snug text-zinc-500">{subtitle}</p>
        </div>

        <div className="px-4 py-4 sm:px-5 sm:py-5">
          {lineCount > 0 ? (
            <ul
              className="mb-4 max-h-48 space-y-2.5 overflow-y-auto overscroll-contain"
              aria-label="Productos del pedido"
            >
              {items.map((item) => {
                const cantidad = item.cantidad ?? 1;
                return (
                  <li
                    key={item.id}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 font-medium text-zinc-800">
                        {item.nombre}
                      </span>
                      {cantidad > 1 ? (
                        <span className="mt-0.5 block text-xs text-zinc-500">
                          × {cantidad}
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 tabular-nums font-semibold text-zinc-700">
                      {formatPrice(getItemSubtotal(item))}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : null}

          <div className="border-t border-zinc-100/90 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Total del pedido
            </p>
            <p className="product-price mt-1 text-2xl leading-none text-primary sm:text-[1.75rem]">
              {formatPrice(total)}
            </p>
          </div>

          <ConfirmCtaButton
            onConfirm={onConfirm}
            disabled={ctaDisabled}
            label={ctaLabel}
            className="mt-4"
          />

          {checkoutBlocked && !storeStatusLoading && !configLoading && checkoutBlockedReason ? (
            <p className="mt-3 text-center text-xs font-medium text-amber-800">
              {checkoutBlockedReason}
              {nextOpeningText ? ` ${nextOpeningText}` : ""}
            </p>
          ) : null}

          {!isFormReady && !checkoutBlocked ? (
            <p className="mt-3 text-center text-xs font-medium text-zinc-500">
              Completá nombre, teléfono{isDelivery ? " y dirección" : ""} para continuar.
            </p>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

function ConfirmCtaButton({ onConfirm, disabled, label, className }) {
  return (
    <button
      type="button"
      onClick={onConfirm}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      className={cn(
        PUBLIC_PRESSABLE_CLASS,
        "home-cta-primary-shadow inline-flex min-h-12 w-full items-center justify-center whitespace-nowrap rounded-xl px-4 py-3 text-sm font-bold text-white",
        "bg-gradient-to-br from-primary via-primary to-primary-dark",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "sm:min-h-[3rem] sm:px-6 sm:text-base",
        "disabled:cursor-not-allowed disabled:border disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:shadow-none",
        className,
      )}
    >
      {label}
    </button>
  );
}
