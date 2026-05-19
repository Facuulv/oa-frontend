import { Home, ShoppingCart, Sparkles, Tag, Settings } from "lucide-react";

/** Navegación global del shell público (sidebar). */
export const globalNavLinks = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/arma-tu-combo", label: "Arma tu combo", icon: Sparkles },
  { href: "/promociones", label: "Promociones", icon: Tag },
  { href: "/checkout", label: "Mi carrito", icon: ShoppingCart },
];

/** Solo staff con acceso al panel. */
export const adminSidebarLinks = [
  { href: "/admin", label: "Panel admin", icon: Settings },
];
