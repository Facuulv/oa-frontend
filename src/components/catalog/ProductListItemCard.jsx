"use client";

import Link from "next/link";
import ImageWithFade from "@/components/ImageWithFade";
import { PLACEHOLDER_PRODUCT_CARD } from "@/constants/images";
import { buildImageUrl } from "@/lib/imageUtils";
import { formatPrice } from "@/utils/format/price";

export default function ProductListItemCard({ product }) {
  const imgSrc = buildImageUrl(product.imagen_url) || PLACEHOLDER_PRODUCT_CARD;

  return (
    <Link
      href={`/producto/${product.slug ?? product.id}`}
      className="flex items-center gap-4 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md active:shadow-md"
    >
      <ImageWithFade
        src={imgSrc}
        alt={product.nombre}
        className="h-20 w-20 shrink-0 rounded-lg object-cover"
        onError={(e) => { e.currentTarget.src = PLACEHOLDER_PRODUCT_CARD; }}
      />
      <div className="min-w-0 flex-1">
        {product.categoria_nombre ? (
          <span className="inline-flex bg-neutral-100 text-neutral-700 text-xs px-2 py-1 rounded-full">
            {product.categoria_nombre}
          </span>
        ) : null}
        <p className="mt-1 line-clamp-2 font-semibold text-neutral-900">
          {product.nombre}
        </p>
        {product.descripcion && (
          <p className="mt-1 line-clamp-2 text-xs text-neutral-600">
            {product.descripcion}
          </p>
        )}
        <p className="product-price mt-1 text-lg font-bold text-[#C1121F]">
          {formatPrice(product.precio)}
        </p>
      </div>
    </Link>
  );
}
