"use client";

import { cn } from "@/lib/cn";
import { PUBLIC_PRESSABLE_CLASS } from "@/constants/homeTheme";

/**
 * CTA de navegación manual debajo de la grilla de productos en cada paso.
 */
export default function ComboStepNextButton({
  label,
  disabled,
  onClick,
  className,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      className={cn(
        PUBLIC_PRESSABLE_CLASS,
        "home-cta-primary-shadow mt-4 w-full min-h-12 rounded-xl px-4 py-3.5 text-sm font-bold text-white",
        "bg-gradient-to-br from-primary via-primary to-primary-dark",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:border disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:shadow-none",
        className,
      )}
    >
      {label}
    </button>
  );
}
