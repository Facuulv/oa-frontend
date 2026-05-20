"use client";

import Link from "next/link";
import { Beer, ChevronRight, Tag } from "lucide-react";
import {
  HOME_CTA_GROUP_CLASS,
  HOME_CTA_PRIMARY_CLASS,
  HOME_CTA_SECONDARY_CLASS,
} from "@/constants/homeTheme";

/**
 * Tarjetas destacadas del inicio: Promociones y Armá tu combo.
 * Ancho completo, antes de la grilla de categorías.
 */
export default function HomeFeaturedCards() {
  return (
    <div className={HOME_CTA_GROUP_CLASS}>
      <Link
        href="/promociones"
        className={`${HOME_CTA_PRIMARY_CLASS} home-cta-primary-shadow`}
      >
        <span className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
        <span className="pointer-events-none absolute -bottom-12 left-10 h-24 w-24 rounded-full bg-primary-dark/35 blur-2xl" />

        <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/14 text-white ring-1 ring-white/25 md:h-14 md:w-14">
          <Tag size={26} strokeWidth={2.25} />
        </span>
        <span className="relative min-w-0 flex-1">
          <span className="block text-[1.125rem] font-extrabold leading-tight tracking-tight text-white md:text-xl">
            Promociones Imperdibles
          </span>
          <span className="mt-1 block text-sm font-medium leading-snug text-white/90">
            Descuentos y packs que no te podés perder
          </span>
        </span>
        <ChevronRight
          size={20}
          className="relative shrink-0 text-white/90 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>

      <Link
        href="/arma-tu-combo"
        className={`${HOME_CTA_SECONDARY_CLASS} home-cta-secondary-shadow`}
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10 md:h-14 md:w-14">
          <Beer size={26} strokeWidth={2.25} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="inline-flex rounded-full bg-primary/8 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wide text-primary/85">
            Fijate vos y decidí
          </span>
          <span className="mt-1.5 block text-[1.0625rem] font-extrabold leading-tight tracking-tight text-zinc-900 md:text-[1.15rem]">
            Armá tu combo a medida
          </span>
          <span className="mt-1 block text-sm font-medium leading-snug text-zinc-600">
            Elegí base, mix y extras en un solo producto
          </span>
        </span>
        <ChevronRight
          size={20}
          className="shrink-0 text-primary/85 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </div>
  );
}
