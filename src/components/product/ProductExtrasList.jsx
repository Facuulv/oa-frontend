"use client";

import { Check } from "lucide-react";
import {
  COMBO_PRODUCT_ROW_CLASS,
  COMBO_PRODUCT_ROW_IDLE_CLASS,
  COMBO_PRODUCT_ROW_SELECTED_CLASS,
  HOME_CARD_SURFACE_CLASS,
} from "@/constants/homeTheme";
import { formatPrice } from "@/utils/format/price";
import { cn } from "@/lib/cn";

/**
 * Lista de extras seleccionables (presentacional).
 */
export default function ProductExtrasList({ extras, selectedExtras, onToggle }) {
  if (!extras?.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold tracking-tight text-foreground">Extras</h3>
      <div className={cn(HOME_CARD_SURFACE_CLASS, "space-y-2 rounded-2xl border border-zinc-100/90 bg-white p-2")}>
        {extras.map((extra) => {
          const isSelected = selectedExtras.some((e) => e.id === extra.id);
          return (
            <button
              key={extra.id}
              type="button"
              onClick={() => onToggle(extra)}
              className={cn(
                COMBO_PRODUCT_ROW_CLASS,
                isSelected ? COMBO_PRODUCT_ROW_SELECTED_CLASS : COMBO_PRODUCT_ROW_IDLE_CLASS,
              )}
            >
              <span className="min-w-0 flex-1 text-left text-sm font-medium text-foreground">
                {extra.nombre}
              </span>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-sm text-zinc-500">+{formatPrice(extra.precio)}</span>
                {isSelected ? (
                  <Check size={16} className="text-primary" strokeWidth={2.5} aria-hidden />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
