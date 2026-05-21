"use client";

import { AlertCircle, RotateCcw } from "lucide-react";
import { COMBO_STATUS_CARD_CLASS, PUBLIC_PRESSABLE_CLASS } from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

/**
 * Estado vacío premium para listas del wizard (presentacional).
 */
export function ComboEmptyState({
  icon: Icon,
  title,
  description,
  className,
  compact = false,
}) {
  return (
    <div
      className={cn(
        compact ? "px-4 py-6 text-center" : COMBO_STATUS_CARD_CLASS,
        className,
      )}
    >
      {Icon ? (
        <span
          className={cn(
            "mx-auto flex items-center justify-center rounded-xl bg-primary/10 text-primary",
            compact ? "mb-2 h-9 w-9" : "mb-3 h-11 w-11",
          )}
          aria-hidden
        >
          <Icon size={compact ? 18 : 22} strokeWidth={2.25} />
        </span>
      ) : null}
      <h2
        className={cn(
          "font-bold tracking-tight text-foreground",
          compact ? "text-sm" : "text-base md:text-lg",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "text-zinc-500",
            compact
              ? "mx-auto mt-1 max-w-sm text-xs leading-snug"
              : "mx-auto mt-2 max-w-sm text-sm leading-snug",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Estado de error al cargar catálogo (presentacional).
 */
export function ComboErrorState({ message, onRetry, className }) {
  return (
    <div className={cn(COMBO_STATUS_CARD_CLASS, className)} role="alert">
      <AlertCircle size={40} className="mx-auto mb-3 text-red-400" aria-hidden />
      <h2 className="text-base font-bold text-foreground">No pudimos cargar los productos</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-snug text-zinc-600">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            PUBLIC_PRESSABLE_CLASS,
            "mx-auto mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white",
            "motion-safe:transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          )}
        >
          <RotateCcw size={14} aria-hidden />
          Reintentar
        </button>
      ) : null}
    </div>
  );
}
