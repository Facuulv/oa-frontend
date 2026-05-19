"use client";

export default function OrdersPagination({
  pagination,
  onPrev,
  onNext,
  disabled = false,
}) {
  const { page, totalPages, hasPrevPage, hasNextPage, total } = pagination ?? {};

  if (!total || totalPages <= 1) return null;

  const currentPage = page || 1;
  const pages = totalPages || 1;

  return (
    <nav
      className="mt-6 flex flex-col items-center gap-3"
      aria-label="Paginación de pedidos"
    >
      <p className="text-sm font-medium text-zinc-600">
        Página {currentPage} de {pages}
      </p>
      <div className="flex w-full max-w-xs gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={disabled || !hasPrevPage}
          className="min-h-[44px] flex-1 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={disabled || !hasNextPage}
          className="min-h-[44px] flex-1 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </nav>
  );
}
