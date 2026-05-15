"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  useCatalogStore,
  selectCategories,
  selectProductsForCategory,
  selectProductsLoading,
  selectProductsError,
} from "@/store/useCatalogStore";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import ProductListItemCard from "@/components/catalog/ProductListItemCard";
import ProductCardSkeleton from "@/components/skeletons/ProductCardSkeleton";
import { AlertCircle, RotateCcw } from "lucide-react";

function CatalogContent() {
  const searchParams = useSearchParams();
  const categoriaIdParam = searchParams.get("categoriaId");
  const categoryId =
    categoriaIdParam != null && String(categoriaIdParam).trim() !== ""
      ? String(categoriaIdParam).trim()
      : null;

  const fetchCategories = useCatalogStore((s) => s.fetchCategories);
  const fetchProducts = useCatalogStore((s) => s.fetchProductsByCategory);
  const categories = useCatalogStore(selectCategories);
  const products = useCatalogStore((s) => selectProductsForCategory(s, categoryId));
  const isLoading = useCatalogStore((s) => selectProductsLoading(s, categoryId));
  const error = useCatalogStore((s) => selectProductsError(s, categoryId));
  const showSkeleton = useDelayedLoading(isLoading);

  const title = useMemo(() => {
    if (!categoryId) return "Todos los productos";
    const cat = categories.find((c) => String(c.id) === String(categoryId));
    return cat?.nombre ? cat.nombre : "Productos";
  }, [categories, categoryId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts(categoryId);
  }, [fetchProducts, categoryId]);

  if (showSkeleton) return <ProductCardSkeleton />;

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center bg-[#FFF1F2] px-6 py-16 text-center">
        <AlertCircle size={40} className="bg-zinc-50" />
        <p className="mb-4 text-sm text-gray-600">{error}</p>
        <button
          type="button"
          onClick={() => fetchProducts(categoryId, { force: true })}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white"
        >
          <RotateCcw size={14} />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF1F2] px-4 py-4">
      <h1 className="mb-4 text-lg font-bold text-neutral-900">{title}</h1>

      {products.length > 0 ? (
        <div className="space-y-3">
          {products.map((p) => (
            <ProductListItemCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-sm text-gray-500">No hay productos en esta categoría</p>
      )}
    </div>
  );
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={<ProductCardSkeleton />}>
      <CatalogContent />
    </Suspense>
  );
}
