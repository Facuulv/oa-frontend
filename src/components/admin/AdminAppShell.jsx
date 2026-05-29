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
  Settings,
  Menu,
  X,
  LogOut,
  Store,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import AppViewport from "@/components/layout/AppViewport";
import {
  useAuthStore,
  selectCanManageUsers,
  selectIsAdminRole,
  selectAuthUser,
} from "@/store/useAuthStore";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scrollLock";
import { toast } from "@/lib/toast";

const SIDEBAR_WIDTH_CLASS = "w-[17.5rem] max-w-[85vw] lg:max-w-none";
/** Altura unificada de topbars admin (sidebar móvil y drawer dependen de esto). */
const TOPBAR_HEIGHT_CLASS = "h-[3.75rem]";
const TOPBAR_TOP_CLASS = "top-[3.75rem]";
const TOPBAR_DRAWER_HEIGHT_CLASS = "h-[calc(100dvh-3.75rem)]";

const NAV_ITEMS = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/promociones", label: "Combos", icon: Tag },
  { href: "/admin/categorias", label: "Categorías", icon: Grid3X3 },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users, adminOnly: true },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings, adminOnly: true },
];

function navItemActive(pathname, href) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function userDisplayName(user) {
  const name = (user?.nombre ?? user?.name ?? "").trim();
  return name || "Admin";
}

function userInitials(user) {
  const name = (user?.nombre ?? user?.name ?? "").trim();
  if (!name) return "A";
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function userRoleLabel(user) {
  const rol = user?.rol ?? user?.role;
  if (!rol) return "Administrador";
  return String(rol).replace(/_/g, " ");
}

function AdminUserBadge({ user, compact = false }) {
  return (
    <div
      className={`flex min-w-0 items-center rounded-lg border border-zinc-200/80 bg-zinc-50/60 ${
        compact
          ? "max-w-[9.5rem] gap-1.5 px-1.5 py-0.5 sm:max-w-[11rem]"
          : "gap-2 px-2.5 py-1"
      }`}
      title={`${userDisplayName(user)} · ${userRoleLabel(user)}`}
    >
      <span
        className={`flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary ring-1 ring-primary/15 ${
          compact ? "h-7 w-7 text-[10px]" : "h-8 w-8 text-xs"
        }`}
        aria-hidden
      >
        {userInitials(user)}
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className={`truncate font-semibold text-zinc-900 ${compact ? "text-[11px]" : "text-xs"}`}>
          {userDisplayName(user)}
        </p>
        <p
          className={`truncate capitalize text-zinc-500 ${compact ? "text-[10px]" : "text-[11px]"}`}
        >
          {userRoleLabel(user)}
        </p>
      </div>
    </div>
  );
}

function AdminNavLink({ href, label, icon: Icon, active, onNavigate }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors duration-200 ${
        active
          ? "bg-primary/10 text-primary ring-1 ring-primary/25"
          : "bg-zinc-50/80 text-zinc-700 ring-1 ring-zinc-200/60 hover:bg-zinc-100/90 hover:text-zinc-900"
      }`}
    >
      <span
        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 transition-colors duration-200 ${
          active
            ? "bg-primary/15 text-primary ring-primary/20"
            : "bg-white text-zinc-500 ring-zinc-200/80 group-hover:text-zinc-700"
        }`}
      >
        <Icon size={18} strokeWidth={2} aria-hidden />
      </span>
      <span>{label}</span>
    </Link>
  );
}

export default function AdminAppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore(selectAuthUser);
  const canManageUsers = useAuthStore(selectCanManageUsers);
  const isAdminRole = useAuthStore(selectIsAdminRole);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLg, setIsLg] = useState(false);

  const navItems = useMemo(
    () =>
      NAV_ITEMS.filter((item) => {
        if (item.adminOnly) return isAdminRole;
        if (item.href === "/admin/usuarios") return canManageUsers;
        return true;
      }),
    [canManageUsers, isAdminRole]
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsLg(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen || isLg) return undefined;
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, [drawerOpen, isLg]);

  const closeDrawer = () => setDrawerOpen(false);
  const drawerVisible = isLg || drawerOpen;

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

  const mainScrollClass =
    "admin-shell-scroll min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain";

  const topbarClass = [
    "sticky top-0 z-50 flex shrink-0 items-center justify-between gap-2",
    TOPBAR_HEIGHT_CLASS,
    "border-b border-zinc-200/80 bg-white/95 px-3",
    "shadow-[0_1px_0_rgba(0,0,0,0.03)] backdrop-blur-md supports-[backdrop-filter]:bg-white/88",
  ].join(" ");

  const sidebarContent = (
    <>
      <div className="shrink-0 px-4 pt-4 lg:pt-5">
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50/80 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-lg font-semibold tracking-tight text-zinc-900">OA! Bebidas</p>
              <p className="text-xs font-medium text-zinc-500">Administración</p>
            </div>
            <button
              type="button"
              onClick={closeDrawer}
              className="admin-pressable -mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200/90 bg-white text-zinc-600 transition-colors duration-200 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 lg:hidden"
              aria-label="Cerrar menú"
            >
              <X size={18} strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </div>

      <nav
        className="admin-shell-scroll min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4"
        aria-label="Administración"
      >
        {navItems.map(({ href, label, icon }) => (
          <AdminNavLink
            key={href}
            href={href}
            label={label}
            icon={icon}
            active={navItemActive(pathname, href)}
            onNavigate={closeDrawer}
          />
        ))}
      </nav>

      <div className="shrink-0 space-y-2 border-t border-zinc-200/80 p-4">
        <Link
          href="/"
          onClick={closeDrawer}
          className="admin-pressable flex min-h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200/90 bg-white px-3 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 active:bg-zinc-100"
        >
          <Store size={18} strokeWidth={2} aria-hidden />
          Ir a la carta pública
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="admin-pressable flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 active:bg-zinc-950"
        >
          <LogOut size={18} strokeWidth={2} aria-hidden />
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <AppViewport
      variant="admin"
      innerClassName="flex h-[100dvh] max-h-[100dvh] min-h-0 flex-col overflow-hidden bg-[#e8e8eb] ring-1 ring-black/[0.04]"
    >
      <header className={`${topbarClass} lg:hidden`} aria-label="Administración">
        <div className="flex min-w-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setDrawerOpen((prev) => !prev)}
            className="admin-pressable flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zinc-800 shadow-sm active:bg-zinc-100 active:shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
            aria-label={drawerOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={drawerOpen}
            aria-controls="admin-drawer"
          >
            <Menu size={22} strokeWidth={2.25} />
          </button>
          <BrandLogo href="/admin" className="min-w-0" ariaLabel="Panel" />
        </div>
        <div className="flex min-w-0 shrink items-center gap-1.5">
          <AdminUserBadge user={user} compact />
          <button
            type="button"
            onClick={handleLogout}
            className="admin-pressable flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zinc-600 shadow-sm active:bg-zinc-100 active:shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
            aria-label="Cerrar sesión"
          >
            <LogOut size={20} strokeWidth={2.25} />
          </button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-x-hidden lg:flex-row">
        <aside
          id="admin-drawer"
          aria-hidden={!drawerVisible}
          className={[
            "z-40 flex shrink-0 flex-col border-r border-zinc-200/90 bg-white",
            SIDEBAR_WIDTH_CLASS,
            "transform-gpu transition-transform duration-200 ease-out will-change-transform",
            `fixed left-0 ${TOPBAR_TOP_CLASS} ${TOPBAR_DRAWER_HEIGHT_CLASS} shadow-xl`,
            drawerOpen ? "translate-x-0" : "-translate-x-full",
            "lg:static lg:top-auto lg:h-full lg:translate-x-0 lg:shadow-none",
          ].join(" ")}
        >
          {sidebarContent}
        </aside>

        <div
          onClick={closeDrawer}
          className={`fixed inset-0 ${TOPBAR_TOP_CLASS} z-30 bg-black/60 transition-opacity duration-200 ease-out lg:hidden ${
            drawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden="true"
        />

        <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col">
          <header className={`${topbarClass} hidden lg:flex`} aria-label="Administración">
            <BrandLogo href="/admin" className="min-w-0" ariaLabel="Panel" />
            <div className="ml-auto flex items-center gap-2">
              <AdminUserBadge user={user} />
              <button
                type="button"
                onClick={handleLogout}
                className="admin-pressable flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zinc-600 shadow-sm active:bg-zinc-100 active:shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                aria-label="Cerrar sesión"
              >
                <LogOut size={20} strokeWidth={2.25} />
              </button>
            </div>
          </header>

          <main className={mainScrollClass}>
            <div className="flex flex-col px-4 pb-8 pt-5">{children}</div>
          </main>
        </div>
      </div>
    </AppViewport>
  );
}
