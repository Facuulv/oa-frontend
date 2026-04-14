export default function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-60 rounded-xl bg-gray-200" />
      <div className="h-6 w-3/4 rounded bg-gray-200" />
      <div className="h-4 w-1/3 rounded bg-gray-200" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-gray-200" />
        <div className="h-3 w-5/6 rounded bg-gray-200" />
      </div>
      <div className="mt-4 h-10 rounded-lg bg-gray-200" />
    </div>
  );
}
