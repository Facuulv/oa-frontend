"use client";

import { Search } from "lucide-react";

/**
 * Buscador del wizard /arma-tu-combo (presentacional).
 */
export default function ComboSearchInput({
  value,
  onChange,
  placeholder,
  className = "",
  ariaLabel,
}) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 outline-none motion-safe:transition placeholder:text-zinc-400 focus:border-primary/40 focus:ring-2 focus:ring-primary/15 focus-visible:outline-none"
      />
    </div>
  );
}
