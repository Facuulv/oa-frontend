"use client";

import { AlertCircle, RotateCcw, Tag } from "lucide-react";
import { useEffect } from "react";
import {
  useCatalogStore,
  selectPromotions,
  selectPromotionsLoading,
  selectPromotionsError,
} from "@/store/useCatalogStore";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import ProductListItemCard from "@/components/catalog/ProductListItemCard";
import ProductCardSkeleton from "@/components/skeletons/ProductCardSkeleton";

export default function PromocionesPage() {
  const fetchPromotions = useCatalogStore((s) => s.fetchPromotions);
  const promotions = useCatalogStore(selectPromotions);
  const isLoading = useCatalogStore(selectPromotionsLoading);
  const error = useCatalogStore(selectPromotionsError);
  const showSkeleton = useDelayedLoading(isLoading);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  if (showSkeleton) return <ProductCardSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <AlertCircle size={40} className="mb-3 text-red-400" />
        <p className="mb-4 text-sm text-gray-600">{error}</p>
        <button
          type="button"
          onClick={() => fetchPromotions({ force: true })}
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
      <div className="mb-4 flex items-center gap-2">
        <Tag size={20} className="text-primary" />
        <h1 className="text-lg font-bold text-gray-800">Promociones</h1>
      </div>

      {promotions.length > 0 ? (
        <div className="space-y-3">
          {promotions.map((p) => (
            <ProductListItemCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-sm text-gray-400">No hay promociones por el momento</p>
      )}
    </div>
  );
}
