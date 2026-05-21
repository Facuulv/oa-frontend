import {
  PUBLIC_CONTENT_HEIGHT_CLASS,
  PUBLIC_CONTENT_MIN_HEIGHT_CLASS,
} from "@/constants/layout";
import { cn } from "@/lib/cn";

/** Contenedor raíz del home (fondo + min-height + espacio carrito). */
export const HOME_PAGE_CLASS = `${PUBLIC_CONTENT_MIN_HEIGHT_CLASS} home-page pb-16`;

/**
 * Columna de contenido: padding horizontal responsive y tope amplio en desktop
 * (no simula teléfono estrecho; aprovecha hasta ~1280px).
 */
export const HOME_CONTENT_CLASS = "home-content";

/** Bloque vertical del home con gap estándar entre secciones. */
export const HOME_SECTION_CLASS = "home-section";

/** Primera sección (destacados): menos aire superior. */
export const HOME_SECTION_LEAD_CLASS = "home-section home-section--lead";

/** Superficie de card del home (etapas posteriores). */
export const HOME_CARD_SURFACE_CLASS = "home-card-surface";

/** Interacción táctil / hover del home público. */
export const PUBLIC_PRESSABLE_CLASS = "public-pressable";
export const PUBLIC_CARD_LIFT_CLASS = "public-card-lift";

/** Carrusel de productos destacados. */
export const HOME_CAROUSEL_CLASS = "home-carousel";
export const HOME_CAROUSEL_VIEWPORT_CLASS = "home-carousel-viewport";
export const HOME_CAROUSEL_TRACK_CLASS = "home-carousel-track";
export const HOME_FEATURED_SLIDE_CLASS = "home-featured-slide";

/** Card destacada (link interactivo). */
export const HOME_FEATURED_CARD_LINK_CLASS = cn(
  HOME_CARD_SURFACE_CLASS,
  PUBLIC_PRESSABLE_CLASS,
  PUBLIC_CARD_LIFT_CLASS,
  "group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-zinc-100/90 bg-white",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
);

/** Shell estático para skeleton / loading del carrusel. */
export const HOME_FEATURED_CARD_SHELL_CLASS = cn(
  HOME_CARD_SURFACE_CLASS,
  "flex h-full w-full flex-col overflow-hidden rounded-2xl border border-zinc-100/90 bg-white/90",
);

/** Stack de CTAs del home (etapa 3). */
export const HOME_CTA_GROUP_CLASS = "home-cta-group";

/** CTA principal: Promociones Imperdibles. */
export const HOME_CTA_PRIMARY_CLASS = cn(
  HOME_CARD_SURFACE_CLASS,
  PUBLIC_PRESSABLE_CLASS,
  PUBLIC_CARD_LIFT_CLASS,
  "group relative flex min-h-[5.75rem] items-center gap-3.5 overflow-hidden rounded-2xl",
  "bg-gradient-to-br from-primary via-primary to-primary-dark p-4 text-white md:min-h-[6rem] md:gap-4 md:p-5",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-primary",
);

/** CTA secundario: Armá tu combo. */
export const HOME_CTA_SECONDARY_CLASS = cn(
  HOME_CARD_SURFACE_CLASS,
  PUBLIC_PRESSABLE_CLASS,
  PUBLIC_CARD_LIFT_CLASS,
  "group relative flex min-h-[5.75rem] items-center gap-3.5 overflow-hidden rounded-2xl border border-primary/20",
  "bg-white p-4 text-foreground md:min-h-[6rem] md:gap-4 md:p-5",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
);

/** Sección Categorías (etapa 4). */
export const HOME_CATEGORY_GRID_CLASS =
  "home-category-grid grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4";

export const HOME_CATEGORY_CARD_CLASS = cn(
  HOME_CARD_SURFACE_CLASS,
  PUBLIC_PRESSABLE_CLASS,
  PUBLIC_CARD_LIFT_CLASS,
  "home-category-card card-fade-in group relative flex min-h-[7.6rem] items-end overflow-hidden rounded-2xl border border-white/70",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  "md:min-h-[8.6rem] lg:min-h-[9.5rem]",
);

/** Pantalla /promociones: misma base visual que el Home (P0). */
export const PROMO_PAGE_CLASS = HOME_PAGE_CLASS;
export const PROMO_CONTENT_CLASS = HOME_CONTENT_CLASS;
export const PROMO_SECTION_CLASS = HOME_SECTION_LEAD_CLASS;

/** Grilla del listado /promociones (P2). */
export const PROMO_LIST_GRID_CLASS =
  "grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3";

/** Badge de PromoCard (P4). */
export const PROMO_BADGE_CLASS =
  "inline-flex w-fit max-w-full shrink-0 rounded-full bg-primary/8 px-2.5 py-0.5 text-[0.6875rem] font-medium leading-none text-primary ring-1 ring-inset ring-primary/10";

/** Link de PromoCard: listado mobile + tile desktop. */
export const PROMO_CARD_LINK_CLASS = cn(
  HOME_CARD_SURFACE_CLASS,
  PUBLIC_PRESSABLE_CLASS,
  PUBLIC_CARD_LIFT_CLASS,
  "promo-card group flex h-full w-full overflow-hidden rounded-2xl border border-zinc-100/90 bg-white",
  "flex-row items-stretch gap-3 p-3.5",
  "md:flex-col md:gap-0 md:p-0",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
);

/** Shell estático para skeleton de PromoCard (P3). */
export const PROMO_CARD_SHELL_CLASS = cn(
  HOME_CARD_SURFACE_CLASS,
  "flex h-full w-full overflow-hidden rounded-2xl border border-zinc-100/90 bg-white/90",
  "flex-row items-stretch gap-3 p-3.5",
  "md:flex-col md:gap-0 md:p-0",
);

/** Empty / error de /promociones (P3). */
export const PROMO_STATUS_CARD_CLASS = cn(
  HOME_CARD_SURFACE_CLASS,
  "rounded-2xl border border-zinc-100/90 bg-white p-6 text-center md:p-8",
);

/**
 * /arma-tu-combo (C0–C1): misma base que Home/Promociones, sin pb-16 del carrito.
 * Columna flex: área scroll + barra de acción en flujo (evita fixed + clipping AppShell).
 */
export const COMBO_PAGE_CLASS = cn(
  PUBLIC_CONTENT_MIN_HEIGHT_CLASS,
  PUBLIC_CONTENT_HEIGHT_CLASS,
  "home-page flex min-h-0 flex-col text-foreground",
);

/** Contenedor home-content + columna wizard centrada (480px). */
export const COMBO_CONTENT_CLASS = cn(
  HOME_CONTENT_CLASS,
  "flex min-h-0 w-full flex-1 flex-col",
);

/**
 * Layout wizard: 1 columna mobile; 2 columnas desde lg (armado + panel sticky).
 */
export const COMBO_WIZARD_LAYOUT_CLASS = cn(
  "flex min-h-0 w-full flex-1 flex-col",
  "lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-6",
  "xl:grid-cols-[minmax(0,1fr)_24rem] xl:gap-8",
);

/** Columna izquierda: armado (centrada en mobile; ancho fluido en desktop). */
export const COMBO_WIZARD_MAIN_CLASS = cn(
  "mx-auto flex w-full min-h-0 max-w-xl flex-1 flex-col md:max-w-2xl",
  "lg:mx-0 lg:max-w-none",
);

/** Panel lateral sticky (solo desktop). */
export const COMBO_SUMMARY_PANEL_CLASS = cn(
  "combo-summary-panel hidden shrink-0 lg:block lg:w-full",
  "lg:sticky lg:top-[calc(var(--app-header-total-height)+1rem)] lg:self-start",
);

/** Chrome fijo del wizard: volver, título y stepper (fuera del scroll). */
export const COMBO_WIZARD_CHROME_CLASS = "combo-wizard-chrome shrink-0 px-4 pt-3";

/** Solo contenido de pasos; scroll funcional sin scrollbar visible. */
export const COMBO_SCROLL_AREA_CLASS = cn(
  "combo-scroll-area no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-2",
);

/**
 * Contenedor del footer en flujo (C1): sin fondo oscuro; safe-area en globals.
 */
export const COMBO_ACTION_BAR_CLASS = "combo-action-bar shrink-0 w-full px-4 pt-2";

/** Footer mobile: oculto en desktop cuando el panel lateral tiene el CTA. */
export const COMBO_ACTION_BAR_MOBILE_CLASS = cn(COMBO_ACTION_BAR_CLASS, "lg:hidden");

/** Superficie premium de la barra de acción (C2). */
export const COMBO_ACTION_BAR_SURFACE_CLASS = cn(
  HOME_CARD_SURFACE_CLASS,
  "combo-action-bar-surface w-full rounded-2xl border border-zinc-100/90 bg-white/95 ring-1 ring-black/5",
  "supports-[backdrop-filter]:bg-white/88 backdrop-blur-md",
);

/** Header del wizard (C3). */
export const COMBO_WIZARD_HEADER_CLASS = "mb-2";

/** Stepper del wizard (C3). */
export const COMBO_STEPPER_CLASS = "mb-3";

/** Fila seleccionable Base/Mix (C4). */
export const COMBO_PRODUCT_ROW_CLASS = cn(
  HOME_CARD_SURFACE_CLASS,
  PUBLIC_PRESSABLE_CLASS,
  PUBLIC_CARD_LIFT_CLASS,
  "flex w-full items-center gap-3 rounded-2xl border bg-white p-3 text-left",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
);

export const COMBO_PRODUCT_ROW_SELECTED_CLASS =
  "border-primary bg-primary/[0.03] ring-2 ring-primary/20";
export const COMBO_PRODUCT_ROW_IDLE_CLASS =
  "border-zinc-100/90 hover:border-primary/25";

/** Lista de extras/hielo (C4). */
export const COMBO_EXTRAS_LIST_CLASS = cn(
  HOME_CARD_SURFACE_CLASS,
  "overflow-hidden rounded-2xl border border-zinc-100/90 bg-white",
);

/** Botón + de extras/hielo (C4). */
export const COMBO_ADD_BUTTON_CLASS = cn(
  PUBLIC_PRESSABLE_CLASS,
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
);

/** Stepper de cantidad en fila de extra/hielo (C4). */
export const COMBO_QUANTITY_CONTROL_CLASS = cn(
  "flex shrink-0 items-center gap-0.5 rounded-full border border-zinc-200/90 bg-white p-0.5 shadow-sm",
);

/** Card resumen final “Tu Combo Personalizado” (C5). */
export const COMBO_SUMMARY_CARD_CLASS = cn(
  HOME_CARD_SURFACE_CLASS,
  "mt-6 overflow-hidden rounded-2xl border border-zinc-100/90 bg-white p-4 ring-1 ring-black/5 sm:p-5",
);

export const COMBO_SUMMARY_INPUT_CLASS = cn(
  "mt-1.5 h-11 w-full rounded-xl border border-zinc-200/90 bg-white px-3 text-sm font-semibold text-foreground outline-none transition",
  "placeholder:font-normal placeholder:text-zinc-400",
  "focus:border-primary/40 focus:ring-2 focus:ring-primary/15 focus-visible:outline-none",
);

export const COMBO_SAVE_OPTION_ACTIVE_CLASS =
  "border-primary bg-primary/5 ring-1 ring-primary/15";
export const COMBO_SAVE_OPTION_IDLE_CLASS =
  "border-zinc-200/90 bg-zinc-50/50 hover:border-primary/20";

/** Empty / error de /arma-tu-combo (C7). */
export const COMBO_STATUS_CARD_CLASS = PROMO_STATUS_CARD_CLASS;

/** Pulso skeleton con reduced-motion (C7). */
export const COMBO_SKELETON_PULSE_CLASS = "animate-pulse motion-reduce:animate-none";
