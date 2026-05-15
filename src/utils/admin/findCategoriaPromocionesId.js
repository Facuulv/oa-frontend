/**
 * Normaliza texto para comparar nombre/slug de categoría (sin acentos).
 * @param {unknown} s
 */
export function normalizeCategoryKey(s) {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** @deprecated alias interno */
const normalizeKey = normalizeCategoryKey;

/**
 * Indica si una categoría del catálogo es la de Promociones (por slug o nombre).
 * @param {{ id?: unknown, nombre?: unknown, slug?: unknown } | null | undefined} categoria
 */
export function isPromocionesCategory(categoria) {
  if (!categoria || typeof categoria !== "object") return false;
  const slug = normalizeCategoryKey(categoria.slug);
  const nombre = normalizeCategoryKey(categoria.nombre);
  return (
    slug === "promociones" ||
    slug === "promocion" ||
    nombre === "promociones" ||
    nombre === "promocion"
  );
}

/**
 * Busca la categoría fija de combos/promociones en el listado admin de categorías.
 * Coincide por `slug` === "promociones" o por `nombre` (Promociones / Promoción, etc.).
 *
 * @param {{ id?: unknown, nombre?: unknown, slug?: unknown }[]} categorias
 * @returns {number | null}
 */
export function findCategoriaPromocionesId(categorias) {
  if (!Array.isArray(categorias) || categorias.length === 0) return null;

  const bySlug = categorias.find((c) => normalizeKey(c?.slug) === "promociones");
  if (bySlug != null && bySlug.id != null) {
    const n = Number(bySlug.id);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  const byNombre = categorias.find((c) => {
    const k = normalizeKey(c?.nombre);
    return k === "promociones" || k === "promocion";
  });
  if (byNombre != null && byNombre.id != null) {
    const n = Number(byNombre.id);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  return null;
}
