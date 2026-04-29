"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Controles simples de paginación (mobile-first, táctil).
 * No renderiza nada si hay una sola página o menos.
 */
export default function AdminListPagination({
  page,
  totalPages,
  busy = false,
  onPrev,
  onNext,
  ariaLabel,
  className = "",
}) {
  const tp = Math.max(1, totalPages);
  if (tp <= 1) return null;

  const canPrev = page > 1;
  const canNext = page < tp;

  return (
    <nav
      role="navigation"
      aria-label={ariaLabel}
      className={`rounded-2xl border border-zinc-200/80 bg-white px-4 py-3 shadow-sm ring-1 ring-zinc-200/50 ${busy ? "opacity-60" : ""} ${className}`.trim()}
    >
      <div className="flex flex-col gap-3">
        <p className="text-center text-sm text-zinc-700">
          Página <span className="font-semibold text-zinc-900">{page}</span> de{" "}
          <span className="font-semibold text-zinc-900">{tp}</span>
        </p>
        <div className="flex flex-col gap-2 sm:mx-auto sm:max-w-lg sm:flex-row sm:gap-3">
          <button
            type="button"
            disabled={!canPrev || busy}
            onClick={onPrev}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-1 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-800 outline-none ring-primary transition-colors hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft size={18} aria-hidden />
            Anterior
          </button>
          <button
            type="button"
            disabled={!canNext || busy}
            onClick={onNext}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-1 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-800 outline-none ring-primary transition-colors hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
          >
            Siguiente
            <ChevronRight size={18} aria-hidden />
          </button>
        </div>
      </div>
    </nav>
  );
}
