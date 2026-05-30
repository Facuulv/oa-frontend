"use client";

import { cn } from "@/lib/cn";

/**
 * Teaser visual de cupón de descuento (sin lógica; próximamente).
 */
export default function CheckoutDiscountCodeTeaser({ className }) {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-dashed border-[#C1121F] bg-red-50/90 px-3 py-3.5 sm:px-4 sm:py-4",
        "pointer-events-none cursor-not-allowed select-none opacity-75",
        className,
      )}
      aria-hidden="true"
    >
      <span className="absolute -right-1 -top-2.5 z-10 rounded-full bg-black px-2.5 py-1 text-[10px] font-bold leading-tight text-white shadow-sm sm:-right-0.5 sm:px-3 sm:py-1 sm:text-xs">
        ✨ Próximamente
      </span>

      <p className="mb-2.5 pr-16 text-xs font-bold uppercase tracking-wide text-zinc-800 sm:text-sm sm:normal-case sm:tracking-normal">
        Código de descuento
      </p>

      <div className="flex gap-2">
        <div
          className="min-h-10 flex-1 rounded-lg border border-zinc-200/90 bg-white px-3 py-2 text-sm text-zinc-400"
          role="presentation"
        >
          Ingresá tu cupón
        </div>
        <div
          className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100 px-3.5 text-sm font-bold text-zinc-500"
          role="presentation"
        >
          Aplicar
        </div>
      </div>
    </div>
  );
}
