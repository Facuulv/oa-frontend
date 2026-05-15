/**
 * Tokens visuales del panel admin por módulo.
 * Tintes muy suaves — apenas perceptibles, hover contextual elegante.
 */

export const ADMIN_MODULE_THEMES = {
  productos: {
    card: "bg-red-50/40 ring-red-100/50",
    cardHover:
      "hover:bg-red-50/55 hover:ring-red-200/60 hover:shadow-[0_8px_24px_-6px_rgba(185,28,28,0.12)]",
    icon: "bg-red-100/70 text-red-700 ring-red-200/50 shadow-[0_2px_8px_-2px_rgba(185,28,28,0.15)]",
    iconHover:
      "group-hover:bg-red-100 group-hover:text-red-800 group-hover:ring-red-300/60 group-hover:shadow-[0_4px_12px_-2px_rgba(185,28,28,0.2)]",
  },
  promociones: {
    card: "bg-amber-50/40 ring-amber-100/50",
    cardHover:
      "hover:bg-amber-50/55 hover:ring-amber-200/60 hover:shadow-[0_8px_24px_-6px_rgba(180,83,9,0.12)]",
    icon: "bg-amber-100/70 text-amber-800 ring-amber-200/50 shadow-[0_2px_8px_-2px_rgba(180,83,9,0.14)]",
    iconHover:
      "group-hover:bg-amber-100 group-hover:text-amber-900 group-hover:ring-amber-300/60 group-hover:shadow-[0_4px_12px_-2px_rgba(180,83,9,0.18)]",
  },
  categorias: {
    card: "bg-violet-50/40 ring-violet-100/50",
    cardHover:
      "hover:bg-violet-50/55 hover:ring-violet-200/60 hover:shadow-[0_8px_24px_-6px_rgba(109,40,217,0.12)]",
    icon: "bg-violet-100/70 text-violet-700 ring-violet-200/50 shadow-[0_2px_8px_-2px_rgba(109,40,217,0.14)]",
    iconHover:
      "group-hover:bg-violet-100 group-hover:text-violet-800 group-hover:ring-violet-300/60 group-hover:shadow-[0_4px_12px_-2px_rgba(109,40,217,0.18)]",
  },
  usuarios: {
    card: "bg-sky-50/40 ring-sky-100/50",
    cardHover:
      "hover:bg-sky-50/55 hover:ring-sky-200/60 hover:shadow-[0_8px_24px_-6px_rgba(2,132,199,0.12)]",
    icon: "bg-sky-100/70 text-sky-700 ring-sky-200/50 shadow-[0_2px_8px_-2px_rgba(2,132,199,0.14)]",
    iconHover:
      "group-hover:bg-sky-100 group-hover:text-sky-800 group-hover:ring-sky-300/60 group-hover:shadow-[0_4px_12px_-2px_rgba(2,132,199,0.18)]",
  },
};

/** Superficie base compartida por cards del admin */
export const ADMIN_SURFACE =
  "rounded-2xl shadow-sm ring-1 transition-[transform,box-shadow,background-color,border-color,ring-color] duration-[180ms] ease-out";

/** Card interactiva con elevación premium al hover */
export const ADMIN_INTERACTIVE_CARD =
  "admin-pressable admin-card-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";
