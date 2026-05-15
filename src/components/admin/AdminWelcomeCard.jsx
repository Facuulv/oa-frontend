import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/cn";
import { ADMIN_SURFACE } from "@/lib/adminTheme";

export default function AdminWelcomeCard({ greetName }) {
  return (
    <section
      className={cn(
        ADMIN_SURFACE,
        "admin-welcome-card-enter relative overflow-hidden px-5 py-5 sm:px-7 sm:py-6",
        "bg-gradient-to-br from-white via-white to-red-50/30",
        "ring-zinc-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_-4px_rgba(0,0,0,0.06)]"
      )}
      aria-labelledby="admin-welcome-title"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-primary/[0.06] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-12 -left-6 h-28 w-28 rounded-full bg-red-100/30 blur-2xl"
        aria-hidden
      />

      <div className="relative flex items-start gap-4 sm:gap-5">
        <div className="relative shrink-0">
          <div
            className="pointer-events-none absolute inset-0 scale-110 rounded-2xl bg-primary/10 blur-xl"
            aria-hidden
          />
          <div
            className={cn(
              "relative flex h-14 w-14 items-center justify-center rounded-2xl sm:h-[3.75rem] sm:w-[3.75rem]",
              "bg-gradient-to-br from-primary/12 via-primary/8 to-red-50/80",
              "text-primary ring-1 ring-primary/20",
              "shadow-[0_2px_12px_-2px_rgba(193,18,31,0.25)]"
            )}
          >
            <LayoutGrid className="size-7 sm:size-8" strokeWidth={2} aria-hidden />
          </div>
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-[0.8125rem] font-medium tracking-wide text-zinc-500">
            Hola, <span className="text-zinc-700">{greetName}</span>
          </p>
          <h2
            id="admin-welcome-title"
            className="mt-0.5 text-[1.375rem] font-bold leading-tight tracking-tight text-zinc-900 sm:text-2xl"
          >
            Panel de administración
          </h2>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-zinc-500">
            Gestioná tu carta, productos, combos y usuarios.
          </p>
        </div>
      </div>
    </section>
  );
}
