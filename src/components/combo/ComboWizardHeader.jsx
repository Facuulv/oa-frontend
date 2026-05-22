"use client";

import PublicPageHeader from "@/components/public/PublicPageHeader";

const STEP_SUBTITLES = {
  1: "Elegí la base de tu combo",
  2: "Elegí con qué acompañarlo",
  3: "Últimos detalles antes de crearlo",
};

/**
 * Encabezado presentacional del wizard /arma-tu-combo.
 * Misma posición y ritmo que /promociones (`PublicPageHeader`).
 */
export default function ComboWizardHeader({
  title,
  subtitle,
  currentStep,
  onBack,
  className = "mb-4 md:mb-5",
}) {
  const resolvedSubtitle =
    subtitle ?? (currentStep ? STEP_SUBTITLES[currentStep] : undefined);

  return (
    <PublicPageHeader
      title={title}
      subtitle={resolvedSubtitle}
      onBack={onBack}
      className={className}
    />
  );
}
