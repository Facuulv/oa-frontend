"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { User, LogIn, LogOut, Download, X } from "lucide-react";
import {
  useAuthStore,
  selectCanAccessAdminPanel,
  selectIsAuthenticatedCliente,
} from "@/store/useAuthStore";
import { PUBLIC_SIDEBAR_CLASS, PUBLIC_SIDEBAR_WIDTH } from "@/constants/layout";
import { adminSidebarLinks, globalNavLinks } from "@/config/publicSidebarNav";
import NavItem from "@/components/ui/NavItem";
import { cn } from "@/lib/cn";

const footerActionClass =
  "group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-sm font-medium transition-colors duration-200";

export default function Sidebar({ isOpen, onClose, onInstallClick }) {
  const router = useRouter();
  const pathname = usePathname();
  const [greeting, setGreeting] = useState("Hola");

  const isAuthenticated = useAuthStore(selectIsAuthenticatedCliente);
  const canAccessAdminPanel = useAuthStore(selectCanAccessAdminPanel);
  const logout = useAuthStore((s) => s.logout);

  const handleInstallClick = () => {
    onClose?.();
    onInstallClick?.();
  };

  const isLinkActive = (href) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  const isAccountHubActive =
    pathname?.startsWith("/mi-cuenta") || pathname?.startsWith("/mis-pedidos");

  const loginIsActive = isLinkActive("/login");

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // sesión local ya limpia
    }
    onClose?.();
    router.push("/");
  };

  useEffect(() => {
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
      className={cn(
        PUBLIC_SIDEBAR_CLASS,
        "transform-gpu border-r border-white/10 bg-zinc-950/98 shadow-2xl backdrop-blur-[1px] will-change-transform transition-transform duration-200 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
      style={{ width: `min(${PUBLIC_SIDEBAR_WIDTH}, 85vw)` }}
    >
      <header className="shrink-0 px-4 pb-2 pt-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 shadow-[0_16px_32px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-base font-semibold leading-tight text-white">OA! Bebidas</p>
              <p className="text-[11px] text-zinc-400">Un mundo de bebidas</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg border border-white/10 bg-white/[0.04] p-1.5 text-zinc-300 transition-colors duration-200 hover:border-white/20 hover:bg-white/[0.09] hover:text-white"
              aria-label="Cerrar menú"
            >
              <X size={17} />
            </button>
          </div>

          <div className="mt-2.5 rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5">
            <p className="text-[11px] text-zinc-400">{greeting} 👋</p>
            <p className="text-xs font-medium text-zinc-100">¿Qué vas a tomar hoy?</p>
          </div>
        </div>
      </header>

      <nav
        className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-y-contain px-4 pb-2 [-webkit-overflow-scrolling:touch]"
        aria-label="Navegación principal"
      >
        {globalNavLinks.map(({ href, label, icon: Icon }) => (
          <NavItem
            key={href}
            href={href}
            label={label}
            icon={Icon}
            size="compact"
            isActive={isLinkActive(href)}
            onClick={onClose}
          />
        ))}
      </nav>

      <footer className="shrink-0 space-y-2.5 border-t border-white/10 px-4 py-3.5 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
        <button
          type="button"
          onClick={handleInstallClick}
          className={cn(
            footerActionClass,
            "border border-red-500/25 bg-zinc-900/70 text-red-200 hover:border-red-400/40 hover:bg-zinc-900",
          )}
        >
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-300">
            <Download size={15} />
          </span>
          Instalar app
        </button>

        {isAuthenticated ? (
          <>
            <NavItem
              href="/mi-cuenta"
              label="Mi cuenta"
              icon={User}
              size="compact"
              isActive={isAccountHubActive}
              onClick={onClose}
            />
            <button
              type="button"
              onClick={() => void handleLogout()}
              className={cn(
                footerActionClass,
                "bg-white/[0.02] text-zinc-300 hover:bg-white/5 hover:text-white",
              )}
            >
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] text-zinc-400 transition-colors duration-200 group-hover:border-white/20 group-hover:text-zinc-200">
                <LogOut size={15} />
              </span>
              Cerrar sesión
            </button>

            {canAccessAdminPanel &&
              adminSidebarLinks.map(({ href, label, icon: Icon }) => (
                <NavItem
                  key={href}
                  href={href}
                  label={label}
                  icon={Icon}
                  size="compact"
                  isActive={isLinkActive(href)}
                  onClick={onClose}
                />
              ))}
          </>
        ) : (
          <NavItem
            href="/login"
            label="Iniciar sesión"
            icon={LogIn}
            size="compact"
            isActive={loginIsActive}
            onClick={onClose}
          />
        )}
      </footer>
    </aside>
  );
}
