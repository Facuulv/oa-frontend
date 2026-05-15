"use client";

import { useEffect, useMemo } from "react";
import { useCatalogStore, selectCategories, selectCategoriesLoading } from "@/store/useCatalogStore";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import FeaturedPromoCarousel from "@/components/catalog/FeaturedPromoCarousel";
import HomeFeaturedCards from "@/components/catalog/HomeFeaturedCards";
import CategoryCard from "@/components/catalog/CategoryCard";
import HomeSkeleton from "@/components/skeletons/HomeSkeleton";
import { isPromocionesCategory } from "@/utils/admin/findCategoriaPromocionesId";

export default function HomePage() {
  const fetchCategories = useCatalogStore((s) => s.fetchCategories);
  const categories = useCatalogStore(selectCategories);
  const isLoading = useCatalogStore(selectCategoriesLoading);
  const showSkeleton = useDelayedLoading(isLoading);

  /** Grilla del inicio: sin Promociones (ya está la tarjeta destacada arriba). */
  const homeCategories = useMemo(
    () => categories.filter((cat) => !isPromocionesCategory(cat)),
    [categories]
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (showSkeleton) return <HomeSkeleton />;

  return (
    <div className="min-h-[calc(100dvh-3.25rem)] bg-[#FFF1F2] pb-16">
      <FeaturedPromoCarousel />

      <section className="px-4 pt-6">
        <HomeFeaturedCards />

        <h2 className="mb-3 text-lg font-bold text-zinc-900">Categorías</h2>
        <div className="grid grid-cols-2 gap-3">
          {homeCategories.map((cat, i) => (
            <CategoryCard key={cat.id} category={cat} index={i} />
          ))}
        </div>

        {homeCategories.length === 0 && !isLoading && (
          <p className="py-8 text-center text-sm text-gray-400">
            No hay categorías disponibles
          </p>
        )}
      </section>
    </div>
  );
}
