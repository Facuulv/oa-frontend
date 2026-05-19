import { cn } from "@/lib/cn";

/**
 * Card premium para formularios auth (borde superior rojo, sombra, shine).
 */
export default function AuthCard({ children, className, bodyClassName }) {
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[1.25rem] border border-black/[0.06] bg-white shadow-[0_12px_32px_-8px_rgba(193,18,31,0.12),0_24px_48px_-16px_rgba(0,0,0,0.08)] ring-1 ring-primary/5",
        className,
      )}
    >
      <div aria-hidden className="h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[3px] h-16 rounded-t-[1.25rem] bg-gradient-to-b from-primary/[0.06] to-transparent"
      />
      <div className={cn("relative px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5", bodyClassName)}>{children}</div>
    </article>
  );
}
