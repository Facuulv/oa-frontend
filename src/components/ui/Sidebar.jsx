"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Home,
  ShoppingCart,
  Sparkles,
  Tag,
  Trash2,
  User,
  LogIn,
  Settings,
  Download,
  X,
} from "lucide-react";
import {
  useAuthStore,
  selectCanAccessAdminPanel,
  selectIsAuthenticatedCliente,
} from "@/store/useAuthStore";
import { useSavedCombosStore, selectSavedCombos } from "@/store/useSavedCombosStore";
import { PUBLIC_SIDEBAR_WIDTH } from "@/constants/layout";
import NavItem from "@/components/ui/NavItem";

/**
 * Orden fijo. Se renderizan en dos bloques: los que van antes de la sección
 * "Tus combos" (hasta Promociones inclusive) y los que van después.
 * No mutar ni reordenar en runtime durante el primer render.
 */
const primaryPublicLinks = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/arma-tu-combo", label: "Arma tu combo", icon: Sparkles },
  { href: "/promociones", label: "Promociones", icon: Tag },
];

const secondaryPublicLinks = [
  { href: "/checkout", label: "Mi carrito", icon: ShoppingCart },
];

const authLinks = [
  { href: "/mi-cuenta", label: "Mi cuenta", icon: User },
];

const adminLinks = [
  { href: "/admin", label: "Panel admin", icon: Settings },
];

export default function Sidebar({
  isOpen,
  onClose,
  onInstallClick,
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState("Hola");
  const [isCombosOpen, setIsCombosOpen] = useState(false);

  const isAuthenticated = useAuthStore(selectIsAuthenticatedCliente);
  const canAccessAdminPanel = useAuthStore(selectCanAccessAdminPanel);
  const savedCombos = useSavedCombosStore(selectSavedCombos);
  const removeCombo = useSavedCombosStore((s) => s.removeCombo);

  const handleInstallClick = () => {
    onClose?.();
    onInstallClick?.();
  };

  const isLinkActive = (href) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));
  const isCombosSectionActive = pathname?.startsWith("/arma-tu-combo");
  const loginIsActive = isLinkActive("/login");


  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 12) {
      setGreeting("Buenos días");
      return;
    }

    if (hour >= 12 && hour < 20) {
      setGreeting("Buenas tardes");
      return;
    }

    setGreeting("Buenas noches");
  }, []);

  return (
    <aside
      className={`absolute left-0 top-0 z-50 h-full transform-gpu border-r border-white/10 bg-zinc-950/98 shadow-2xl backdrop-blur-[1px] will-change-transform transition-transform duration-200 ease-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      style={{ width: `min(${PUBLIC_SIDEBAR_WIDTH}, 85vw)` }}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="shrink-0 px-5 pt-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-lg font-semibold text-white">OA! Bebidas</p>
                <p className="text-xs text-zinc-400">Un mundo de bebidas</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-1.5 text-zinc-300 transition-colors duration-200 hover:border-white/20 hover:bg-white/[0.09] hover:text-white"
                aria-label="Cerrar menú"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <p className="text-xs text-zinc-400">{greeting} 👋</p>
              <p className="text-sm font-medium text-zinc-100">¿Qué vas a tomar hoy?</p>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-5 pb-5 pt-4">
          <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-y-contain scroll-pt-1 px-1 pt-1">
            {primaryPublicLinks.map(({ href, label, icon: Icon }) => {
              const isActive = isLinkActive(href);

              return (
                <NavItem
                  key={href}
                  href={href}
                  label={label}
                  icon={Icon}
                  isActive={isActive}
                  onClick={onClose}
                />
              );
            })}

            {mounted && (
              <div className="border-t border-white/10 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCombosOpen((open) => !open)}
                  aria-expanded={isCombosOpen}
                  aria-controls="sidebar-tus-combos-panel"
                  className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors duration-200 ${
                    isCombosSectionActive
                      ? "bg-red-500/15 text-red-100 ring-1 ring-red-400/30"
                      : isCombosOpen
                        ? "bg-white/[0.04] text-white"
                        : "bg-white/[0.02] text-zinc-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span
                    className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-colors duration-200 ${
                      isCombosSectionActive
                        ? "border-red-400/30 bg-red-500/15 text-red-300"
                        : "border-white/10 bg-white/[0.02] text-zinc-400 group-hover:border-white/20 group-hover:text-zinc-200"
                    }`}
                  >
                    <Sparkles size={16} />
                  </span>
                  <span className="min-w-0 flex-1 text-left">Tus combos</span>
                  <ChevronDown
                    size={18}
                    strokeWidth={2.25}
                    className={`shrink-0 text-zinc-400 transition-transform duration-200 group-hover:text-zinc-200 ${
                      isCombosOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  />
                </button>

                {isCombosOpen && (
                  <div
                    id="sidebar-tus-combos-panel"
                    className="mt-1 max-h-52 overflow-y-auto rounded-xl border border-white/10 bg-black/20 py-1"
                  >
                    {savedCombos.length === 0 ? (
                      <p className="px-4 py-3 text-xs font-medium leading-relaxed text-zinc-400">
                        No tenés combos guardados
                      </p>
                    ) : (
                      <ul className="space-y-0.5 px-1.5 py-1">
                        {savedCombos.map((combo) => {
                          const displayName =
                            combo.name?.trim() || combo.label || "Mi Combo Custom";
                          return (
                            <li
                              key={combo.id}
                              className="flex items-center gap-1 rounded-lg hover:bg-white/5"
                            >
                              <Link
                                href={`/arma-tu-combo?combo=${encodeURIComponent(combo.id)}`}
                                onClick={onClose}
                                title={displayName}
                                className="min-w-0 flex-1 truncate px-2.5 py-2 text-sm font-medium text-zinc-200 transition-colors hover:text-red-300"
                              >
                                {displayName}
                              </Link>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  removeCombo(combo.id);
                                }}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-500/15 hover:text-red-200"
                                aria-label={`Eliminar ${displayName}`}
                              >
                                <Trash2 size={14} strokeWidth={2} />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}

            {secondaryPublicLinks.map(({ href, label, icon: Icon }) => {
              const isActive = isLinkActive(href);

              return (
                <NavItem
                  key={href}
                  href={href}
                  label={label}
                  icon={Icon}
                  isActive={isActive}
                  onClick={onClose}
                />
              );
            })}

            <button
              type="button"
              onClick={handleInstallClick}
              className="group flex w-full items-center gap-3 rounded-2xl border border-red-500/25 bg-zinc-900/70 px-3 py-3 text-left text-sm font-medium text-red-200 transition-colors duration-200 hover:border-red-400/40 hover:bg-zinc-900"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-300">
                <Download size={16} />
              </span>
              Instalar app
            </button>
          </nav>

          <div className="mt-4 shrink-0 space-y-2 border-t border-white/10 px-1 pt-4">
            {isAuthenticated ? (
              <>
                {authLinks.map(({ href, label, icon: Icon }) => {
                  const isActive = isLinkActive(href);

                  return (
                    <NavItem
                      key={href}
                      href={href}
                      label={label}
                      icon={Icon}
                      isActive={isActive}
                      onClick={onClose}
                    />
                  );
                })}

                {canAccessAdminPanel &&
                  adminLinks.map(({ href, label, icon: Icon }) => {
                    const isActive = isLinkActive(href);

                    return (
                      <NavItem
                        key={href}
                        href={href}
                        label={label}
                        icon={Icon}
                        isActive={isActive}
                        onClick={onClose}
                      />
                    );
                  })}
              </>
            ) : (
              <NavItem
                href="/login"
                label="Iniciar sesión"
                icon={LogIn}
                isActive={loginIsActive}
                onClick={onClose}
              />
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
