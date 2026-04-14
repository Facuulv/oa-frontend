export function formatPrice(price) {
  return `$${new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(price ?? 0)}`;
}
