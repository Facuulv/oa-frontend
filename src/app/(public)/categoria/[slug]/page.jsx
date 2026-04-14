"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useCatalogStore, selectProductsForCategory, selectProductsLoading, selectProductsError } from "@/store/useCatalogStore";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import ProductListItemCard from "@/components/catalog/ProductListItemCard";
import ProductCardSkeleton from "@/components/skeletons/ProductCardSkeleton";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function CategoryPage() {
  const { slug } = useParams();
  const categoryId = slug === "all" ? null : slug;
  const fetchProducts = useCatalogStore((s) => s.fetchProductsByCategory);
  const products = useCatalogStore((s) => selectProductsForCategory(s, categoryId));
  const isLoading = useCatalogStore((s) => selectProductsLoading(s, categoryId));
  const error = useCatalogStore((s) => selectProductsError(s, categoryId));
  const showSkeleton = useDelayedLoading(isLoading);

  useEffect(() => {
    fetchProducts(categoryId);
  }, [fetchProducts, categoryId]);

  if (showSkeleton) return <ProductCardSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <AlertCircle size={40} className="mb-3 text-red-400" />
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
    <div className="px-4 py-4">
      <h1 className="mb-4 text-lg font-bold text-gray-800">
        {slug === "all" ? "Todos los productos" : `Categoría`}
      </h1>

      {products.length > 0 ? (
        <div className="space-y-3">
          {products.map((p) => (
            <ProductListItemCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-sm text-gray-400">
          No hay productos en esta categoría
        </p>
      )}
    </div>
  );
}
