"use client";

import { Snowflake } from "lucide-react";
import ComboQuantityControls from "@/components/combo/ComboQuantityControls";
import { formatPrice } from "@/utils/format/price";
import { cn } from "@/lib/cn";

/**
 * Fila de bolsa de hielo en el paso 3 (presentacional).
 */
export default function ComboIceRow({
  quantity,
  unitPrice,
  onInc,
  onDec,
  label = "Bolsa de Hielo",
  className,
}) {
  const hasQuantity = quantity > 0;

  return (
    <div
      className={cn(
        "flex items-center gap-3 border-b border-zinc-100/80 px-4 py-3",
        hasQuantity && "bg-sky-50/40",
        className,
      )}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
        <Snowflake size={20} strokeWidth={2} aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="product-price mt-0.5 text-sm text-primary">{formatPrice(unitPrice)}</p>
      </div>

      <ComboQuantityControls
        quantity={quantity}
        onIncrement={onInc}
        onDecrement={onDec}
        addAriaLabel="Agregar bolsa de hielo"
        removeAriaLabel="Quitar bolsa de hielo"
        incrementAriaLabel="Agregar bolsa de hielo"
      />
    </div>
  );
}
