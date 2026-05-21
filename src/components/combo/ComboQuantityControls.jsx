"use client";

import { Minus, Plus } from "lucide-react";
import {
  COMBO_ADD_BUTTON_CLASS,
  COMBO_QUANTITY_CONTROL_CLASS,
  PUBLIC_PRESSABLE_CLASS,
} from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

/**
 * Controles + / cantidad para filas de extras e hielo (presentacional).
 */
export default function ComboQuantityControls({
  quantity,
  onIncrement,
  onDecrement,
  addAriaLabel,
  removeAriaLabel,
  incrementAriaLabel,
}) {
  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={onIncrement}
        aria-label={addAriaLabel}
        className={COMBO_ADD_BUTTON_CLASS}
      >
        <Plus size={16} strokeWidth={2.5} aria-hidden />
      </button>
    );
  }

  return (
    <div className={COMBO_QUANTITY_CONTROL_CLASS}>
      <button
        type="button"
        onClick={onDecrement}
        aria-label={removeAriaLabel}
        className={cn(
          PUBLIC_PRESSABLE_CLASS,
          "flex h-8 w-8 items-center justify-center rounded-full text-zinc-700",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
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
        aria-label={incrementAriaLabel ?? addAriaLabel}
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
