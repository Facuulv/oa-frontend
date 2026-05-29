import { ACCOUNT_CARD_CLASS } from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

export default function OrdersListSkeleton({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(ACCOUNT_CARD_CLASS, "animate-pulse p-4")}
          aria-hidden
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="h-4 w-24 rounded bg-zinc-200" />
            <div className="h-5 w-20 rounded-full bg-zinc-200" />
          </div>
          <div className="mb-2 h-3 w-32 rounded bg-zinc-100" />
          <div className="h-5 w-20 rounded bg-zinc-200" />
        </div>
      ))}
    </div>
  );
}
