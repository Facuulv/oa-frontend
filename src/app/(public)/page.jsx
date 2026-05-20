"use client";



import { useEffect, useMemo } from "react";

import { useCatalogStore, selectCategories, selectCategoriesLoading } from "@/store/useCatalogStore";

import { useDelayedLoading } from "@/hooks/useDelayedLoading";

import FeaturedPromoCarousel from "@/components/catalog/FeaturedPromoCarousel";

import HomeFeaturedCards from "@/components/catalog/HomeFeaturedCards";

import CategoryCard from "@/components/catalog/CategoryCard";

import HomeSkeleton from "@/components/skeletons/HomeSkeleton";

import HomeSectionHeader from "@/components/home/HomeSectionHeader";

import { isPromocionesCategory } from "@/utils/admin/findCategoriaPromocionesId";

import {

  HOME_CATEGORY_GRID_CLASS,

  HOME_CONTENT_CLASS,

  HOME_PAGE_CLASS,

  HOME_SECTION_CLASS,

} from "@/constants/homeTheme";



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

    <div className={HOME_PAGE_CLASS}>

      <div className={HOME_CONTENT_CLASS}>

        <FeaturedPromoCarousel />



        <section className={HOME_SECTION_CLASS} aria-label="Accesos y categorías">

          <HomeFeaturedCards />



          <HomeSectionHeader

            title="Categorías"

            subtitle="Explorá las bebidas por tipo"

          />



          <div className={HOME_CATEGORY_GRID_CLASS}>

            {homeCategories.map((cat, i) => (

              <CategoryCard key={cat.id} category={cat} index={i} />

            ))}

          </div>



          {homeCategories.length === 0 && !isLoading && (

            <p className="py-8 text-center text-sm text-zinc-500">

              No hay categorías disponibles

            </p>

          )}

        </section>

      </div>

    </div>

  );

}

