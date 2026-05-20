"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ImageWithFade from "@/components/ImageWithFade";
import { PLACEHOLDER_CATEGORY } from "@/constants/images";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
import { HOME_CATEGORY_CARD_CLASS } from "@/constants/homeTheme";

export default function CategoryCard({ category, index = 0 }) {
  const imgSrc =
    getOptimizedImageUrl(category.imagen_url, { preset: "categoryCard" }) || PLACEHOLDER_CATEGORY;

  return (
    <Link
      href={`/categoria/${category.slug ?? category.id}`}
      className={HOME_CATEGORY_CARD_CLASS}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <ImageWithFade
        src={imgSrc}
        alt=""
        className="home-category-card__image absolute inset-0 h-full w-full object-cover object-center"
        aria-hidden
        onError={(e) => {
          e.currentTarget.src = PLACEHOLDER_CATEGORY;
        }}
      />
      <div className="home-category-card__overlay-dark absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/22 to-transparent" />
      <div className="home-category-card__overlay-brand absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
      <div className="relative z-10 flex w-full items-end justify-between gap-3 px-3.5 pb-3.5 md:px-4 md:pb-4">
        <span className="line-clamp-2 text-[0.98rem] font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] md:text-[1.02rem]">
          {category.nombre}
        </span>
        <span className="home-category-card__arrow flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/22 text-white/90 ring-1 ring-white/25 backdrop-blur-[2px]">
          <ChevronRight size={16} className="home-category-card__arrow-icon" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
