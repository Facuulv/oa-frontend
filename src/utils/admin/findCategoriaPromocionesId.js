/**
 * Normaliza texto para comparar nombre/slug de categoría (sin acentos).
 * @param {unknown} s
 */
function normalizeKey(s) {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const COMBOS_SLUG_KEYS = new Set(["combos", "combo", "promociones", "promocion"]);
const COMBOS_NOMBRE_KEYS = new Set(["combos", "combo", "promociones", "promocion"]);

/**
 * Busca la categoría fija de combos en el listado admin de categorías.
 * Coincide por slug o nombre (Combos, Promociones legacy, etc.).
 *
 * @param {{ id?: unknown, nombre?: unknown, slug?: unknown }[]} categorias
 * @returns {number | null}
 */
export function findCategoriaPromocionesId(categorias) {
  if (!Array.isArray(categorias) || categorias.length === 0) return null;

  const bySlug = categorias.find((c) => COMBOS_SLUG_KEYS.has(normalizeKey(c?.slug)));
  if (bySlug != null && bySlug.id != null) {
    const n = Number(bySlug.id);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  const byNombre = categorias.find((c) => {
    const k = normalizeKey(c?.nombre);
    return COMBOS_NOMBRE_KEYS.has(k);
  });
  if (byNombre != null && byNombre.id != null) {
    const n = Number(byNombre.id);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  return null;
}
