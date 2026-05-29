"use client";

import { ChevronRight } from "lucide-react";
import { ACCOUNT_OPTION_CARD_CLASS } from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

/**
 * Card de acción en el hub de cuenta.
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.subtitle
 * @param {string} props.cta
 * @param {import("lucide-react").LucideIcon} props.icon
 * @param {string} [props.badge]
 * @param {boolean} [props.disabled]
 * @param {() => void} [props.onClick]
 */
export default function AccountOptionCard({
  title,
  subtitle,
  cta,
  icon: Icon,
  badge,
  disabled = false,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        ACCOUNT_OPTION_CARD_CLASS,
        "group transition",
        disabled
          ? "cursor-not-allowed border-zinc-100 opacity-75"
          : "hover:border-primary/20",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground">{title}</p>
          <p className="mt-1 text-xs leading-snug text-zinc-500">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {badge ? (
            <span className="rounded-full bg-primary/8 px-2 py-1 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/10">
              {badge}
            </span>
          ) : null}
          <span
            className={cn(
              "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition",
              disabled
                ? "bg-zinc-100 text-zinc-400"
                : "bg-primary/10 text-primary group-hover:bg-primary/15",
            )}
          >
            <Icon size={18} strokeWidth={2.25} aria-hidden />
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span
          className={cn(
            "text-sm font-semibold",
            disabled ? "text-zinc-400" : "text-primary",
          )}
        >
          {cta}
        </span>
        {!disabled ? (
          <ChevronRight size={16} className="text-zinc-400" aria-hidden />
        ) : null}
      </div>
    </button>
  );
}
