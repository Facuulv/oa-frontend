import {
  PROMO_CARD_SHELL_CLASS,
  PROMO_LIST_GRID_CLASS,
} from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

const SKELETON_COUNT = 6;

const pulseClass = "animate-pulse motion-reduce:animate-none";

function PromoCardSkeleton() {
  return (
    <div className={PROMO_CARD_SHELL_CLASS}>
      <div
        className={cn(
          "h-[5.25rem] w-[5.25rem] shrink-0 rounded-xl bg-zinc-100/90 md:h-40 md:w-full md:rounded-none md:rounded-t-2xl lg:h-44",
          pulseClass,
        )}
      />
      <div className="flex min-h-0 flex-1 flex-col justify-between gap-2 py-0.5 md:gap-2.5 md:p-3 md:py-3">
        <div className="space-y-2 md:space-y-1.5">
          <div className={cn("h-4 w-[4.5rem] rounded-full bg-zinc-100/80", pulseClass)} />
          <div className={cn("h-4 w-full rounded-md bg-zinc-100/80", pulseClass)} />
          <div className={cn("h-3 w-[88%] rounded-md bg-zinc-100/70 md:w-3/4", pulseClass)} />
        </div>
        <div className="flex items-center justify-between gap-2.5 pt-0.5">
          <div className={cn("h-5 w-20 rounded-md bg-zinc-100/80", pulseClass)} />
          <div className={cn("h-7 w-7 shrink-0 rounded-full bg-zinc-100/80 md:h-8 md:w-8", pulseClass)} />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton del listado /promociones (grilla + cards alineadas a PromoCard).
 */
export default function PromocionesSkeleton() {
  return (
    <div className={PROMO_LIST_GRID_CLASS} aria-hidden="true">
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <PromoCardSkeleton key={i} />
      ))}
    </div>
  );
}
