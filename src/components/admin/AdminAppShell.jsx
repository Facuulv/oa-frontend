"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Grid3X3,
  Tag,
  Users,
  Menu,
  X,
  LogOut,
  Store,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import AppViewport from "@/components/layout/AppViewport";
import { useAuthStore, selectCanManageUsers } from "@/store/useAuthStore";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scrollLock";
import { toast } from "@/lib/toast";

/** Misma anchura que el menú lateral público (`Sidebar` + `AppShell`). */
const DRAWER_WIDTH_CLASS = "w-64";

const NAV_ITEMS = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard },
  { href: "/admin/categorias", label: "Categorías", icon: Grid3X3 },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/promociones", label: "Promociones", icon: Tag },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
];

const [PANEL_ITEM, ...NAV_ITEMS_REST_ALL] = NAV_ITEMS;

function navItemActive(pathname, href) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminAppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const canManageUsers = useAuthStore(selectCanManageUsers);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItemsRest = useMemo(
    () =>
      NAV_ITEMS_REST_ALL.filter(
        (item) => item.href !== "/admin/usuarios" || canManageUsers
      ),
    [canManageUsers]
  );

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, [drawerOpen]);

  const closeDrawer = () => setDrawerOpen(false);

  const handleLogout = async () => {
    closeDrawer();
    try {
      await logout();
    } catch {
      // el store igual limpia sesión local
    }
    toast.success("Sesión cerrada");
    router.replace("/");
  };

  /** Área bajo el header: flex + min-h-0 para que `main` sea el único scroll (rueda del mouse / touch). */
  const mainScrollClass =
    "admin-shell-scroll min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain";

  return (
    <AppViewport variant="admin" innerClassName="h-[100dvh] max-h-[100dvh] min-h-0 overflow-hidden bg-[#ececec] ring-1 ring-black/5">
      <header
        className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-zinc-200/90 bg-white/95 px-3 backdrop-blur-md supports-[backdrop-filter]:bg-white/85"
        aria-label="Administración"
      >
        <div className="flex min-w-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setDrawerOpen((prev) => !prev)}
            className="admin-pressable flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-zinc-800 shadow-sm active:bg-zinc-100 active:shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
            aria-label={drawerOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={drawerOpen}
            aria-controls="admin-drawer"
          >
            <Menu size={22} strokeWidth={2.25} />
          </button>
          <BrandLogo href="/admin" className="min-w-0" ariaLabel="Panel" />
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="admin-pressable flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-zinc-600 shadow-sm active:bg-zinc-100 active:shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
          aria-label="Cerrar sesión"
        >
          <LogOut size={20} strokeWidth={2.25} />
        </button>
      </header>

      {/* Misma idea que `AppShell`: drawer + overlay + contenido viven bajo el header, no encima. */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-x-hidden">
        <aside
          id="admin-drawer"
          aria-hidden={!drawerOpen}
          className={`absolute left-0 top-0 z-40 h-full ${DRAWER_WIDTH_CLASS} bg-white shadow-xl transition-transform duration-[400ms] ease-out ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full min-h-0 flex-col">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-zinc-100 px-3 py-2.5">
              <Link
                href={PANEL_ITEM.href}
                onClick={closeDrawer}
                className={`admin-pressable inline-flex max-w-[calc(100%-3.25rem)] min-h-11 min-w-0 items-center gap-2.5 rounded-xl py-2 text-base font-medium shadow-sm active:shadow-[0_1px_2px_rgba(0,0,0,0.08)] ${
                  navItemActive(pathname, PANEL_ITEM.href)
                    ? "min-w-[10.25rem] bg-primary px-4 text-white active:shadow-[0_1px_4px_rgba(0,0,0,0.18)]"
                    : "bg-zinc-50 px-3 text-zinc-800 active:bg-zinc-100"
                }`}
              >
                <PANEL_ITEM.icon size={22} strokeWidth={2} className="shrink-0 opacity-90" />
                {PANEL_ITEM.label}
              </Link>
              <button
                type="button"
                onClick={closeDrawer}
                className="admin-pressable flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-zinc-900 shadow-sm active:bg-zinc-200/80 active:shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                aria-label="Cerrar menú"
              >
                <X size={26} strokeWidth={2.25} />
              </button>
            </div>

            <nav
              className="admin-shell-scroll flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3 pt-2"
              aria-label="Administración"
            >
              {navItemsRest.map(({ href, label, icon: Icon }) => {
                const active = navItemActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={closeDrawer}
                    className={`admin-pressable flex min-h-12 items-center gap-3 rounded-xl px-3.5 py-3 text-base font-medium shadow-sm active:shadow-[0_1px_2px_rgba(0,0,0,0.08)] ${
                      active
                        ? "bg-primary text-white active:shadow-[0_1px_4px_rgba(0,0,0,0.18)]"
                        : "bg-zinc-50 text-zinc-800 active:bg-zinc-100"
                    }`}
                  >
                    <Icon size={22} strokeWidth={2} className="shrink-0 opacity-90" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="shrink-0 border-t border-zinc-100 p-3">
              <Link
                href="/"
                onClick={closeDrawer}
                className="admin-pressable mb-2 flex min-h-12 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-3 text-base font-medium text-zinc-700 shadow-sm active:bg-zinc-50 active:shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
              >
                <Store size={20} />
                Ir a la tienda
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="admin-pressable flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-3 py-3 text-base font-medium text-white shadow-sm active:bg-zinc-800 active:shadow-[0_1px_3px_rgba(0,0,0,0.35)]"
              >
                <LogOut size={20} />
                Cerrar sesión
              </button>
            </div>
          </div>
        </aside>

        <div
          onClick={closeDrawer}
          className={`absolute right-0 top-0 bg-black/30 transition-all duration-[400ms] ease-out ${
            drawerOpen
              ? "bottom-0 left-64 z-40 opacity-100 pointer-events-auto"
              : "bottom-0 left-0 z-30 opacity-0 pointer-events-none"
          }`}
          aria-hidden="true"
        />

        <div
          className={`relative z-10 flex min-h-0 flex-1 flex-col transition-transform duration-[400ms] ease-out ${
            drawerOpen ? "translate-x-64" : "translate-x-0"
          }`}
        >
          <main className={mainScrollClass}>
            <div className="flex flex-col px-4 pb-8 pt-5">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AppViewport>
  );
}
