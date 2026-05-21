"use client";

import { ArrowLeft } from "lucide-react";
import { COMBO_WIZARD_HEADER_CLASS, PUBLIC_PRESSABLE_CLASS } from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

const STEP_SUBTITLES = {
  1: "Elegí la base de tu combo",
  2: "Elegí con qué acompañarlo",
  3: "Últimos detalles antes de crearlo",
};

/**
 * Encabezado presentacional del wizard /arma-tu-combo.
 * `onBack` lo define el padre (paso anterior o router.back en paso 1).
 */
export default function ComboWizardHeader({
  title,
  subtitle,
  currentStep,
  onBack,
  className,
}) {
  const resolvedSubtitle =
    subtitle ?? (currentStep ? STEP_SUBTITLES[currentStep] : undefined);

  return (
    <header className={cn(COMBO_WIZARD_HEADER_CLASS, className)}>
      <button
        type="button"
        onClick={onBack}
        aria-label="Volver"
        className={cn(
          PUBLIC_PRESSABLE_CLASS,
          "mb-2 -ml-1 inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl text-zinc-700",
          "hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        )}
      >
        <ArrowLeft size={20} strokeWidth={2.25} aria-hidden />
      </button>
      <div className="home-section-header__accent min-w-0">
        <h1 className="text-lg font-bold tracking-tight text-foreground md:text-xl">{title}</h1>
        {resolvedSubtitle ? (
          <p className="mt-1 text-sm leading-snug text-zinc-500 md:mt-1.5 md:text-[0.9375rem]">
            {resolvedSubtitle}
          </p>
        ) : null}
      </div>
    </header>
  );
}
