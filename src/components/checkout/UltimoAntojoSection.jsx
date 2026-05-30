"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import ImageWithFade from "@/components/ImageWithFade";
import { PLACEHOLDER_PRODUCT_CARD } from "@/constants/images";
import {
  CHECKOUT_FINALIZE_CARD_CLASS,
  CHECKOUT_FINALIZE_EXTRAS_GRID_CLASS,
  HOME_CARD_SURFACE_CLASS,
} from "@/constants/homeTheme";
import { isExtrasCategoryProduct } from "@/features/combo/comboExtrasCategory";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
import { mapProduct } from "@/lib/mappers/catalogMapper";
import { getProductsByCategory } from "@/services/catalogService";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/utils/format/price";
import { cn } from "@/lib/cn";

const EXTRAS_LIMIT = 5;
const SKELETON_COUNT = 5;

function UltimoAntojoCardSkeleton() {
  return (
    <div
      className={cn(
        HOME_CARD_SURFACE_CLASS,
        "relative flex flex-col items-center rounded-2xl border border-zinc-100/90 bg-white p-2.5",
      )}
      aria-hidden
    >
      <div className="mb-1.5 h-14 w-14 animate-pulse rounded-full bg-zinc-200" />
      <div className="h-2.5 w-full max-w-16 animate-pulse rounded bg-zinc-200" />
      <div className="mt-1.5 h-3.5 w-10 animate-pulse rounded bg-zinc-200" />
    </div>
  );
}

function UltimoAntojoCard({ product, onAdd }) {
  const imgSrc =
    getOptimizedImageUrl(product.imagen_url, { preset: "productCard" }) ||
    PLACEHOLDER_PRODUCT_CARD;

  return (
    <div
      className={cn(
        HOME_CARD_SURFACE_CLASS,
        "relative flex flex-col items-center rounded-2xl border border-zinc-100/90 bg-white p-2.5",
      )}
    >
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
        className="line-clamp-2 w-full text-center text-[11px] font-medium leading-tight text-zinc-700"
        title={product.nombre}
      >
        {product.nombre}
      </p>
      <p className="mt-1 text-sm font-bold tabular-nums text-primary">
        {formatPrice(product.precio)}
      </p>
      <button
        type="button"
        onClick={() => onAdd(product)}
        aria-label={`Agregar ${product.nombre} al carrito`}
        className="absolute -right-1 -top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-md transition hover:bg-primary-dark active:scale-95"
      >
        <Plus size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}

/**
 * Sugerencias compactas para el final del checkout.
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
    <section className={CHECKOUT_FINALIZE_CARD_CLASS} aria-label="No te olvides nada">
      <div className="mb-4">
        <h2 className="home-section-header__accent text-sm font-bold text-foreground md:text-base">
          No te olvides nada
        </h2>
        <p className="mt-1 text-xs text-zinc-500 sm:text-sm">Sumalo con un toque</p>
      </div>

      <div className={CHECKOUT_FINALIZE_EXTRAS_GRID_CLASS}>
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
