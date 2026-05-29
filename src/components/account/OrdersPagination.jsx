"use client";

import { PUBLIC_PRESSABLE_CLASS } from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

export default function OrdersPagination({
  pagination,
  onPrev,
  onNext,
  disabled = false,
}) {
  const { page, limit, totalPages, hasPrevPage, hasNextPage, total } = pagination ?? {};

  if (!total || totalPages <= 1) return null;

  const currentPage = page || 1;
  const pages = totalPages || 1;
  const pageSize = limit || 8;
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  return (
    <nav
      className="mx-auto mt-6 flex w-full max-w-md flex-col items-center gap-3"
      aria-label="Paginación de pedidos"
    >
      <p className="text-sm font-medium text-zinc-600">
        Página {currentPage} de {pages}
      </p>
      <p className="text-xs text-zinc-500">
        Mostrando {from}–{to} de {total} pedido{total === 1 ? "" : "s"}
      </p>
      <div className="flex w-full gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={disabled || !hasPrevPage}
          className={cn(
            PUBLIC_PRESSABLE_CLASS,
            "min-h-[44px] flex-1 rounded-xl border border-zinc-200/90 bg-white px-4 text-sm font-semibold text-zinc-800",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={disabled || !hasNextPage}
          className={cn(
            PUBLIC_PRESSABLE_CLASS,
            "home-cta-primary-shadow min-h-[44px] flex-1 rounded-xl bg-gradient-to-br from-primary via-primary to-primary-dark px-4 text-sm font-semibold text-white",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none",
          )}
        >
          Siguiente
        </button>
      </div>
    </nav>
  );
}
