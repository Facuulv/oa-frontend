import { PUBLIC_CONTENT_MIN_HEIGHT_CLASS } from "@/constants/layout";

export default function HomeSkeleton() {
  return (
    <div className={`${PUBLIC_CONTENT_MIN_HEIGHT_CLASS} animate-pulse space-y-4 bg-[#FFF1F2] p-4 pb-16`}>
      <div className="h-48 rounded-2xl bg-white/60" />
      <div className="mb-6 space-y-3">
        <div className="h-[5.5rem] rounded-2xl bg-[#C1121F]/25" />
        <div className="h-[5.5rem] rounded-2xl border-2 border-[#C1121F]/30 bg-white/80" />
      </div>
      <div className="h-5 w-32 rounded bg-white/70" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-white/70" />
        ))}
      </div>
    </div>
  );
}
