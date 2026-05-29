"use client";

import { TriangleAlert } from "lucide-react";

const CLOSED_HINT =
  "Estamos cerrados. Podés volver a realizar tu pedido dentro del horario de atención.";

export default function StoreClosedBanner({
  message,
  nextOpeningText,
  fetchError = false,
  className = "",
}) {
  const title =
    message ||
    (fetchError
      ? "No pudimos verificar si la tienda está abierta."
      : "Estamos cerrados en este momento");

  return (
    <div
      className={`w-full border-b border-amber-300/90 bg-amber-50 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-3xl items-start gap-3 px-4 py-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-200/80">
          <TriangleAlert size={18} className="text-amber-800" strokeWidth={2} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-amber-950">{title}</h3>
          {!fetchError ? (
            <p className="mt-0.5 text-sm text-amber-900/90">
              Podés ver la carta, pero no finalizar pedidos en este momento. {CLOSED_HINT}
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-amber-900/90">
              Intentá nuevamente en unos segundos antes de confirmar tu pedido.
            </p>
          )}
          {nextOpeningText ? (
            <p className="mt-1.5 text-sm font-medium text-amber-950">{nextOpeningText}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
