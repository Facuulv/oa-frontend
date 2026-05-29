"use client";

import { Sparkles } from "lucide-react";
import { ACCOUNT_DARK_HERO_CLASS } from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

/**
 * Banner compacto con conteo de combos guardados.
 * @param {object} props
 * @param {number} props.count
 */
export default function SavedCombosSummaryCard({ count }) {
  return (
    <div className={cn(ACCOUNT_DARK_HERO_CLASS, "p-4 md:p-5")}>
      <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-4 h-20 w-20 rounded-full bg-white/[0.04] blur-2xl" />

      <div className="relative flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.14em] text-red-200/90">Guardados</p>
          <p className="mt-1 text-sm text-zinc-200">
            Tenés <span className="font-bold text-white">{count}</span> combo
            {count === 1 ? "" : "s"} listo{count === 1 ? "" : "s"}.
          </p>
        </div>
        <span
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/10"
          aria-hidden
        >
          <Sparkles size={18} strokeWidth={2.25} />
        </span>
      </div>
    </div>
  );
}
