import apiClient from "./apiClient";
import { apiPaths } from "@/config/apiPaths";

export async function getCategories() {
  const { data } = await apiClient.get(apiPaths.public.categories);
  return Array.isArray(data) ? data : data?.data ?? [];
}

export async function getProductsByCategory(categoryId) {
  const params = {};
  if (categoryId != null && categoryId !== "") {
    params.categoriaId = categoryId;
  }
  const { data } = await apiClient.get(apiPaths.public.products, { params });
  const list = Array.isArray(data) ? data : data?.data ?? [];
  return list;
}

/** Productos con destacado = 1 (carrusel de inicio). */
export async function getFeaturedProducts() {
  const { data } = await apiClient.get(apiPaths.public.products, {
    params: { destacado: 1 },
  });
  const list = Array.isArray(data) ? data : data?.data ?? [];
  return list;
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
