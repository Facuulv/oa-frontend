import { COMBO_LABEL_MAX_LENGTH, MAX_COMBO_LABELS } from "./buildComboLabelsFromCart.js";

const PAYMENT_METHOD_MAP = {
  efectivo: "CASH",
  cash: "CASH",
  transferencia: "TRANSFER",
  transfer: "TRANSFER",
  CASH: "CASH",
  TRANSFER: "TRANSFER",
};

function mapPaymentMethod(raw) {
  const key = String(raw ?? "efectivo").trim().toLowerCase();
  return PAYMENT_METHOD_MAP[key] || PAYMENT_METHOD_MAP[raw] || "CASH";
}

/** Sanitiza comboLabels del payload (alineado con validator backend). */
export function sanitizeComboLabelsForApi(comboLabels) {
  if (!Array.isArray(comboLabels) || comboLabels.length === 0) return [];
  const seen = new Set();
  const out = [];
  for (const raw of comboLabels) {
    const label = String(raw ?? "").trim().slice(0, COMBO_LABEL_MAX_LENGTH);
    if (!label || seen.has(label)) continue;
    seen.add(label);
    out.push(label);
    if (out.length >= MAX_COMBO_LABELS) break;
  }
  return out;
}

/**
 * Body JSON para POST /public/orders (sin campos de carrito UI).
 * @param {object} payload — salida de buildCheckoutPayload
 */
export function toBackendOrderBody(payload) {
  const customer = payload.customer ?? {};
  const customerName = String(customer.nombre ?? customer.name ?? "").trim();
  const customerPhone = String(customer.telefono ?? customer.phone ?? "").trim() || null;
  let customerEmail = String(customer.email ?? "").trim();
  if (!customerEmail) {
    customerEmail = "noreply@example.com";
  }

  const items = (payload.items ?? []).map((item) => {
    const productId = Number(item.productId ?? item.articuloId ?? item.id);
    if (!Number.isInteger(productId) || productId <= 0) {
      throw new Error(
        "Hay productos inválidos en el carrito. Volvé a armar tu combo para confirmar el pedido."
      );
    }
    return {
      productId,
      quantity: Number(item.quantity ?? item.cantidad ?? 1),
      unitPrice: Number(item.precioUnitario ?? item.unitPrice ?? 0),
      notes: String(item.observations ?? item.observaciones ?? "").trim() || null,
    };
  });

  const deliveryAddress =
    payload.deliveryType === "DELIVERY"
      ? String(payload.address ?? customer.direccion ?? "").trim() || null
      : null;

  const meta = [];
  if (payload.deliveryType) meta.push(`deliveryType:${payload.deliveryType}`);
  if (payload.when) meta.push(`when:${payload.when}`);
  if (payload.scheduledTime) meta.push(`scheduledTime:${payload.scheduledTime}`);
  const notesBase = String(payload.notes ?? "").trim();
  const notesExtra = meta.length ? meta.join(" | ") : "";
  const notes = [notesBase, notesExtra].filter(Boolean).join(" — ") || null;
  const tipoEntrega = payload.deliveryType === "DELIVERY" ? "DELIVERY" : "RETIRO";

  const comboLabels = sanitizeComboLabelsForApi(payload.comboLabels);

  const body = {
    items,
    couponCode: String(payload.couponCode ?? "").trim() || null,
    deliveryAddress,
    customerName,
    customerEmail,
    customerPhone,
    notes,
    tipoEntrega,
    paymentMethod: mapPaymentMethod(payload.paymentMethod),
  };

  if (comboLabels.length > 0) {
    body.comboLabels = comboLabels;
  }

  return body;
}
