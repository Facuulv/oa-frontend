import apiClient from "./apiClient";
import { apiPaths } from "@/config/apiPaths";

export async function getCategories() {
  const { data } = await apiClient.get(apiPaths.public.categories);
  return Array.isArray(data) ? data : data?.data ?? [];
}

function buildQueryString(params = {}) {
  if (!params || typeof params !== "object") return "";
  const sp = new URLSearchParams();
  for (const [key, raw] of Object.entries(params)) {
    if (raw == null || raw === "") continue;
    const value =
      typeof raw === "boolean" ? (raw ? "1" : "0") : typeof raw === "number" ? String(raw) : String(raw);
    sp.set(key, value);
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

async function getPublicProducts(params) {
  const url = `${apiPaths.public.products}${buildQueryString(params)}`;
  const { data } = await apiClient.get(url);
  return Array.isArray(data) ? data : data?.data ?? [];
}

function toSlug(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Resuelve una categoría a partir de un slug (case/acentos-insensitive).
 * Devuelve el objeto de categoría crudo (como viene del backend) o null.
 */
export async function getCategoryBySlug(slug) {
  const slugNorm = toSlug(Array.isArray(slug) ? slug[0] : String(slug ?? ""));
  if (!slugNorm) return null;

  const categories = await getCategories();
  const list = Array.isArray(categories) ? categories : [];

  return (
    list.find((c) => toSlug(c?.slug ?? "") === slugNorm) ??
    list.find((c) => toSlug(c?.nombre ?? c?.name ?? "") === slugNorm) ??
    null
  );
}

/**
 * Listado público de productos.
 * - Si recibe un objeto, se usa como query params (ej: { categoria_id: 3 }).
 * - Si recibe un scalar, se interpreta como `categoria_id` por compatibilidad.
 */
export async function getProductsByCategory(categoryOrParams) {
  if (categoryOrParams != null && typeof categoryOrParams === "object") {
    return getPublicProducts(categoryOrParams);
  }
  if (categoryOrParams == null || categoryOrParams === "") {
    return getPublicProducts();
  }
  // Backend espera `categoria_id` (snake_case) como en admin.
  return getPublicProducts({ categoria_id: categoryOrParams });
}

/** Productos con destacado = 1 (combos/ofertas). */
export async function getPromotions() {
  return getPublicProducts({ destacado: 1 });
}

/** Alias histórico (carrusel de inicio). */
export async function getFeaturedProducts() {
  return getPromotions();
}

export async function getProductDetail(productId) {
  const { data } = await apiClient.get(apiPaths.public.productById(productId));
  return data?.data ?? data;
}

export async function getExtrasByProduct(productId) {
  // Extras endpoint not yet available — returns empty until backend supports it
  return [];
}

export function searchProducts(query, allProducts = []) {
  if (!query || !query.trim()) return allProducts;
  const q = query.trim().toLowerCase();
  return allProducts.filter((p) => (p.nombre || "").toLowerCase().includes(q));
}
