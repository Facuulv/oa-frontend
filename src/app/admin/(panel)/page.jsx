"use client";

import Link from "next/link";
import { Package, Grid3X3, Tag, Users, LayoutGrid } from "lucide-react";

const QUICK_LINKS = [
  {
    href: "/admin/categorias",
    label: "Categorías",
    hint: "Organizar el catálogo",
    icon: Grid3X3,
    tone: "bg-violet-100 text-violet-700",
  },
  {
    href: "/admin/productos",
    label: "Productos",
    hint: "Stock y fichas",
    icon: Package,
    tone: "bg-red-100 text-primary",
  },
  {
    href: "/admin/promociones",
    label: "Promociones",
    hint: "Ofertas y campañas",
    icon: Tag,
    tone: "bg-amber-100 text-amber-800",
  },
  {
    href: "/admin/usuarios",
    label: "Usuarios",
    hint: "Roles y accesos",
    icon: Users,
    tone: "bg-sky-100 text-sky-800",
  },
];

const CARD_ICON = 22;
const CARD_ICON_STROKE = 2;
/** Retardo entre cards (cascada); total ~3×delay + duración sigue bajo ~400ms. */
const QUICK_LINK_STAGGER_MS = 48;

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-9">
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200/60 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <LayoutGrid size={CARD_ICON} strokeWidth={CARD_ICON_STROKE} />
          </div>
          <div className="min-w-0 pt-0.5">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900">Centro de control</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              Gestioná la tienda con los accesos de abajo.
            </p>
          </div>
        </div>
      </section>

      <section aria-label="Accesos rápidos" className="flex flex-col gap-4">
        <h3 className="px-0.5 text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
          Accesos rápidos
        </h3>
        <ul className="grid grid-cols-1 gap-4">
          {QUICK_LINKS.map(({ href, label, hint, icon: Icon, tone }, index) => (
            <li
              key={href}
              className="admin-quick-card-enter"
              style={{ animationDelay: `${index * QUICK_LINK_STAGGER_MS}ms` }}
            >
              <Link
                href={href}
                className={[
                  "group flex w-full min-h-[5.25rem] items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200/60",
                  "transition-[transform,background-color,box-shadow] duration-200 ease-out will-change-transform",
                  "[-webkit-tap-highlight-color:transparent]",
                  "hover:bg-zinc-50/80 hover:shadow-md hover:ring-zinc-300/70",
                  "motion-safe:active:scale-[0.985] active:bg-zinc-100/80 active:shadow-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                ].join(" ")}
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 ease-out motion-safe:group-active:scale-95 ${tone}`}
                >
                  <Icon size={CARD_ICON} strokeWidth={CARD_ICON_STROKE} className="shrink-0" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <span className="block text-lg font-semibold leading-snug text-zinc-900">{label}</span>
                  <span className="mt-1 block text-xs font-medium leading-snug text-zinc-500">{hint}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
