"use client";

import { Minus, Plus } from "lucide-react";
import { COMBO_QUANTITY_CONTROL_CLASS, PUBLIC_PRESSABLE_CLASS } from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

/**
 * Stepper de cantidad para detalle de producto (mínimo 1).
 */
export default function ProductQuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  decrementDisabled = false,
  className,
}) {
  return (
    <div className={cn(COMBO_QUANTITY_CONTROL_CLASS, className)}>
      <button
        type="button"
        onClick={onDecrement}
        disabled={decrementDisabled}
        aria-label="Quitar una unidad"
        className={cn(
          PUBLIC_PRESSABLE_CLASS,
          "flex h-8 w-8 items-center justify-center rounded-full text-zinc-700",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-40",
        )}
      >
        <Minus size={14} strokeWidth={2.5} aria-hidden />
      </button>
      <span
        className="min-w-[1.35rem] px-0.5 text-center text-sm font-bold tabular-nums text-foreground"
        aria-live="polite"
        aria-atomic="true"
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label="Agregar una unidad"
        className={cn(
          PUBLIC_PRESSABLE_CLASS,
          "flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
        )}
      >
        <Plus size={14} strokeWidth={2.5} aria-hidden />
      </button>
    </div>
  );
}
