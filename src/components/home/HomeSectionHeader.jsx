import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Encabezado de sección del home (presentacional).
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {string} [props.actionHref]
 * @param {string} [props.actionLabel]
 * @param {string} [props.className]
 */
export default function HomeSectionHeader({
  title,
  subtitle,
  actionHref,
  actionLabel,
  className,
}) {
  const showAction = actionHref && actionLabel;

  return (
    <header className={cn("home-section-header", className)}>
      <div className="flex items-start justify-between gap-3 md:gap-4">
        <div className="home-section-header__accent min-w-0 flex-1">
          <h2 className="text-lg font-bold tracking-tight text-foreground md:text-xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm leading-snug text-zinc-500 md:mt-1.5 md:text-[0.9375rem]">
              {subtitle}
            </p>
          ) : null}
        </div>
        {showAction ? (
          <Link
            href={actionHref}
            className="shrink-0 rounded-sm pt-0.5 text-sm font-semibold text-primary underline-offset-2 transition-colors hover:text-primary-dark hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </header>
  );
}
