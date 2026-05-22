"use client";

import { memo } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ImageWithFade from "@/components/ImageWithFade";
import { PLACEHOLDER_PRODUCT_CARD } from "@/constants/images";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
import { formatPrice } from "@/utils/format/price";
import { PROMO_BADGE_CLASS, PROMO_CARD_LINK_CLASS } from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

function PromoCard({ product, badgeLabel = "Promoción" }) {
  const imgSrc =
    getOptimizedImageUrl(product.imagen_url, { preset: "productCard" }) ||
    PLACEHOLDER_PRODUCT_CARD;
  const href = `/producto/${product.slug ?? product.id}`;
  const showBadge = badgeLabel != null && badgeLabel !== false && badgeLabel !== "";

  return (
    <Link href={href} className={PROMO_CARD_LINK_CLASS}>
      <div
        className={cn(
          "promo-card__media relative shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-zinc-50 to-zinc-100",
          "h-[5.25rem] w-[5.25rem]",
          "md:h-40 md:w-full md:shrink md:rounded-none md:rounded-t-2xl lg:h-44",
        )}
      >
        <ImageWithFade
          src={imgSrc}
          alt={product.nombre}
          className="promo-card__image h-full w-full object-cover object-center md:absolute md:inset-0"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER_PRODUCT_CARD;
          }}
        />
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-between gap-2 py-0.5 md:gap-2.5 md:p-3 md:py-3">
        <div className="min-w-0 space-y-1.5 md:space-y-1.5">
          {showBadge ? <span className={PROMO_BADGE_CLASS}>{badgeLabel}</span> : null}
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
            {product.nombre}
          </p>
          {product.descripcion ? (
            <p className="line-clamp-2 text-xs leading-snug text-zinc-500 md:line-clamp-1">
              {product.descripcion}
            </p>
          ) : null}
        </div>

        <div className="flex items-end justify-between gap-2.5 pt-0.5">
          <p className="product-price min-w-0 text-base leading-none text-primary md:text-[0.9375rem]">
            {formatPrice(product.precio)}
          </p>
          <span
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary/80 md:h-8 md:w-8",
              "motion-safe:transition-colors motion-safe:group-hover:bg-primary/12 motion-safe:group-focus-visible:bg-primary/12",
            )}
            aria-hidden
          >
            <ChevronRight size={16} strokeWidth={2.25} className="promo-card__chevron" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default memo(PromoCard);
