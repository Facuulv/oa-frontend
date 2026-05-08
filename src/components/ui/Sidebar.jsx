"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingCart,
  Tag,
  User,
  LogIn,
  Settings,
  Download,
  X,
} from "lucide-react";
import { useAuthStore, selectCanAccessAdminPanel, selectIsClienteUser } from "@/store/useAuthStore";

const publicLinks = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/promociones", label: "Promociones", icon: Tag },
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
  const [greeting, setGreeting] = useState("Hola");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated && selectIsClienteUser(s));
  const canAccessAdminPanel = useAuthStore(selectCanAccessAdminPanel);

  const handleInstallClick = () => {
    onClose?.();
    onInstallClick?.();
  };

  const isLinkActive = (href) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

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
      className={`absolute left-0 top-0 z-50 h-full w-[17.5rem] max-w-[85vw] transform-gpu border-r border-white/10 bg-zinc-950/98 shadow-2xl backdrop-blur-[1px] will-change-transform transition-transform duration-200 ease-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="px-5 pt-5">
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

        <div className="flex min-h-0 flex-1 flex-col justify-between px-5 pb-5 pt-4">
          <nav className="space-y-2 overflow-y-auto px-1">
            {publicLinks.map(({ href, label, icon: Icon }) => {
              const isActive = isLinkActive(href);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-red-500/15 text-red-100 ring-1 ring-red-400/30"
                      : "bg-white/[0.02] text-zinc-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-xl border transition-colors duration-200 ${
                      isActive
                        ? "border-red-400/30 bg-red-500/15 text-red-300"
                        : "border-white/10 bg-white/[0.02] text-zinc-400 group-hover:border-white/20 group-hover:text-zinc-200"
                    }`}
                  >
                    <Icon size={16} />
                  </span>
                  <span>{label}</span>
                </Link>
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

          <div className="mt-4 space-y-2 border-t border-white/10 px-1 pt-4">
            {isAuthenticated ? (
              <>
                {authLinks.map(({ href, label, icon: Icon }) => {
                  const isActive = isLinkActive(href);

                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? "bg-red-500/15 text-red-100 ring-1 ring-red-400/30"
                          : "bg-white/[0.02] text-zinc-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-xl border transition-colors duration-200 ${
                          isActive
                            ? "border-red-400/30 bg-red-500/15 text-red-300"
                            : "border-white/10 bg-white/[0.02] text-zinc-400 group-hover:border-white/20 group-hover:text-zinc-200"
                        }`}
                      >
                        <Icon size={16} />
                      </span>
                      <span>{label}</span>
                    </Link>
                  );
                })}

                {canAccessAdminPanel &&
                  adminLinks.map(({ href, label, icon: Icon }) => {
                    const isActive = isLinkActive(href);

                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={onClose}
                        className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors duration-200 ${
                          isActive
                            ? "bg-red-500/15 text-red-100 ring-1 ring-red-400/30"
                            : "bg-white/[0.02] text-zinc-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-xl border transition-colors duration-200 ${
                            isActive
                              ? "border-red-400/30 bg-red-500/15 text-red-300"
                              : "border-white/10 bg-white/[0.02] text-zinc-400 group-hover:border-white/20 group-hover:text-zinc-200"
                          }`}
                        >
                          <Icon size={16} />
                        </span>
                        <span>{label}</span>
                      </Link>
                    );
                  })}
              </>
            ) : (
              <Link
                href="/login"
                onClick={onClose}
                className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors duration-200 ${
                  isLinkActive("/login")
                    ? "bg-red-500/15 text-red-100 ring-1 ring-red-400/30"
                    : "bg-white/[0.02] text-zinc-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-xl border transition-colors duration-200 ${
                    isLinkActive("/login")
                      ? "border-red-400/30 bg-red-500/15 text-red-300"
                      : "border-white/10 bg-white/[0.02] text-zinc-400 group-hover:border-white/20 group-hover:text-zinc-200"
                  }`}
                >
                  <LogIn size={16} />
                </span>
                <span>Iniciar sesión</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
