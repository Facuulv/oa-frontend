export default function ProductCardSkeleton({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
          <div className="h-20 w-20 shrink-0 rounded-lg bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-3 w-1/2 rounded bg-gray-200" />
            <div className="h-4 w-16 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
