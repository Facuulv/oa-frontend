"use client";

/**
 * Controles de paginación local del wizard /arma-tu-combo (presentacional).
 */
export default function ComboListPagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div
      className="mt-4 flex flex-col items-center gap-3 border-t border-zinc-100 pt-4"
      role="navigation"
      aria-label="Paginación de productos"
    >
      <p className="text-sm font-medium text-zinc-600">
        Página {page} de {totalPages}
      </p>
      <div className="flex w-full max-w-xs gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex-1 rounded-xl border border-zinc-200 bg-white py-2.5 text-sm font-semibold text-zinc-800 motion-safe:transition hover:bg-zinc-50 motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Anterior
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex-1 rounded-xl border border-zinc-200 bg-white py-2.5 text-sm font-semibold text-zinc-800 motion-safe:transition hover:bg-zinc-50 motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
