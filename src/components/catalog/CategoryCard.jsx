"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PLACEHOLDER_CATEGORY } from "@/constants/images";
import { buildImageUrl } from "@/lib/imageUtils";

export default function CategoryCard({ category, index = 0 }) {
  const bgImage = buildImageUrl(category.imagen_url) || PLACEHOLDER_CATEGORY;

  return (
    <Link
      href={`/categoria/${category.slug ?? category.id}`}
      className="card-fade-in group relative flex h-28 items-end overflow-hidden rounded-xl shadow-md"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="relative z-10 flex w-full items-center justify-between px-4 pb-3">
        <span className="text-base font-bold text-white drop-shadow">
          {category.nombre}
        </span>
        <ChevronRight size={18} className="text-white/80" />
      </div>
    </Link>
  );
}
