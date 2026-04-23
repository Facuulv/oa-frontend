"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ImageWithFade from "@/components/ImageWithFade";
import { getFeaturedProducts } from "@/services/catalogService";
import { mapProduct } from "@/lib/mappers/catalogMapper";
import { PLACEHOLDER_PRODUCT_CARD } from "@/constants/images";
import { buildImageUrl } from "@/lib/imageUtils";
import { formatPrice } from "@/utils/format/price";

function FeaturedPromoEmbla({ items }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback((api) => {
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative px-4 pb-2">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {items.map((p, i) => {
            const imgSrc = buildImageUrl(p.imagen_url) || PLACEHOLDER_PRODUCT_CARD;
            return (
              <div
                key={p.id}
                className={`min-w-0 max-w-sm shrink-0 flex-[0_0_88%] sm:flex-[0_0_17rem] ${i < items.length - 1 ? "mr-3" : ""}`}
              >
                <Link
                  href={`/producto/${p.slug ?? p.id}`}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="relative aspect-16/10 w-full bg-neutral-50">
                    <ImageWithFade
                      src={imgSrc}
                      alt={p.nombre}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER_PRODUCT_CARD;
                      }}
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    <p className="line-clamp-2 text-sm font-semibold text-neutral-900">{p.nombre}</p>
                    <p className="mt-auto pt-2 text-lg font-bold text-[#C1121F]">{formatPrice(p.precio)}</p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        aria-label="Anterior"
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-md transition hover:bg-white disabled:pointer-events-none disabled:opacity-35 md:flex md:items-center md:justify-center"
      >
        <ChevronLeft
          size={22}
          className={canScrollPrev ? "text-[#C1121F]" : "text-neutral-400"}
          aria-hidden
        />
      </button>
      <button
        type="button"
        aria-label="Siguiente"
        disabled={!canScrollNext}
        onClick={scrollNext}
        className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-md transition hover:bg-white disabled:pointer-events-none disabled:opacity-35 md:flex md:items-center md:justify-center"
      >
        <ChevronRight
          size={22}
          className={canScrollNext ? "text-[#C1121F]" : "text-neutral-400"}
          aria-hidden
        />
      </button>
    </div>
  );
}

export default function FeaturedPromoCarousel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await getFeaturedProducts();
        const list = (Array.isArray(raw) ? raw : [])
          .map(mapProduct)
          .filter(Boolean);
        if (!cancelled) setItems(list);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="px-4 pt-4">
        <div className="mb-2 h-5 w-28 animate-pulse rounded bg-white/70" />
        <div className="h-48 animate-pulse rounded-2xl bg-white/60" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-4 pt-4">
        <div className="rounded-2xl border border-white/80 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-bold text-[#C1121F]">OA!</p>
          <p className="mt-1 text-xs text-neutral-500">Pronto vas a ver nuestras promociones acá</p>
        </div>
      </div>
    );
  }

  return (
    <section className="pt-4" aria-label="Promociones y productos destacados">
      <h2 className="mb-3 px-4 text-base font-bold text-neutral-800">Destacados</h2>
      <FeaturedPromoEmbla items={items} />
    </section>
  );
}
