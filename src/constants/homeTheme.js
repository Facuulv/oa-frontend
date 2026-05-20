import { PUBLIC_CONTENT_MIN_HEIGHT_CLASS } from "@/constants/layout";
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
