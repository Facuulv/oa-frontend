"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import HomeSectionHeader from "@/components/home/HomeSectionHeader";
import { cn } from "@/lib/cn";

/**
 * Encabezado de página pública: volver + título/subtítulo al estilo Home.
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {string} [props.className]
 * @param {() => void} [props.onBack] — por defecto `router.back()`
 */
export default function PublicPageHeader({ title, subtitle, className, onBack }) {
  const router = useRouter();
  const handleBack = onBack ?? (() => router.back());

  return (
    <div className={cn(className)}>
      <div className="mb-3 md:mb-4">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Volver"
          className="-ml-1 inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-zinc-700 transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <ArrowLeft size={20} strokeWidth={2.25} aria-hidden />
        </button>
      </div>
      <HomeSectionHeader title={title} subtitle={subtitle} />
    </div>
  );
}
