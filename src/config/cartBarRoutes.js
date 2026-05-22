/**
 * Rutas donde se muestra la barra global "Ver mi pedido" (exploración/compra).
 * Whitelist explícita: evita que aparezca en cuenta, checkout, producto, combo, etc.
 */

const CART_BAR_ROUTE_EXACT = ["/"];

const CART_BAR_ROUTE_PREFIXES = ["/promociones", "/catalogo", "/buscar"];

/** Prefijos que requieren segmento adicional (p. ej. /categoria/vinos). */
const CART_BAR_ROUTE_PATH_PREFIXES = ["/categoria/"];

/**
 * @param {string | null | undefined} pathname
 * @returns {boolean}
 */
export function isCartBarRoute(pathname) {
  if (!pathname) return false;
  if (CART_BAR_ROUTE_EXACT.includes(pathname)) return true;
  if (CART_BAR_ROUTE_PATH_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  return CART_BAR_ROUTE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
