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
import HomeSectionHeader from "@/components/home/HomeSectionHeader";
import {
  HOME_CAROUSEL_CLASS,
  HOME_CAROUSEL_VIEWPORT_CLASS,
  HOME_CAROUSEL_TRACK_CLASS,
  HOME_FEATURED_CARD_LINK_CLASS,
  HOME_FEATURED_CARD_SHELL_CLASS,
  HOME_FEATURED_SLIDE_CLASS,
  HOME_CARD_SURFACE_CLASS,
  HOME_SECTION_LEAD_CLASS,
} from "@/constants/homeTheme";

function FeaturedPromoCard({ product }) {
  const imgSrc = buildImageUrl(product.imagen_url) || PLACEHOLDER_PRODUCT_CARD;

  return (
    <Link href={`/producto/${product.slug ?? product.id}`} className={HOME_FEATURED_CARD_LINK_CLASS}>
      <div className="home-featured-card__media">
        <ImageWithFade
          src={imgSrc}
          alt={product.nombre}
          className="absolute inset-0 h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out motion-safe:group-hover:scale-[1.02]"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER_PRODUCT_CARD;
          }}
        />
      </div>
      <div className="flex min-h-[4.75rem] flex-1 flex-col justify-between gap-2 p-3.5 md:min-h-[5rem] md:p-4">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground md:text-[0.9375rem]">
          {product.nombre}
        </p>
        <p className="product-price text-lg text-primary">{formatPrice(product.precio)}</p>
      </div>
    </Link>
  );
}

function FeaturedPromoCardSkeleton() {
  return (
    <div className={HOME_FEATURED_CARD_SHELL_CLASS} aria-hidden="true">
      <div className="home-featured-card__media animate-pulse bg-zinc-100/90" />
      <div className="space-y-2.5 p-3.5 md:p-4">
        <div className="h-4 animate-pulse rounded-md bg-zinc-100/90" />
        <div className="h-4 w-[88%] animate-pulse rounded-md bg-zinc-100/80" />
        <div className="h-6 w-20 animate-pulse rounded-md bg-zinc-100/90" />
      </div>
    </div>
  );
}

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
    <div className={HOME_CAROUSEL_CLASS}>
      <button
        type="button"
        aria-label="Anterior"
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        className="home-carousel-arrow home-carousel-arrow--prev"
      >
        <ChevronLeft
          size={20}
          strokeWidth={2.25}
          className={canScrollPrev ? "text-primary" : "text-neutral-400"}
          aria-hidden
        />
      </button>

      <div className={HOME_CAROUSEL_VIEWPORT_CLASS} ref={emblaRef}>
        <div className={HOME_CAROUSEL_TRACK_CLASS}>
          {items.map((p) => (
            <div key={p.id} className={HOME_FEATURED_SLIDE_CLASS}>
              <FeaturedPromoCard product={p} />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label="Siguiente"
        disabled={!canScrollNext}
        onClick={scrollNext}
        className="home-carousel-arrow home-carousel-arrow--next"
      >
        <ChevronRight
          size={20}
          strokeWidth={2.25}
          className={canScrollNext ? "text-primary" : "text-neutral-400"}
          aria-hidden
        />
      </button>
    </div>
  );
}

function FeaturedCarouselSkeleton() {
  return (
    <div className={HOME_CAROUSEL_CLASS}>
      <div className={HOME_CAROUSEL_VIEWPORT_CLASS}>
        <div className={HOME_CAROUSEL_TRACK_CLASS}>
          {[0, 1, 2].map((k) => (
            <div key={k} className={HOME_FEATURED_SLIDE_CLASS}>
              <FeaturedPromoCardSkeleton />
            </div>
          ))}
        </div>
      </div>
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
      <section
        className={HOME_SECTION_LEAD_CLASS}
        aria-label="Promociones y productos destacados"
        aria-busy="true"
      >
        <header className="home-section-header">
          <div className="home-section-header__accent animate-pulse space-y-2">
            <div className="h-5 w-32 rounded-md bg-white/80 md:h-6 md:w-40" />
            <div className="h-3.5 w-56 max-w-full rounded-md bg-white/60 md:w-72" />
          </div>
        </header>
        <FeaturedCarouselSkeleton />
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className={HOME_SECTION_LEAD_CLASS} aria-label="Promociones y productos destacados">
        <HomeSectionHeader
          title="Destacados"
          subtitle="Lo más elegido por nuestros clientes"
        />
        <div
          className={`${HOME_CARD_SURFACE_CLASS} rounded-2xl border border-white/80 bg-white p-6 text-center`}
        >
          <p className="text-sm font-bold text-primary">OA!</p>
          <p className="mt-1 text-xs text-neutral-500">Pronto vas a ver nuestras promociones acá</p>
        </div>
      </section>
    );
  }

  return (
    <section className={HOME_SECTION_LEAD_CLASS} aria-label="Promociones y productos destacados">
      <HomeSectionHeader
        title="Destacados"
        subtitle="Lo más elegido por nuestros clientes"
      />
      <FeaturedPromoEmbla items={items} />
    </section>
  );
}
