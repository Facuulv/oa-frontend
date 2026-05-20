"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

const sizeStyles = {
  default: {
    link: "gap-3 rounded-2xl px-3 py-3",
    icon: "h-8 w-8 rounded-xl",
    iconSize: 16,
  },
  compact: {
    link: "gap-2.5 rounded-xl px-2.5 py-2.5",
    icon: "h-8 w-8 rounded-lg",
    iconSize: 15,
  },
};

export default function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
  onClick,
  size = "default",
}) {
  const styles = sizeStyles[size] ?? sizeStyles.default;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex w-full items-center text-sm font-medium transition-colors duration-200",
        styles.link,
        isActive
          ? "bg-red-500/15 text-red-100 ring-1 ring-red-400/30"
          : "bg-white/[0.02] text-zinc-300 hover:bg-white/5 hover:text-white",
      )}
    >
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center border transition-colors duration-200",
          styles.icon,
          isActive
            ? "border-red-400/30 bg-red-500/15 text-red-300"
            : "border-white/10 bg-white/[0.02] text-zinc-400 group-hover:border-white/20 group-hover:text-zinc-200",
        )}
      >
        <Icon size={styles.iconSize} />
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
}
