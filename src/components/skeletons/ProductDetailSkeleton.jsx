import ProductDetailShell from "@/components/product/ProductDetailShell";
import {
  COMBO_ACTION_BAR_SURFACE_CLASS,
  PRODUCT_DETAIL_GRID_CLASS,
  PRODUCT_DETAIL_IMAGE_CARD_CLASS,
  PRODUCT_DETAIL_IMAGE_MOBILE_CLASS,
  PRODUCT_DETAIL_MOBILE_BAR_CLASS,
  PRODUCT_DETAIL_SKELETON_PULSE_CLASS,
  PRODUCT_DETAIL_SURFACE_CARD_CLASS,
} from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

function Pulse({ className }) {
  return (
    <div
      className={cn("rounded-lg bg-zinc-200/80", PRODUCT_DETAIL_SKELETON_PULSE_CLASS, className)}
      aria-hidden
    />
  );
}

export default function ProductDetailSkeleton() {
  const mobileHero = (
    <div className={cn(PRODUCT_DETAIL_IMAGE_MOBILE_CLASS, PRODUCT_DETAIL_SKELETON_PULSE_CLASS)}>
      <div className="h-full w-full rounded-b-2xl bg-zinc-200/80" />
    </div>
  );

  return (
    <ProductDetailShell hero={mobileHero} ariaLabel="Cargando producto">
      <div className="mb-4 hidden lg:block">
        <Pulse className="mb-3 h-11 w-11 rounded-xl" />
        <Pulse className="h-7 w-2/3 max-w-xs" />
        <Pulse className="mt-2 h-4 w-1/3 max-w-[8rem]" />
      </div>

      <div className={PRODUCT_DETAIL_GRID_CLASS}>
        <div className={cn(PRODUCT_DETAIL_IMAGE_CARD_CLASS, "bg-zinc-200/60")} aria-hidden />

        <div className="space-y-5">
          <div className="space-y-2 lg:hidden">
            <Pulse className="h-5 w-20 rounded-full" />
            <Pulse className="h-7 w-4/5 max-w-sm" />
            <Pulse className="h-8 w-28" />
          </div>

          <div className={cn(PRODUCT_DETAIL_SURFACE_CARD_CLASS, "space-y-2")}>
            <Pulse className="h-4 w-24" />
            <Pulse className="h-3 w-full" />
            <Pulse className="h-3 w-5/6" />
          </div>

          <div className={cn(PRODUCT_DETAIL_SURFACE_CARD_CLASS, "space-y-2")}>
            <Pulse className="h-4 w-28" />
            <Pulse className="h-24 w-full rounded-xl" />
          </div>

          <div className="hidden lg:block">
            <div className={cn(COMBO_ACTION_BAR_SURFACE_CLASS, "space-y-4 p-5")}>
              <Pulse className="h-4 w-16" />
              <Pulse className="h-9 w-32" />
              <Pulse className="mt-4 h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      <footer className={PRODUCT_DETAIL_MOBILE_BAR_CLASS} aria-hidden>
        <div className={cn(COMBO_ACTION_BAR_SURFACE_CLASS, "flex gap-3 p-4")}>
          <Pulse className="h-10 w-28 rounded-full" />
          <Pulse className="h-12 min-w-0 flex-1 rounded-xl" />
        </div>
      </footer>
    </ProductDetailShell>
  );
}
