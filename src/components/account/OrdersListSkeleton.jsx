export default function OrdersListSkeleton({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-zinc-100 bg-white p-4 shadow-sm"
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
