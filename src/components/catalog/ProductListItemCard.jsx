"use client";

import Link from "next/link";
import ImageWithFade from "@/components/ImageWithFade";
import { PLACEHOLDER_PRODUCT_CARD } from "@/constants/images";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
import { formatPrice } from "@/utils/format/price";

export default function ProductListItemCard({ product }) {
  const imgSrc =
    getOptimizedImageUrl(product.imagen_url, { preset: "productCard" }) || PLACEHOLDER_PRODUCT_CARD;

  return (
    <Link
      href={`/producto/${product.slug ?? product.id}`}
      className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md"
    >
      <ImageWithFade
        src={imgSrc}
        alt={product.nombre}
        className="h-20 w-20 shrink-0 rounded-xl object-cover object-center"
        onError={(e) => { e.currentTarget.src = PLACEHOLDER_PRODUCT_CARD; }}
      />
      <div className="min-w-0 flex-1">
        <p className="product-name">{product.nombre}</p>
        {product.descripcion && (
          <p className="mt-1 line-clamp-2 text-xs text-gray-500">
            {product.descripcion}
          </p>
        )}
        <p className="product-price mt-1 text-sm text-primary">
          {formatPrice(product.precio)}
        </p>
      </div>
    </Link>
  );
}
