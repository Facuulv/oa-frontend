import appConfig from "@/config/app.config";

/** Normaliza texto para comparar categorías sin acentos. */
export function normalizeCategoryKey(s) {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getExtrasCategoryConfig() {
  const combo = appConfig.combo ?? {};
  return {
    names: (combo.extrasCategoryNames ?? ["Extras"]).map(normalizeCategoryKey),
    slugs: (combo.extrasCategorySlugs ?? ["extras"]).map(normalizeCategoryKey),
  };
}

/**
 * Producto del paso 3 (extras + hielo) según allowlist de categoría (nombre/slug), no por nombre del producto.
 * @param {{ categoria_nombre?: string | null, categoria_slug?: string | null }} product
 */
export function isExtrasCategoryProduct(product) {
  if (!product) return false;
  const { names, slugs } = getExtrasCategoryConfig();
  const catName = normalizeCategoryKey(product.categoria_nombre);
  const catSlug = normalizeCategoryKey(
    product.categoria_slug ?? product.categoria_nombre
  );
  if (catName && names.includes(catName)) return true;
  if (catSlug && slugs.includes(catSlug)) return true;
  return false;
}
