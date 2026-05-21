import { expandCartItemsToOrderLines } from "../../features/combo/expandComboOrderLines.js";
import { buildComboLabelsFromCart } from "./buildComboLabelsFromCart.js";

/** @internal Lógica pura de payload (imports relativos para tests Node). */
export function buildCheckoutPayloadCore({ normalized, items }) {
  const expanded = expandCartItemsToOrderLines(items);
  if (!expanded.ok) {
    return { payload: null, error: expanded.error };
  }

  const comboLabels = buildComboLabelsFromCart(items);

  const payload = {
    customer: {
      nombre: normalized.nombre,
      telefono: normalized.telefono,
      ...(normalized.email && { email: normalized.email }),
    },
    deliveryType: normalized.deliveryType,
    ...(normalized.deliveryType === "DELIVERY" && { address: normalized.direccion }),
    paymentMethod: normalized.paymentMethod,
    when: normalized.when,
    ...(normalized.scheduledTime && { scheduledTime: normalized.scheduledTime }),
    ...(normalized.notes && { notes: normalized.notes }),
    ...(normalized.couponCode && { couponCode: normalized.couponCode }),
    items: expanded.lines.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      selectedExtras: line.selectedExtras ?? [],
      observations: line.observations ?? "",
    })),
    ...(comboLabels.length > 0 ? { comboLabels } : {}),
  };

  return { payload, error: null };
}
