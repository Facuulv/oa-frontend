"use client";

import { useEffect } from "react";
import { useCatalogStore, selectCategories, selectCategoriesLoading } from "@/store/useCatalogStore";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import HeroSlider from "@/components/catalog/HeroSlider";
import CategoryCard from "@/components/catalog/CategoryCard";
import HomeSkeleton from "@/components/skeletons/HomeSkeleton";

export default function HomePage() {
  const fetchCategories = useCatalogStore((s) => s.fetchCategories);
  const categories = useCatalogStore(selectCategories);
  const isLoading = useCatalogStore(selectCategoriesLoading);
  const showSkeleton = useDelayedLoading(isLoading);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (showSkeleton) return <HomeSkeleton />;

  return (
    <div className="pb-16">
      <HeroSlider images={[]} />

      <section className="px-4 pt-5">
        <h2 className="mb-3 text-lg font-bold text-gray-800">Categorías</h2>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat, i) => (
            <CategoryCard key={cat.id} category={cat} index={i} />
          ))}
        </div>

        {categories.length === 0 && !isLoading && (
          <p className="py-8 text-center text-sm text-gray-400">
            No hay categorías disponibles
          </p>
        )}
      </section>
    </div>
  );
}
