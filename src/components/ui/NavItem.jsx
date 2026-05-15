"use client";

import Link from "next/link";

export default function NavItem({ href, label, icon: Icon, isActive, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors duration-200 ${
        isActive
          ? "bg-red-500/15 text-red-100 ring-1 ring-red-400/30"
          : "bg-white/[0.02] text-zinc-300 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span
        className={`inline-flex h-8 w-8 items-center justify-center rounded-xl border transition-colors duration-200 ${
          isActive
            ? "border-red-400/30 bg-red-500/15 text-red-300"
            : "border-white/10 bg-white/[0.02] text-zinc-400 group-hover:border-white/20 group-hover:text-zinc-200"
        }`}
      >
        <Icon size={16} />
      </span>
      <span>{label}</span>
    </Link>
  );
}
