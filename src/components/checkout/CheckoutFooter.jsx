"use client";

import CheckoutSummaryCard from "@/components/checkout/CheckoutSummaryCard";

/**
 * @deprecated Usar CheckoutSummaryCard directamente. Wrapper de compatibilidad.
 */
export default function CheckoutFooter({
  total,
  onCheckout,
  isSubmitting = false,
  itemLineCount = 1,
  unitCount = 1,
}) {
  return (
    <CheckoutSummaryCard
      variant="mobile-bar"
      total={total}
      itemLineCount={itemLineCount}
      unitCount={unitCount}
      onCheckout={onCheckout}
      isSubmitting={isSubmitting}
    />
  );
}
