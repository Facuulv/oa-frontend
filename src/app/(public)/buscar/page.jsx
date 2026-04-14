"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCatalogStore, selectProductsForCategory, selectProductsLoading } from "@/store/useCatalogStore";
import { searchProducts } from "@/services/catalogService";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import ProductListItemCard from "@/components/catalog/ProductListItemCard";
import ProductCardSkeleton from "@/components/skeletons/ProductCardSkeleton";
import { Search } from "lucide-react";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const fetchProducts = useCatalogStore((s) => s.fetchProductsByCategory);
  const allProducts = useCatalogStore((s) => selectProductsForCategory(s, null));
  const isLoading = useCatalogStore((s) => selectProductsLoading(s, null));
  const showSkeleton = useDelayedLoading(isLoading);

  useEffect(() => {
    fetchProducts(null);
  }, [fetchProducts]);

  const results = searchProducts(query, allProducts);

  if (showSkeleton) return <ProductCardSkeleton />;

  return (
    <div className="px-4 py-4">
      <div className="mb-4 flex items-center gap-2">
        <Search size={18} className="text-gray-400" />
        <h1 className="text-base font-semibold text-gray-700">
          {query ? `Resultados para "${query}"` : "Buscar productos"}
        </h1>
      </div>

      {results.length > 0 ? (
        <div className="space-y-3">
          {results.map((p) => (
            <ProductListItemCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-sm text-gray-400">
          {query ? "No se encontraron productos" : "Escribí algo para buscar"}
        </p>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<ProductCardSkeleton />}>
      <SearchResults />
    </Suspense>
  );
}
