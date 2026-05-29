"use client";

import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { CHECKOUT_STATUS_CARD_CLASS, PUBLIC_PRESSABLE_CLASS } from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

export default function SavedCombosEmptyState() {
  return (
    <div className={CHECKOUT_STATUS_CARD_CLASS}>
      <span
        className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"
        aria-hidden
      >
        <Sparkles size={22} strokeWidth={2.25} />
      </span>
      <h2 className="text-base font-bold tracking-tight text-foreground md:text-lg">
        Todavía no guardaste combos
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-snug text-zinc-500">
        Armá uno nuevo y guardalo para volver a pedir en segundos.
      </p>
      <Link
        href="/arma-tu-combo"
        className={cn(
          PUBLIC_PRESSABLE_CLASS,
          "home-cta-primary-shadow mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary via-primary to-primary-dark px-6 text-sm font-bold text-white",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        )}
      >
        Ir a Arma tu combo
        <ChevronRight size={15} aria-hidden />
      </Link>
    </div>
  );
}
