export function buildCheckoutPayload({ normalized, items }) {
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
    items: items.map((item) => ({
      productId: item.articuloId ?? item.id,
      quantity: item.cantidad ?? 1,
      unitPrice: item.precioUnitario ?? 0,
      selectedExtras: (item.extrasSeleccionados ?? []).map((e) => ({
        id: e.id,
        nombre: e.nombre,
        precio: e.precioExtra ?? e.precio ?? 0,
      })),
      observations: item.observaciones ?? "",
    })),
  };

  return { payload };
}

export function buildMercadoPagoCheckoutPayload({ normalized, items }) {
  const { payload } = buildCheckoutPayload({ normalized, items });
  return { ...payload, paymentMethod: "mercadopago" };
}

export function resolveCreatedOrderMeta(data) {
  const inner = data?.data ?? data;
  return {
    orderId: inner?.id ?? data?.pedidoId ?? data?.id ?? null,
    status: inner?.status ?? inner?.estado ?? data?.estado ?? "PENDING",
  };
}
