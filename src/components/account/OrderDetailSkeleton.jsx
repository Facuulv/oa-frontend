import { ACCOUNT_CARD_CLASS, CHECKOUT_LAYOUT_CLASS } from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

const ORDER_DETAIL_SIDEBAR_CLASS = cn(
  "hidden shrink-0 lg:flex lg:flex-col lg:gap-4",
  "lg:sticky lg:top-[calc(var(--app-header-total-height)+1rem)] lg:self-start lg:w-full",
);

function SkeletonCard({ className }) {
  return (
    <div className={cn(ACCOUNT_CARD_CLASS, "animate-pulse p-4 md:p-5", className)} aria-hidden>
      <div className="mb-3 flex justify-between gap-2">
        <div className="h-5 w-28 rounded bg-zinc-200" />
        <div className="h-6 w-24 rounded-full bg-zinc-200" />
      </div>
      <div className="h-3 w-40 rounded bg-zinc-100" />
    </div>
  );
}

export default function OrderDetailSkeleton() {
  return (
    <div className={CHECKOUT_LAYOUT_CLASS} aria-busy="true" aria-label="Cargando pedido">
      <div className="flex min-w-0 flex-col gap-4">
        <SkeletonCard />
        <SkeletonCard className="min-h-[10rem]" />
        <div className="flex flex-col gap-4 lg:hidden">
          <SkeletonCard className="min-h-[6rem]" />
          <div className="h-12 rounded-xl bg-zinc-200" />
        </div>
      </div>
      <aside className={ORDER_DETAIL_SIDEBAR_CLASS}>
        <SkeletonCard className="min-h-[6rem]" />
        <div className="h-12 rounded-xl bg-zinc-200" />
      </aside>
    </div>
  );
}
