"use client";

import ComboQuantityControls from "@/components/combo/ComboQuantityControls";
import { cn } from "@/lib/cn";

/**
 * Fila editable del resumen final: nombre del producto + controles de cantidad.
 */
export default function ComboSummaryItemRow({
  product,
  cantidad,
  onInc,
  onDec,
  compact = false,
  className,
}) {
  return (
    <li
      className={cn(
        "flex items-center justify-between gap-2",
        compact
          ? "text-sm leading-snug text-zinc-700"
          : "rounded-lg bg-zinc-50/90 px-2.5 py-1.5 text-sm leading-snug text-zinc-700 ring-1 ring-zinc-100/80",
        className,
      )}
    >
      {!compact ? (
        <span
          className="mt-1.5 h-1.5 w-1.5 shrink-0 self-start rounded-full bg-primary"
          aria-hidden
        />
      ) : null}
      <span className="min-w-0 flex-1 break-words">{product.nombre}</span>
      <ComboQuantityControls
        variant="summary"
        compact
        quantity={cantidad}
        onIncrement={onInc}
        onDecrement={onDec}
        addAriaLabel={`Agregar ${product.nombre}`}
        removeAriaLabel={`Quitar ${product.nombre}`}
        incrementAriaLabel={`Sumar ${product.nombre}`}
      />
    </li>
  );
}
