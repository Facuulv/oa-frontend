"use client";

import { useCallback, useEffect, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { PLACEHOLDER_CATEGORY } from "@/constants/images";
import { getOptimizedImageUrl } from "@/lib/imageUtils";

export default function HeroSlider({ images = [] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const autoplayRef = useRef(null);

  const startAutoplay = useCallback(() => {
    if (!emblaApi) return;
    autoplayRef.current = setInterval(() => emblaApi.scrollNext(), 4000);
  }, [emblaApi]);

  const stopAutoplay = useCallback(() => {
    clearInterval(autoplayRef.current);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    startAutoplay();
    emblaApi.on("pointerDown", stopAutoplay);
    emblaApi.on("pointerUp", () => {
      stopAutoplay();
      setTimeout(startAutoplay, 2000);
    });
    return () => stopAutoplay();
  }, [emblaApi, startAutoplay, stopAutoplay]);

  if (images.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
        <span className="text-lg font-bold text-primary">OA!</span>
      </div>
    );
  }

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {images.map((img, i) => {
          const raw = typeof img === "string" ? img : (img?.imagen_url ?? img?.url ?? "");
          const path = typeof raw === "string" ? raw.trim() : "";
          const slideSrc = path
            ? getOptimizedImageUrl(path, { preset: "hero" }) || path
            : PLACEHOLDER_CATEGORY;
          const alt =
            typeof img === "object" && img?.alt != null ? img.alt : `Slide ${i + 1}`;
          return (
            <div key={i} className="min-w-0 flex-[0_0_100%]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slideSrc}
                alt={alt}
                className="h-40 w-full rounded-b-2xl object-cover object-center"
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
