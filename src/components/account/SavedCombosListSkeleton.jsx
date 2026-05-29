import { ACCOUNT_CARD_CLASS } from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

export default function SavedCombosListSkeleton({ count = 2 }) {
  return (
    <div className="space-y-4">
      <div
        className={cn(
          ACCOUNT_CARD_CLASS,
          "animate-pulse rounded-2xl bg-zinc-900/90 p-4 md:rounded-3xl md:p-5",
        )}
        aria-hidden
      >
        <div className="h-3 w-20 rounded bg-white/20" />
        <div className="mt-2 h-4 w-40 rounded bg-white/15" />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={cn(ACCOUNT_CARD_CLASS, "animate-pulse p-4")} aria-hidden>
            <div className="h-4 w-3/4 rounded bg-zinc-200" />
            <div className="mt-2 h-3 w-full rounded bg-zinc-100" />
            <div className="mt-3 h-5 w-20 rounded bg-zinc-200" />
            <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3">
              <div className="h-4 w-24 rounded bg-zinc-100" />
              <div className="h-10 w-10 rounded-xl bg-zinc-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
