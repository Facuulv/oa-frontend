"use client";

import { Beer, Check } from "lucide-react";
import ImageWithFade from "@/components/ImageWithFade";
import ComboQuantityControls from "@/components/combo/ComboQuantityControls";
import { PLACEHOLDER_PRODUCT_CARD } from "@/constants/images";
import {
  COMBO_PRODUCT_ROW_CLASS,
  COMBO_PRODUCT_ROW_IDLE_CLASS,
  COMBO_PRODUCT_ROW_SELECTED_CLASS,
} from "@/constants/homeTheme";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
import { formatPrice } from "@/utils/format/price";
import { cn } from "@/lib/cn";

/**
 * Fila/card seleccionable para Base y Mix con control de cantidad integrado.
 */
export default function ComboProductRow({
  product,
  quantity = 0,
  onSelect,
  onIncrement,
  onDecrement,
  fallbackIcon: FallbackIcon = Beer,
  disabled = false,
  className,
}) {
  const imgSrc =
    getOptimizedImageUrl(product.imagen_url, { preset: "productCard" }) ||
    PLACEHOLDER_PRODUCT_CARD;
  const isSelected = quantity > 0;

  const handleActivate = () => {
    if (disabled || isSelected) return;
    onSelect?.(product);
  };

  return (
    <div
      className={cn(
        COMBO_PRODUCT_ROW_CLASS,
        isSelected ? COMBO_PRODUCT_ROW_SELECTED_CLASS : COMBO_PRODUCT_ROW_IDLE_CLASS,
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <div
        role={!isSelected && !disabled ? "button" : undefined}
        tabIndex={!isSelected && !disabled ? 0 : undefined}
        aria-pressed={isSelected}
        onClick={handleActivate}
        onKeyDown={(e) => {
          if (!isSelected && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            handleActivate();
          }
        }}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-3 text-left",
          !isSelected && !disabled && "cursor-pointer",
        )}
      >
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-zinc-50 to-zinc-100 sm:h-16 sm:w-16">
          {product.imagen_url ? (
            <ImageWithFade
              src={imgSrc}
              alt={product.nombre}
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = PLACEHOLDER_PRODUCT_CARD;
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-300">
              <FallbackIcon size={24} strokeWidth={1.75} aria-hidden />
            </div>
          )}
          {isSelected ? (
            <span
              className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white shadow-sm ring-2 ring-white"
              aria-hidden
            >
              <Check size={12} strokeWidth={3} />
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-bold leading-snug text-foreground sm:line-clamp-1">
            {product.nombre}
          </p>
          {product.categoria_nombre ? (
            <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">
              {product.categoria_nombre}
            </p>
          ) : null}
        </div>
      </div>

      {isSelected ? (
        <ComboQuantityControls
          compact
          quantity={quantity}
          onIncrement={() => onIncrement?.(product)}
          onDecrement={() => onDecrement?.(product)}
          addAriaLabel={`Agregar ${product.nombre}`}
          removeAriaLabel={`Quitar ${product.nombre}`}
          incrementAriaLabel={`Sumar ${product.nombre}`}
        />
      ) : (
        <span className="product-price ml-1 shrink-0 text-sm text-primary sm:text-base">
          {formatPrice(product.precio)}
        </span>
      )}
    </div>
  );
}
