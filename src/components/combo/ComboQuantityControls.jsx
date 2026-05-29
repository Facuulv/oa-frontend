"use client";

import { Minus, Plus } from "lucide-react";
import {
  COMBO_ADD_BUTTON_CLASS,
  COMBO_QUANTITY_CONTROL_CLASS,
  PUBLIC_PRESSABLE_CLASS,
} from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

/**
 * Controles + / cantidad para filas de producto y extras (presentacional).
 */
export default function ComboQuantityControls({
  quantity,
  onIncrement,
  onDecrement,
  addAriaLabel,
  removeAriaLabel,
  incrementAriaLabel,
  compact = false,
  variant = "default",
}) {
  const isSummary = variant === "summary";
  const btnSize = isSummary ? "h-6 w-6" : compact ? "h-7 w-7" : "h-8 w-8";
  const iconSize = isSummary ? 12 : compact ? 12 : 14;
  const addBtnSize = compact ? "h-8 w-8" : "h-9 w-9";
  const summaryBtnClass = cn(
    PUBLIC_PRESSABLE_CLASS,
    "flex items-center justify-center rounded-full text-zinc-600 hover:bg-gray-100",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1",
  );
  const summaryPlusBtnClass = cn(summaryBtnClass, "text-primary hover:text-primary");

  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={onIncrement}
        aria-label={addAriaLabel}
        className={cn(COMBO_ADD_BUTTON_CLASS, addBtnSize)}
      >
        <Plus size={compact ? 14 : 16} strokeWidth={2.5} aria-hidden />
      </button>
    );
  }

  return (
    <div
      className={cn(
        isSummary
          ? "flex shrink-0 items-center gap-0.5"
          : cn(COMBO_QUANTITY_CONTROL_CLASS, compact && "gap-0 p-0.5"),
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onDecrement}
        aria-label={removeAriaLabel}
        className={cn(
          isSummary
            ? summaryBtnClass
            : cn(
                PUBLIC_PRESSABLE_CLASS,
                "flex items-center justify-center rounded-full text-zinc-700",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
              ),
          btnSize,
        )}
      >
        <Minus size={iconSize} strokeWidth={2.5} aria-hidden />
      </button>
      <span
        className={cn(
          "min-w-[1.25rem] px-0.5 text-center tabular-nums text-foreground",
          isSummary ? "text-xs font-semibold" : "font-bold",
          !isSummary && (compact ? "text-xs" : "text-sm"),
        )}
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
          isSummary
            ? summaryPlusBtnClass
            : cn(
                PUBLIC_PRESSABLE_CLASS,
                "flex items-center justify-center rounded-full bg-primary text-white",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
              ),
          btnSize,
        )}
      >
        <Plus size={iconSize} strokeWidth={2.5} aria-hidden />
      </button>
    </div>
  );
}
