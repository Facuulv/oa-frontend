"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Package, Grid3X3, Tag, Users, LayoutGrid } from "lucide-react";
import { useAuthStore, selectAuthUser, selectCanManageUsers } from "@/store/useAuthStore";

const QUICK_LINKS_ALL = [
  {
    href: "/admin/productos",
    label: "Productos",
    hint: "Stock",
    icon: Package,
    tone: "bg-red-100 text-primary",
    requiresUserAdmin: false,
  },
  {
    href: "/admin/promociones",
    label: "Promociones",
    hint: "Combos",
    icon: Tag,
    tone: "bg-amber-100 text-amber-900",
    requiresUserAdmin: false,
  },
  {
    href: "/admin/categorias",
    label: "Categorías",
    hint: "Secciones",
    icon: Grid3X3,
    tone: "bg-violet-100 text-violet-800",
    requiresUserAdmin: false,
  },
  {
    href: "/admin/usuarios",
    label: "Usuarios",
    hint: "Roles",
    icon: Users,
    tone: "bg-sky-100 text-sky-900",
    requiresUserAdmin: true,
  },
];

const QUICK_LINK_ICON = 36;
const QUICK_LINK_ICON_STROKE = 2;
const HERO_ICON = 44;
const HERO_ICON_STROKE = 2;
/** Retardo entre cards (cascada); total ~3×delay + duración sigue bajo ~400ms. */
const QUICK_LINK_STAGGER_MS = 48;

export default function AdminDashboard() {
  const user = useAuthStore(selectAuthUser);
  const canManageUsers = useAuthStore(selectCanManageUsers);
  const greetName = (user?.nombre ?? user?.name ?? "").trim() || null;
  const quickLinks = useMemo(
    () =>
      QUICK_LINKS_ALL.filter((l) => !l.requiresUserAdmin || canManageUsers).map(
        ({ requiresUserAdmin: _r, ...link }) => link
      ),
    [canManageUsers]
  );

  return (
    <div className="flex flex-col gap-8">
      <section
        className={[
          "relative isolate min-h-[132px] overflow-hidden rounded-2xl shadow-md ring-1 ring-zinc-200/60",
          "bg-gradient-to-br from-zinc-100/70 via-white to-zinc-50/90",
          "px-6 py-8 sm:min-h-0 sm:px-8 sm:py-9",
        ].join(" ")}
      >
        <div className="flex h-full min-h-[inherit] items-center gap-6 sm:items-start sm:gap-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/10">
            <LayoutGrid size={HERO_ICON} strokeWidth={HERO_ICON_STROKE} aria-hidden />
          </div>
          <div className="min-w-0 sm:pt-0.5">
            {greetName ? (
              <p className="text-sm font-medium tracking-tight text-zinc-500/85">Hola, {greetName}</p>
            ) : null}
            <h2
              className={[
                "text-[1.35rem] font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-2xl",
                greetName ? "mt-1" : "",
              ].join(" ")}
            >
              Panel
            </h2>
            <p className="mt-2 text-sm font-normal leading-relaxed text-zinc-500/70">Lo esencial primero.</p>
          </div>
        </div>
      </section>

      <section aria-label="Atajos" className="flex flex-col gap-7">
        <h3 className="px-1 text-sm font-semibold uppercase tracking-[0.06em] text-zinc-400">
          Atajos
        </h3>
        <ul className="flex flex-col gap-6">
          {quickLinks.map(({ href, label, hint, icon: Icon, tone }, index) => (
            <li
              key={href}
              className="admin-quick-card-enter"
              style={{ animationDelay: `${index * QUICK_LINK_STAGGER_MS}ms` }}
            >
              <Link
                href={href}
                className={[
                  "admin-pressable group flex w-full min-h-[5.25rem] items-center gap-6 rounded-2xl bg-white px-6 py-6 shadow-sm ring-1 ring-zinc-200/55 sm:px-7",
                  "hover:bg-zinc-50 hover:shadow-md hover:ring-zinc-300/65",
                  "active:bg-zinc-100/90 active:shadow-[0_1px_2px_rgba(0,0,0,0.08)] active:ring-zinc-300/50",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                ].join(" ")}
              >
                <div
                  className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] ring-1 ring-black/[0.04] ${tone}`}
                >
                  <Icon
                    size={QUICK_LINK_ICON}
                    strokeWidth={QUICK_LINK_ICON_STROKE}
                    className="shrink-0"
                    aria-hidden
                  />
                </div>
                <div className="min-w-0 flex-1 py-0.5 text-left">
                  <span className="block text-xl font-bold leading-tight tracking-tight text-zinc-900">{label}</span>
                  <span className="mt-1.5 block text-sm font-normal leading-snug text-zinc-400/90">{hint}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
