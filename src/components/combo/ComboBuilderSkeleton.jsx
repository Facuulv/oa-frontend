"use client";

import {
  COMBO_ACTION_BAR_MOBILE_CLASS,
  COMBO_ACTION_BAR_SURFACE_CLASS,
  COMBO_CONTENT_CLASS,
  COMBO_PAGE_CLASS,
  COMBO_PRODUCT_ROW_CLASS,
  COMBO_SCROLL_AREA_CLASS,
  COMBO_SKELETON_PULSE_CLASS,
  COMBO_SUMMARY_PANEL_CLASS,
  COMBO_WIZARD_CHROME_CLASS,
  COMBO_WIZARD_LAYOUT_CLASS,
  COMBO_WIZARD_MAIN_CLASS,
} from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

const pulse = COMBO_SKELETON_PULSE_CLASS;

function Block({ className }) {
  return <div className={cn(pulse, "rounded-lg bg-zinc-100/90", className)} aria-hidden />;
}

function ChromeSkeleton() {
  return (
    <div className={COMBO_WIZARD_CHROME_CLASS}>
      <Block className="mb-3 h-10 w-10 rounded-xl" />
      <Block className="h-6 w-48 max-w-full rounded-md" />
      <Block className="mt-2 h-4 w-64 max-w-full rounded-md" />
      <div className="mt-4 flex items-center justify-between gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <Block className="h-7 w-7 rounded-full" />
            <Block className="h-3 w-10 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function StepContentSkeleton({ rowCount = 4 }) {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="space-y-2">
        <Block className="h-6 w-40 rounded-md" />
        <Block className="h-4 w-56 max-w-full rounded-md" />
      </div>
      <Block className="h-11 w-full rounded-xl" />
      <div className="space-y-3">
        {Array.from({ length: rowCount }).map((_, i) => (
          <div
            key={i}
            className={cn(COMBO_PRODUCT_ROW_CLASS, "flex items-center gap-3 border-zinc-100/90 p-3")}
          >
            <Block className="h-14 w-14 shrink-0 rounded-xl sm:h-16 sm:w-16" />
            <div className="min-w-0 flex-1 space-y-2">
              <Block className="h-4 w-[85%] rounded-md" />
              <Block className="h-3 w-1/2 rounded-md" />
            </div>
            <Block className="h-5 w-14 shrink-0 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ComboActionBarSkeleton() {
  return (
    <div className={cn(COMBO_ACTION_BAR_SURFACE_CLASS, "p-4")} aria-hidden>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Block className="h-3 w-24 rounded-full" />
          <Block className="h-8 w-28 rounded-md" />
        </div>
        <Block className="h-12 w-32 shrink-0 rounded-xl" />
      </div>
    </div>
  );
}

export function ComboSummaryPanelSkeleton() {
  return (
    <aside className={COMBO_SUMMARY_PANEL_CLASS} aria-hidden>
      <div className={cn(COMBO_ACTION_BAR_SURFACE_CLASS, "space-y-4 p-4 sm:p-5")}>
        <div className="space-y-2 border-b border-zinc-100/90 pb-4">
          <Block className="h-5 w-24 rounded-md" />
          <Block className="h-4 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Block className="h-4 w-full rounded-md" />
          <Block className="h-4 w-full rounded-md" />
          <Block className="h-4 w-3/4 rounded-md" />
        </div>
        <div className="space-y-2 border-t border-zinc-100/90 pt-4">
          <Block className="h-3 w-20 rounded-full" />
          <Block className="h-8 w-28 rounded-md" />
          <Block className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </aside>
  );
}

/**
 * Skeleton del wizard /arma-tu-combo.
 * @param {"page" | "content"} [mode="page"] — page: layout completo; content: solo área de pasos (chrome real arriba).
 */
export default function ComboBuilderSkeleton({ mode = "page" }) {
  if (mode === "content") {
    return (
      <div aria-busy="true" aria-label="Cargando productos del combo">
        <p className="sr-only">Cargando armá tu combo…</p>
        <StepContentSkeleton />
      </div>
    );
  }

  return (
    <div className={COMBO_PAGE_CLASS} aria-busy="true" aria-label="Cargando armá tu combo">
      <p className="sr-only">Cargando armá tu combo…</p>
      <div className={COMBO_CONTENT_CLASS}>
        <div className={COMBO_WIZARD_LAYOUT_CLASS}>
          <div className={COMBO_WIZARD_MAIN_CLASS}>
            <ChromeSkeleton />
            <div className={COMBO_SCROLL_AREA_CLASS}>
              <StepContentSkeleton />
            </div>
            <div className={COMBO_ACTION_BAR_MOBILE_CLASS}>
              <ComboActionBarSkeleton />
            </div>
          </div>
          <ComboSummaryPanelSkeleton />
        </div>
      </div>
    </div>
  );
}
