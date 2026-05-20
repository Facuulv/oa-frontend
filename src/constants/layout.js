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
/** Altura exacta del área bajo el navbar (panel deslizable en flujo). */
export const PUBLIC_CONTENT_HEIGHT_CLASS =
  "h-[calc(100dvh-var(--app-header-total-height))]";
/** Drawer lateral fijo bajo navbar (viewport, no el padding de .app-public-main). */
export const PUBLIC_SIDEBAR_CLASS = "app-public-sidebar";
export const PUBLIC_SIDEBAR_OVERLAY_CLASS = "app-public-sidebar-overlay";
export const OA_BRAND_PRIMARY_HEX = "#C1121F";
