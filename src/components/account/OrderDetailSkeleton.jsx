export default function OrderDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex justify-between">
          <div className="h-5 w-28 rounded bg-zinc-200" />
          <div className="h-6 w-24 rounded-full bg-zinc-200" />
        </div>
        <div className="h-3 w-40 rounded bg-zinc-100" />
      </div>
      <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
        <div className="mb-3 h-4 w-24 rounded bg-zinc-200" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between gap-2">
              <div className="h-4 flex-1 rounded bg-zinc-100" />
              <div className="h-4 w-16 rounded bg-zinc-200" />
            </div>
          ))}
        </div>
      </div>
      <div className="h-24 rounded-xl bg-zinc-200" />
    </div>
  );
}
