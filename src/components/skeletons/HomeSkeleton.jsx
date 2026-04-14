export default function HomeSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-40 rounded-xl bg-gray-200" />
      <div className="h-5 w-32 rounded bg-gray-200" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-gray-200" />
        ))}
      </div>
    </div>
  );
}
