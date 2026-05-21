"use client";

import { PartyPopper } from "lucide-react";
import ImageWithFade from "@/components/ImageWithFade";
import ComboQuantityControls from "@/components/combo/ComboQuantityControls";
import { PLACEHOLDER_PRODUCT_CARD } from "@/constants/images";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
import { formatPrice } from "@/utils/format/price";
import { cn } from "@/lib/cn";

/**
 * Fila de extra/snack en el paso 3 (presentacional).
 */
export default function ComboExtraRow({
  product,
  cantidad,
  onInc,
  onDec,
  className,
}) {
  const imgSrc =
    getOptimizedImageUrl(product.imagen_url, { preset: "productCard" }) ||
    PLACEHOLDER_PRODUCT_CARD;
  const hasQuantity = cantidad > 0;

  return (
    <div
      className={cn(
        "flex items-center gap-3 border-b border-zinc-100/80 px-4 py-3 last:border-b-0",
        hasQuantity && "bg-primary/[0.02]",
        className,
      )}
    >
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-zinc-50 to-zinc-100 ring-1 ring-zinc-100/80">
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
          <div className="flex h-full w-full items-center justify-center text-zinc-400">
            <PartyPopper size={18} aria-hidden />
          </div>
        )}
        {hasQuantity ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {cantidad}
          </span>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {product.nombre}
        </p>
        <p className="product-price mt-0.5 text-sm text-primary">{formatPrice(product.precio)}</p>
      </div>

      <ComboQuantityControls
        quantity={cantidad}
        onIncrement={onInc}
        onDecrement={onDec}
        addAriaLabel={`Agregar ${product.nombre}`}
        removeAriaLabel={`Quitar ${product.nombre}`}
        incrementAriaLabel={`Sumar ${product.nombre}`}
      />
    </div>
  );
}
