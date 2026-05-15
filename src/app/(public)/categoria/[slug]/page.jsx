import { getCategories, getProductsByCategory } from "@/services/catalogService";
import { mapCategory, mapProduct } from "@/lib/mappers/catalogMapper";
import ProductListItemCard from "@/components/catalog/ProductListItemCard";
import { AlertCircle } from "lucide-react";

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

function normalizePlural(slugNorm = "") {
  // tolera "vino" vs "vinos" (solo para casos simples)
  return slugNorm.endsWith("s") ? slugNorm.slice(0, -1) : slugNorm;
}

export default async function CategoryPage({ params }) {
  const awaitedParams = await params;
  const rawSlug = awaitedParams?.slug;
  const slugStr = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug != null ? String(rawSlug) : "";
  const slugNorm = toSlug(slugStr);

  const rawCategories = await getCategories();
  const categories = (Array.isArray(rawCategories) ? rawCategories : []).map(mapCategory).filter(Boolean);

  const slugNormNoPlural = normalizePlural(slugNorm);

  const slugLower = String(slugStr || "").toLowerCase();
  const slugLowerNoS = slugLower.replace("s", "");

  const categoriaEncontrada =
    categories.find(
      (cat) =>
        (cat.slug?.toLowerCase?.() === slugLower) ||
        (cat.nombre?.toLowerCase?.().includes?.(slugLowerNoS))
    ) ?? null;

  const match =
    categoriaEncontrada ??
    categories.find((c) => toSlug(c.slug ?? "") === slugNorm) ??
    categories.find((c) => toSlug(c.nombre ?? "") === slugNorm) ??
    categories.find((c) => {
      const catSlug = toSlug(c.slug ?? "");
      const catName = toSlug(c.nombre ?? "");
      const catSlugNoPlural = normalizePlural(catSlug);
      const catNameNoPlural = normalizePlural(catName);
      return (
        (catSlug && (catSlug.includes(slugNorm) || slugNorm.includes(catSlug))) ||
        (catName && (catName.includes(slugNorm) || slugNorm.includes(catName))) ||
        (catSlugNoPlural && (catSlugNoPlural.includes(slugNormNoPlural) || slugNormNoPlural.includes(catSlugNoPlural))) ||
        (catNameNoPlural && (catNameNoPlural.includes(slugNormNoPlural) || slugNormNoPlural.includes(catNameNoPlural)))
      );
    }) ??
    null;

  const categoriaId = match?.id ?? null;
  const categoriaNombre = slugStr === "all" ? "Todos los productos" : match?.nombre ?? "Categoría";

  let productos = [];
  let error = null;

  try {
    if (slugStr === "all") {
      productos = (await getProductsByCategory({})).map(mapProduct).filter(Boolean);
    } else if (categoriaId != null) {
      // Petición limpia: SOLO categoria_id (sin destacado=1).
      productos = (await getProductsByCategory({ categoria_id: categoriaId })).map(mapProduct).filter(Boolean);
    }
  } catch (e) {
    error = e?.response?.data?.message || e?.message || "Error al cargar productos";
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <AlertCircle size={40} className="bg-zinc-50" />
        <p className="mb-4 text-sm text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-50 px-4 py-4">
      <h1 className="mb-4 text-lg font-bold text-neutral-900">{categoriaNombre}</h1>

      {slugStr !== "all" && categoriaId == null ? (
        <p className="py-6 text-center text-sm text-gray-500">No se encontró la categoría</p>
      ) : null}

      {productos.length > 0 ? (
        <div className="space-y-3">
          {productos.map((p) => (
            <ProductListItemCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-sm text-gray-400">No hay productos en esta categoría</p>
      )}
    </div>
  );
}
