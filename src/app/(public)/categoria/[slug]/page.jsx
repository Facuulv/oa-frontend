import Link from "next/link";
import { getCategories, getProductsByCategory } from "@/services/catalogService";
import { mapCategory, mapProduct } from "@/lib/mappers/catalogMapper";
import PromoCard from "@/components/catalog/PromoCard";
import PublicPageHeader from "@/components/public/PublicPageHeader";
import {
  PROMO_CONTENT_CLASS,
  PROMO_LIST_GRID_CLASS,
  PROMO_PAGE_CLASS,
  PROMO_SECTION_CLASS,
  PROMO_STATUS_CARD_CLASS,
} from "@/constants/homeTheme";
import { cn } from "@/lib/cn";
import { AlertCircle, FolderOpen, Package } from "lucide-react";

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

function buildCategorySubtitle(slugStr, productCount, categoryNotFound) {
  if (categoryNotFound) return undefined;
  if (slugStr === "all") return "Catálogo completo";
  if (productCount > 0) {
    return productCount === 1 ? "1 producto" : `${productCount} productos`;
  }
  return "Sin productos por ahora";
}

function CategoryShell({ title, subtitle, ariaLabel, children }) {
  return (
    <div className={PROMO_PAGE_CLASS}>
      <div className={PROMO_CONTENT_CLASS}>
        <section className={PROMO_SECTION_CLASS} aria-label={ariaLabel ?? title}>
          <PublicPageHeader title={title} subtitle={subtitle} className="mb-4 md:mb-5" />
          {children}
        </section>
      </div>
    </div>
  );
}

function CategoryEmptyState() {
  return (
    <div className={PROMO_STATUS_CARD_CLASS}>
      <span
        className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"
        aria-hidden
      >
        <Package size={22} strokeWidth={2.25} />
      </span>
      <h2 className="text-base font-bold tracking-tight text-foreground md:text-lg">
        No hay productos en esta categoría
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-snug text-zinc-500">
        Volvé a revisar más tarde o explorá otras categorías.
      </p>
      <div className="mt-5 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
        <Link
          href="/"
          className={cn(
            "inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white",
            "motion-safe:transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          )}
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}

function CategoryNotFoundState() {
  return (
    <div className={PROMO_STATUS_CARD_CLASS}>
      <span
        className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"
        aria-hidden
      >
        <FolderOpen size={22} strokeWidth={2.25} />
      </span>
      <h2 className="text-base font-bold tracking-tight text-foreground md:text-lg">
        No se encontró la categoría
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-snug text-zinc-500">
        Revisá el enlace o volvé al inicio para elegir otra categoría.
      </p>
      <div className="mt-5 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
        <Link
          href="/"
          className={cn(
            "inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white",
            "motion-safe:transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          )}
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}

function CategoryErrorState({ message }) {
  return (
    <CategoryShell title="Categoría" ariaLabel="Error al cargar categoría">
      <div className={PROMO_STATUS_CARD_CLASS} role="alert">
        <AlertCircle size={40} className="mx-auto mb-3 text-red-400" aria-hidden />
        <h2 className="text-base font-bold text-foreground">No pudimos cargar los productos</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">{message}</p>
        <Link
          href="/"
          className={cn(
            "mx-auto mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white",
            "motion-safe:transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          )}
        >
          Ir al inicio
        </Link>
      </div>
    </CategoryShell>
  );
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
  const categoryNotFound = slugStr !== "all" && categoriaId == null;

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
    return <CategoryErrorState message={error} />;
  }

  const subtitle = buildCategorySubtitle(slugStr, productos.length, categoryNotFound);

  return (
    <CategoryShell title={categoriaNombre} subtitle={subtitle} ariaLabel={categoriaNombre}>
      {categoryNotFound ? (
        <CategoryNotFoundState />
      ) : productos.length > 0 ? (
        <div className={PROMO_LIST_GRID_CLASS}>
          {productos.map((p) => (
            <PromoCard key={p.id} product={p} badgeLabel={null} />
          ))}
        </div>
      ) : (
        <CategoryEmptyState />
      )}
    </CategoryShell>
  );
}
