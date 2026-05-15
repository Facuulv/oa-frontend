import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  ADMIN_INTERACTIVE_CARD,
  ADMIN_MODULE_THEMES,
  ADMIN_SURFACE,
} from "@/lib/adminTheme";

const ICON_SIZE = 34;
const ICON_STROKE = 2;

export default function AdminQuickLinkCard({
  href,
  label,
  hint,
  icon: Icon,
  themeKey,
  animationDelay = 0,
}) {
  const theme = ADMIN_MODULE_THEMES[themeKey];

  return (
    <li
      className="admin-quick-card-enter"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <Link
        href={href}
        className={cn(
          ADMIN_SURFACE,
          ADMIN_INTERACTIVE_CARD,
          "group flex h-full min-h-[4.75rem] items-center gap-3.5 rounded-2xl p-4 sm:min-h-[5rem] sm:gap-4 sm:p-[1.125rem]",
          theme.card,
          theme.cardHover
        )}
      >
        <div
          className={cn(
            "admin-icon-well flex h-[3.25rem] w-[3.25rem] shrink-0 items-center justify-center rounded-xl ring-1 transition-[transform,background-color,color,box-shadow,ring-color] duration-[180ms] ease-out sm:h-14 sm:w-14",
            theme.icon,
            theme.iconHover
          )}
        >
          <Icon
            size={ICON_SIZE}
            strokeWidth={ICON_STROKE}
            className="shrink-0"
            aria-hidden
          />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <span className="block text-[0.9375rem] font-semibold leading-tight text-zinc-900 sm:text-base">
            {label}
          </span>
          <span className="mt-0.5 block text-[0.8125rem] leading-snug text-zinc-500 sm:text-sm">
            {hint}
          </span>
        </div>
      </Link>
    </li>
  );
}
