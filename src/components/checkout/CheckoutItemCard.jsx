"use client";

import { memo } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import ImageWithFade from "@/components/ImageWithFade";
import { PLACEHOLDER_PRODUCT_CARD } from "@/constants/images";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
import { formatPrice } from "@/utils/format/price";
import { getItemUnitPrice } from "@/store/useCartStore";

function CheckoutItemCard({ item, onUpdateQuantity, onRemove }) {
  const imgSrc =
    getOptimizedImageUrl(item.imagen_url, { preset: "checkoutLine" }) || PLACEHOLDER_PRODUCT_CARD;
  const unitPrice = getItemUnitPrice(item);
  const cantidad = item.cantidad ?? 1;

  return (
    <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
      <ImageWithFade
        src={imgSrc}
        alt={item.nombre}
        className="h-16 w-16 shrink-0 rounded-xl object-cover object-center"
        onError={(e) => { e.currentTarget.src = PLACEHOLDER_PRODUCT_CARD; }}
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.nombre}</p>
        {item.extrasSeleccionados?.length > 0 && (
          <p className="text-xs text-gray-500 line-clamp-1">
            {item.extrasSeleccionados.map((e) => e.nombre).join(", ")}
          </p>
        )}
        <p className="mt-1 text-sm font-bold text-primary">{formatPrice(unitPrice * cantidad)}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => onUpdateQuantity(item.id, cantidad - 1)}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-500 transition hover:bg-gray-100"
          aria-label="Reducir cantidad"
        >
          <Minus size={14} />
        </button>
        <span className="w-5 text-center text-sm font-bold">{cantidad}</span>
        <button
          type="button"
          onClick={() => onUpdateQuantity(item.id, cantidad + 1)}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-500 transition hover:bg-gray-100"
          aria-label="Aumentar cantidad"
        >
          <Plus size={14} />
        </button>
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="ml-1 flex h-7 w-7 items-center justify-center rounded-full text-red-400 transition hover:bg-red-50 hover:text-red-600"
          aria-label="Eliminar producto"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default memo(CheckoutItemCard);
