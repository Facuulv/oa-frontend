"use client";

import { formatPrice } from "@/utils/format/price";

export default function CheckoutFooter({ total, onCheckout, isSubmitting = false }) {
  return (
    <div className="sticky bottom-0 border-t bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-lg font-extrabold text-primary">{formatPrice(total)}</p>
        </div>
        <button
          type="button"
          onClick={onCheckout}
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-50"
        >
          {isSubmitting ? "Procesando..." : "Finalizar pedido"}
        </button>
      </div>
    </div>
  );
}
