"use client";

import { COMBO_EXTRAS_LIST_CLASS } from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

/**
 * Contenedor de lista para extras e hielo (presentacional).
 */
export default function ComboSectionList({ children, className }) {
  return <div className={cn(COMBO_EXTRAS_LIST_CLASS, className)}>{children}</div>;
}
