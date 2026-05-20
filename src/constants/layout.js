/**
 * Contratos visuales compartidos del shell público.
 * Evita números mágicos repetidos en navbar/layout/skeletons.
 */
export const PUBLIC_HEADER_HEIGHT = "3.25rem";
export const PUBLIC_SIDEBAR_WIDTH = "17.5rem";
export const PUBLIC_DESKTOP_BREAKPOINT_PX = 768;

/** Contenedor principal bajo navbar: padding-top + min-height (una sola compensación). */
export const PUBLIC_MAIN_SHELL_CLASS = "app-public-main";
export const PUBLIC_CONTENT_MIN_HEIGHT_CLASS =
  "min-h-[calc(100dvh-var(--app-header-total-height))]";
/** Altura exacta del área bajo el navbar (sidebar, panel deslizable). */
export const PUBLIC_CONTENT_HEIGHT_CLASS =
  "h-[calc(100dvh-var(--app-header-total-height))]";
export const OA_BRAND_PRIMARY_HEX = "#C1121F";
