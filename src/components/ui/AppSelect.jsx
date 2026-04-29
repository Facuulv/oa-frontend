"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Select estilizado (panel desplegable custom). Pensado para mobile / app admin.
 *
 * @param {object} props
 * @param {string} [props.id]
 * @param {string | undefined} props.value Valor controlado; `undefined` muestra placeholder.
 * @param {(value: string) => void} props.onValueChange
 * @param {{ value: string, label: string, disabled?: boolean }[]} props.options
 * @param {string} [props.placeholder]
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.error]
 * @param {"default"|"compact"} [props.size]
 * @param {string} [props.className] Wrapper externo
 * @param {string} [props.triggerClassName]
 * @param {string} [props.contentZIndexClass] Por encima de modales (z-50)
 * @param {boolean} [props.modalInitialFocus] data-modal-initial-focus en el trigger
 * @param {import("react").FocusEventHandler<HTMLButtonElement>} [props.onBlur] react-hook-form (touched)
 */
export default function AppSelect({
  id,
  value,
  onValueChange,
  options,
  placeholder = "Seleccioná…",
  disabled = false,
  error = false,
  size = "default",
  className,
  triggerClassName,
  contentZIndexClass = "z-[100]",
  modalInitialFocus = false,
  onBlur,
}) {
  const triggerSize =
    size === "compact"
      ? "min-h-10 rounded-xl px-3 py-2 text-sm sm:min-h-11 sm:py-2.5"
      : "min-h-12 rounded-xl px-3 py-3 text-base";

  const border = error
    ? "border-red-300 bg-red-50/30 ring-red-200/60"
    : "border-zinc-200 bg-white ring-zinc-200/40 data-[state=open]:border-zinc-300 data-[state=open]:ring-violet-200/60";

  return (
    <div className={cn("w-full", className)}>
      <SelectPrimitive.Root
        value={value === undefined || value === null ? undefined : String(value)}
        onValueChange={onValueChange}
        disabled={disabled}
        modal={false}
      >
        <SelectPrimitive.Trigger
          id={id}
          type="button"
          onBlur={onBlur}
          {...(modalInitialFocus ? { "data-modal-initial-focus": true } : {})}
          className={cn(
            "group flex w-full touch-manipulation items-center justify-between gap-2 border text-left font-medium text-zinc-900 outline-none transition-[box-shadow,border-color,background-color] ring-primary ring-offset-2 ring-offset-white focus-visible:ring-2 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
            triggerSize,
            border,
            triggerClassName,
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} className="min-w-0 flex-1 truncate" />
          <SelectPrimitive.Icon asChild>
            <ChevronDown
              className="h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 group-data-[state=open]:rotate-180"
              aria-hidden
            />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={6}
            collisionPadding={12}
            className={cn(
              "max-h-[min(20rem,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border border-zinc-200/95 bg-white py-1.5 shadow-xl shadow-zinc-900/12 ring-1 ring-zinc-200/70",
              contentZIndexClass,
            )}
          >
            <SelectPrimitive.Viewport className="max-h-[inherit] overflow-y-auto overscroll-contain p-1">
              {options.map((opt) => (
                <SelectPrimitive.Item
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className={cn(
                    "relative flex min-h-[2.75rem] cursor-default touch-manipulation select-none items-center rounded-xl py-2.5 pl-9 pr-3 text-sm font-medium text-zinc-900 outline-none",
                    "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
                    "data-[highlighted]:bg-violet-50 data-[highlighted]:text-violet-950",
                    "data-[state=checked]:bg-zinc-50",
                  )}
                >
                  <span className="absolute left-2.5 flex h-4 w-4 items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                      <Check className="h-4 w-4 text-violet-600" strokeWidth={2.5} aria-hidden />
                    </SelectPrimitive.ItemIndicator>
                  </span>
                  <SelectPrimitive.ItemText className="leading-snug">{opt.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}
