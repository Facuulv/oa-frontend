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

export function mapCategory(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = raw.id ?? raw.categoria_id;
  const nombre = raw.nombre ?? raw.name ?? "";
  return {
    id,
    nombre,
    slug: raw.slug ?? (toSlug(nombre) || String(id)),
    descripcion: raw.descripcion ?? raw.description ?? null,
    imagen_url: raw.imagen_url ?? raw.image_url ?? null,
    orden: raw.orden ?? raw.sort_order ?? 0,
  };
}

export function mapProduct(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = raw.id;
  const nombre = raw.nombre ?? raw.name ?? "";
  const disponible =
    raw.disponible ??
    (typeof raw.available === "boolean" ? raw.available : raw.available == null ? true : Number(raw.available) === 1);
  return {
    id,
    nombre,
    slug: raw.slug ?? String(id),
    precio: Number(raw.precio ?? raw.price) || 0,
    imagen_url: raw.imagen_url ?? raw.image_url ?? null,
    descripcion: raw.descripcion ?? raw.description ?? null,
    categoria_id: raw.categoria_id ?? raw.category_id ?? null,
    categoria_nombre: raw.categoria_nombre ?? raw.category_name ?? null,
    disponible,
  };
}

export function mapProductDetail(raw, extras = []) {
  if (!raw || typeof raw !== "object") return null;
  const base = mapProduct(raw);
  if (!base) return null;
  return {
    ...base,
    extras: Array.isArray(extras) ? extras : [],
  };
}

export function mapExtra(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    id: raw.id,
    nombre: raw.nombre ?? "",
    precio: Number(raw.precio_extra ?? raw.precio) || 0,
  };
}

