"use client";

import Link from "next/link";
import { Beer, ChevronRight, Tag } from "lucide-react";

/**
 * Tarjetas destacadas del inicio: Promociones y Armá tu combo.
 * Ancho completo, antes de la grilla de categorías.
 */
export default function HomeFeaturedCards() {
  return (
    <div className="mb-6 space-y-3">
      <Link
        href="/promociones"
        className="group flex min-h-[5.5rem] items-center gap-4 rounded-2xl bg-gradient-to-br from-[#C1121F] via-[#C1121F] to-[#A10E19] p-5 shadow-md transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]"
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20">
          <Tag size={28} strokeWidth={2.25} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xl font-extrabold leading-tight tracking-tight text-white">
            Promociones Imperdibles
          </span>
          <span className="mt-1 block text-sm font-medium text-white/90">
            Descuentos y packs que no te podés perder
          </span>
        </span>
        <ChevronRight
          size={22}
          className="shrink-0 text-white/90 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>

      <Link
        href="/arma-tu-combo"
        className="group flex min-h-[5.5rem] flex-col justify-center gap-1 rounded-2xl border-2 border-[#C1121F] bg-white p-5 shadow-md transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]"
      >
        <span className="text-sm font-semibold italic tracking-wide text-[#C1121F]">
          fijate vos y decidí
        </span>
        <span className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#C1121F]/10 text-[#C1121F]">
            <Beer size={28} strokeWidth={2.25} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xl font-extrabold leading-tight tracking-tight text-zinc-900">
              Armá tu combo a medida
            </span>
            <span className="mt-1 block text-sm font-medium text-zinc-600">
              Elegí base, mix y extras en un solo producto
            </span>
          </span>
          <ChevronRight
            size={22}
            className="shrink-0 text-[#C1121F] transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </Link>
    </div>
  );
}
