export default function HomeSkeleton() {
  return (
    <div className="min-h-[calc(100dvh-3.25rem)] animate-pulse space-y-4 bg-[#FFF1F2] p-4 pb-16">
      <div className="h-48 rounded-2xl bg-white/60" />
      <div className="h-5 w-32 rounded bg-white/70" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-white/70" />
        ))}
      </div>
    </div>
  );
}
