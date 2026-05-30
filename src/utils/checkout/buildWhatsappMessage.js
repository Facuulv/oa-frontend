import { formatPrice } from "@/utils/format/price";

/**
 * Genera el texto del pedido para enviar por WhatsApp.
 * Soporta carrito local + datos del cliente + entrega + pago + notas.
 */
export function buildWhatsappMessage({
  orderId,
  customer,
  items = [],
  total = 0,
  deliveryType = "RETIRO",
  address = "",
  paymentMethod = "efectivo",
  notes = "",
}) {
  const lineas = [];

  lineas.push("*Nuevo pedido - OA!*");
  if (orderId) lineas.push(`*Pedido #${orderId}*`);
  lineas.push("");

  if (customer?.nombre) lineas.push(`*Cliente:* ${customer.nombre}`);
  if (customer?.telefono) lineas.push(`*Teléfono:* ${customer.telefono}`);
  if (customer?.email) lineas.push(`*Email:* ${customer.email}`);

  lineas.push("");
  lineas.push("*Productos:*");
  items.forEach((it) => {
    const cantidad = it.cantidad ?? it.quantity ?? 1;
    lineas.push(`• ${it.nombre ?? "Producto"} x${cantidad}`);
  });

  lineas.push("", `*TOTAL:* *${formatPrice(total)}*`, "");

  const entregaLabel = deliveryType === "DELIVERY" ? "Delivery" : "Retiro en local";
  lineas.push(`*Entrega:* ${entregaLabel}`);
  if (deliveryType === "DELIVERY" && address) {
    lineas.push(`*Dirección:* ${address}`);
  }

  const pagoLabel = paymentMethod === "transferencia" ? "Transferencia" : "Efectivo";
  lineas.push(`*Pago:* ${pagoLabel}`);

  if (notes) {
    lineas.push("");
    lineas.push(`*Notas:* ${notes}`);
  }

  const isTransferencia =
    String(paymentMethod ?? "").trim().toLowerCase() === "transferencia";

  if (isTransferencia) {
    lineas.push(
      "",
      `*Datos para la transferencia:*
Alias: oa.bebidas
Nombre: Vinobar S.a.s.
CVU: 0000003100085103564817

*Esperamos el comprobante de transferencia por este medio para empezar a preparar tu pedido.*`,
    );
  }

  lineas.push("", `*¡Muchas gracias por tu pedido a OA! Bebidas!*`);

  return lineas.join("\n");
}

/**
 * Construye el URL `wa.me` con el mensaje encodeado.
 * @param {string} message
 * @param {string} whatsappPedidos Solo dígitos (ej. 5493511234567)
 */
export function buildWhatsappUrl(message, whatsappPedidos) {
  const digits = String(whatsappPedidos ?? "").replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
