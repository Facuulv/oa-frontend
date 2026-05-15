import { TIPO_PRODUCTO } from "@/constants/tipoProducto";

export const ICE_BAG_PRICE = 2500;
export const AUTO_ADVANCE_MS = 280;
export const PRODUCTS_PER_PAGE = 5;

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
export const PRODUCTOS_ENDPOINT = `${API_BASE}/public/productos`;

// Clasificación por keywords (provisorio hasta tener tipo/categoría real).
export const BASE_KEYWORDS = [
  "fernet",
  "gin",
  "vodka",
  "whisky",
  "whiskey",
  "ron",
  "tequila",
  "aperol",
  "campari",
  "branca",
  "jagermeister",
  "jäger",
  "absolut",
  "jack daniels",
  "jim beam",
  "vino",
  "luigi bosca",
];

export const MIXER_KEYWORDS = [
  "coca",
  "cocacola",
  "coca-cola",
  "tonica",
  "tónica",
  "sprite",
  "7up",
  "seven up",
  "speed",
  "redbull",
  "red bull",
  "monster",
  "schweppes",
  "paso de los toros",
  "agua tonica",
  "agua tónica",
  "pomelo",
  "jugo",
  "gaseosa",
  "fanta",
];

const includesAny = (haystack, needles) => {
  const text = (haystack || "").toLowerCase();
  return needles.some((needle) => text.includes(needle));
};

/** Normaliza texto para comparar categorías/nombres sin acentos. */
const normalizeTextKey = (s) =>
  String(s ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const isTruthyPromoFlag = (value) => {
  if (value === true || value === 1) return true;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    return v === "1" || v === "true" || v === "yes" || v === "si" || v === "sí";
  }
  return false;
};

/** Categoría fija de combos ya armados en el catálogo OA!. */
const isPromocionesCategory = (raw) => {
  const nombre = normalizeTextKey(raw.categoria_nombre ?? raw.category_name);
  const slug = normalizeTextKey(raw.categoria_slug ?? raw.category_slug ?? raw.slug_categoria);
  return (
    nombre === "promociones" ||
    nombre === "promocion" ||
    slug === "promociones" ||
    slug === "promocion"
  );
};

/** Producto compuesto con ítems hijos (combo del backend). */
const hasPrebuiltComponents = (raw) => {
  const list = raw.productos_componentes ?? raw.componentes ?? raw.items_componentes;
  return Array.isArray(list) && list.length > 0;
};

/**
 * Nombres típicos de packs: "Combo Fernet + Coca", "Fernet + Coca", etc.
 * Evita que aparezcan al buscar solo "Fernet".
 */
const looksLikePrebuiltComboName = (nombre) => {
  const n = normalizeTextKey(nombre);
  if (!n) return false;
  if (/^combo\b/.test(n)) return true;
  if (n.includes("combo") && n.includes("+")) return true;
  if (n.includes("+")) {
    const hasBase = includesAny(n, BASE_KEYWORDS);
    const hasMixer = includesAny(n, MIXER_KEYWORDS);
    if (hasBase && hasMixer) return true;
  }
  return false;
};

/**
 * Excluye promos/combos ya armados: solo productos unitarios elegibles en el wizard.
 */
export const isPrebuiltPromoOrCombo = (raw) => {
  if (!raw || typeof raw !== "object") return true;

  const tipo = String(raw.tipo_producto ?? raw.tipoProducto ?? "")
    .trim()
    .toUpperCase();
  if (tipo === TIPO_PRODUCTO.PROMOCION) return true;

  if (isTruthyPromoFlag(raw.is_promo ?? raw.isPromo ?? raw.es_promo ?? raw.esPromo)) {
    return true;
  }

  if (isPromocionesCategory(raw)) return true;
  if (hasPrebuiltComponents(raw)) return true;
  if (looksLikePrebuiltComboName(raw.nombre ?? raw.name)) return true;

  return false;
};

export const mapSelectableProduct = (raw) => {
  if (isPrebuiltPromoOrCombo(raw)) return null;
  return {
    id: raw.id,
    nombre: raw.nombre ?? raw.name ?? "Producto",
    slug: raw.slug ?? String(raw.id),
    precio: Number(raw.precio ?? raw.price ?? 0) || 0,
    imagen_url: raw.imagen_url ?? raw.image_url ?? null,
    categoria_nombre: raw.categoria_nombre ?? raw.category_name ?? null,
    categoria_id: raw.categoria_id ?? raw.category_id ?? null,
  };
};

export const classifyProducts = (products) => {
  const bases = [];
  const mixers = [];
  const extras = [];
  for (const p of products) {
    const blob = `${p.nombre ?? ""} ${p.categoria_nombre ?? ""}`;
    if (includesAny(blob, BASE_KEYWORDS)) bases.push(p);
    else if (includesAny(blob, MIXER_KEYWORDS)) mixers.push(p);
    else extras.push(p);
  }
  return { bases, mixers, extras };
};

export const filterByText = (list, query) => {
  const q = (query || "").trim().toLowerCase();
  if (!q) return list;
  return list.filter((p) => {
    const haystack = `${p.nombre ?? ""} ${p.categoria_nombre ?? ""}`.toLowerCase();
    return haystack.includes(q);
  });
};

/** Paginación local: 5 ítems por página. */
export function paginateList(items, page) {
  const total = items.length;
  const totalPages = total === 0 ? 1 : Math.ceil(total / PRODUCTS_PER_PAGE);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * PRODUCTS_PER_PAGE;
  return {
    pageItems: items.slice(start, start + PRODUCTS_PER_PAGE),
    totalPages,
    page: safePage,
    showPagination: total > PRODUCTS_PER_PAGE,
  };
}
