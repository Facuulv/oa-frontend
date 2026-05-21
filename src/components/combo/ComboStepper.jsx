"use client";

import { Fragment } from "react";
import { Check } from "lucide-react";
import { COMBO_STEPPER_CLASS } from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

const DEFAULT_STEPS = [
  { id: 1, label: "Base" },
  { id: 2, label: "Mix" },
  { id: 3, label: "Combo" },
];

/**
 * Stepper presentacional del wizard (Base → Mix → Combo).
 * No modifica `currentStep`; solo refleja el estado recibido.
 */
export default function ComboStepper({
  currentStep,
  steps = DEFAULT_STEPS,
  className,
}) {
  return (
    <nav
      className={cn(COMBO_STEPPER_CLASS, className)}
      aria-label="Progreso para armar tu combo"
    >
      <ol className="flex items-center" role="list">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isDone = currentStep > step.id;
          const isPending = !isActive && !isDone;
          const connectorDone = currentStep > step.id;

          return (
            <Fragment key={step.id}>
              <li
                role="listitem"
                className="flex min-w-0 flex-1 flex-col items-center gap-0.5"
                aria-current={isActive ? "step" : undefined}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                    "motion-safe:transition-colors motion-safe:duration-200",
                    isActive && "bg-primary text-white ring-2 ring-primary/15",
                    isDone && "bg-primary/10 text-primary ring-1 ring-primary/12",
                    isPending && "bg-zinc-100 text-zinc-400 ring-1 ring-zinc-200/70",
                  )}
                >
                  {isDone ? (
                    <Check size={13} strokeWidth={3} aria-hidden />
                  ) : (
                    <span aria-hidden>{step.id}</span>
                  )}
                  <span className="sr-only">
                    {isDone ? "Completado" : isActive ? "Actual" : "Pendiente"}: {step.label}
                  </span>
                </span>
                <span
                  className={cn(
                    "max-w-full truncate text-center text-[10px] font-semibold leading-none sm:text-[11px]",
                    isActive && "text-foreground",
                    isDone && "text-primary",
                    isPending && "text-zinc-400",
                  )}
                >
                  {step.label}
                </span>
              </li>

              {index < steps.length - 1 ? (
                <li
                  className="flex h-7 min-w-[0.75rem] flex-[0.65] items-center px-0.5 sm:min-w-[1rem] sm:flex-1"
                  aria-hidden
                >
                  <span
                    className={cn(
                      "h-px w-full rounded-full",
                      connectorDone ? "bg-primary/30" : "bg-zinc-200",
                    )}
                  />
                </li>
              ) : null}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
