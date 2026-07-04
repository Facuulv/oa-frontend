"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Stepper de cantidad para el panel admin (mínimo 1).
 */
export default function AdminQuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  decrementDisabled = false,
  disabled = false,
  className,
  size = "default",
}) {
  const compact = size === "compact";
  const btnClass = compact
    ? "h-9 w-9"
    : "h-11 w-11";
  const iconSize = compact ? 16 : 18;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-0.5",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onDecrement}
        disabled={decrementDisabled || disabled}
        aria-label="Quitar una unidad"
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-lg text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40",
          btnClass,
        )}
      >
        <Minus size={iconSize} strokeWidth={2.25} aria-hidden />
      </button>
      <span
        className={cn(
          "min-w-[1.75rem] px-1 text-center font-semibold tabular-nums text-zinc-900",
          compact ? "text-sm" : "text-base",
        )}
        aria-live="polite"
        aria-atomic="true"
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        disabled={disabled}
        aria-label="Agregar una unidad"
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-lg bg-primary text-white transition-colors hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
          btnClass,
        )}
      >
        <Plus size={iconSize} strokeWidth={2.25} aria-hidden />
      </button>
    </div>
  );
}
