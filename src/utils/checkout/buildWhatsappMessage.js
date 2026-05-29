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

  lineas.push("");
  lineas.push(`*Total:* ${formatPrice(total)}`);
  lineas.push("");

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
