"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import ImageWithFade from "@/components/ImageWithFade";
import { PLACEHOLDER_PRODUCT_CARD } from "@/constants/images";
import { OA_BRAND_PRIMARY_HEX } from "@/constants/layout";
import { isExtrasCategoryProduct } from "@/features/combo/comboExtrasCategory";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
import { mapProduct } from "@/lib/mappers/catalogMapper";
import { getProductsByCategory } from "@/services/catalogService";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/utils/format/price";

const EXTRAS_LIMIT = 5;
const SKELETON_COUNT = 5;

function UltimoAntojoCardSkeleton() {
  return (
    <div
      className="relative flex w-24 shrink-0 flex-col items-center rounded-2xl border border-zinc-200 bg-white p-2.5 shadow-sm"
      aria-hidden
    >
      <div className="mb-1.5 h-14 w-14 animate-pulse rounded-full bg-zinc-200" />
      <div className="h-2.5 w-16 animate-pulse rounded bg-zinc-200" />
      <div className="mt-1.5 h-3.5 w-10 animate-pulse rounded bg-zinc-200" />
    </div>
  );
}

function UltimoAntojoCard({ product, onAdd }) {
  const imgSrc =
    getOptimizedImageUrl(product.imagen_url, { preset: "productCard" }) ||
    PLACEHOLDER_PRODUCT_CARD;

  return (
    <div className="relative flex w-24 shrink-0 flex-col items-center rounded-2xl border border-zinc-200 bg-white p-2.5 shadow-sm">
      <div className="mb-1.5 h-14 w-14 overflow-hidden rounded-full bg-zinc-100 ring-1 ring-zinc-100/80">
        <ImageWithFade
          src={imgSrc}
          alt={product.nombre}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER_PRODUCT_CARD;
          }}
        />
      </div>
      <p
        className="line-clamp-1 w-full text-center text-[11px] font-medium text-zinc-700"
        title={product.nombre}
      >
        {product.nombre}
      </p>
      <p
        className="mt-0.5 text-sm font-bold tabular-nums"
        style={{ color: OA_BRAND_PRIMARY_HEX }}
      >
        {formatPrice(product.precio)}
      </p>
      <button
        type="button"
        onClick={() => onAdd(product)}
        aria-label={`Agregar ${product.nombre} al carrito`}
        className="absolute -right-1.5 -top-1.5 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-md transition active:scale-95"
        style={{ backgroundColor: OA_BRAND_PRIMARY_HEX }}
      >
        <Plus size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}

/**
 * Sugerencias compactas para el final del checkout.
 * Scroll horizontal: foto pequeña, precio y botón "+" circular rojo.
 */
export default function UltimoAntojoSection() {
  const addItem = useCartStore((s) => s.addItem);
  const [extras, setExtras] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadExtras() {
      setIsLoading(true);
      try {
        const raw = await getProductsByCategory();
        const list = (Array.isArray(raw) ? raw : [])
          .filter((item) => {
            if (!item) return false;
            const disponible =
              item.disponible === undefined ||
              item.disponible === true ||
              item.disponible === 1;
            if (!disponible) return false;
            return isExtrasCategoryProduct({
              categoria_nombre: item.categoria_nombre ?? item.category_name,
              categoria_slug: item.categoria_slug ?? item.category_slug,
            });
          })
          .map(mapProduct)
          .filter(Boolean)
          .slice(0, EXTRAS_LIMIT);

        if (!cancelled) setExtras(list);
      } catch {
        if (!cancelled) setExtras([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadExtras();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAdd = (product) => {
    addItem({
      articuloId: product.id ?? product.slug,
      slug: product.slug,
      nombre: product.nombre,
      precioBase: product.precio,
      cantidad: 1,
      imagen_url: product.imagen_url ?? null,
      categoria_nombre: product.categoria_nombre ?? null,
    });
  };

  if (!isLoading && extras.length === 0) return null;

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-bold text-zinc-900">No te olvides nada</h2>
        <span className="text-xs font-medium text-zinc-500">Sumalo con un toque</span>
      </div>

      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {isLoading
          ? Array.from({ length: SKELETON_COUNT }, (_, idx) => (
              <UltimoAntojoCardSkeleton key={`ultimo-antojo-skeleton-${idx}`} />
            ))
          : extras.map((product) => (
              <UltimoAntojoCard
                key={product.id ?? product.slug}
                product={product}
                onAdd={handleAdd}
              />
            ))}
      </div>
    </section>
  );
}
