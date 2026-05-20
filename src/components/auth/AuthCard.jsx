import { cn } from "@/lib/cn";

/**
 * Card premium para formularios auth.
 * @param {boolean} [softTopGlow=false] Glow rojo superior suave (respeta border-radius); sin línea dura.
 */
export default function AuthCard({ children, className, bodyClassName, softTopGlow = false }) {
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[1.25rem] border border-black/[0.06] bg-white shadow-[0_12px_32px_-8px_rgba(193,18,31,0.12),0_24px_48px_-16px_rgba(0,0,0,0.08)] ring-1 ring-primary/5",
        softTopGlow &&
          "border-t border-primary/[0.08] shadow-[0_12px_32px_-8px_rgba(193,18,31,0.12),0_24px_48px_-16px_rgba(0,0,0,0.08),inset_0_1px_0_0_rgba(193,18,31,0.06),inset_0_16px_32px_-20px_rgba(193,18,31,0.14)]",
        className,
      )}
    >
      {softTopGlow ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[4.5rem] rounded-t-[1.25rem] bg-[radial-gradient(ellipse_95%_70%_at_50%_-8%,rgba(193,18,31,0.14),transparent_68%)]"
        />
      ) : (
        <>
          <div aria-hidden className="h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-[3px] h-16 rounded-t-[1.25rem] bg-gradient-to-b from-primary/[0.06] to-transparent"
          />
        </>
      )}
      <div className={cn("relative z-10 px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5", bodyClassName)}>
        {children}
      </div>
    </article>
  );
}
