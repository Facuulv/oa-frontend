"use client";

import { useMemo } from "react";
import { Package, Grid3X3, Tag, Users } from "lucide-react";
import { useAuthStore, selectAuthUser, selectCanManageUsers } from "@/store/useAuthStore";
import AdminWelcomeCard from "@/components/admin/AdminWelcomeCard";
import AdminQuickLinkCard from "@/components/admin/AdminQuickLinkCard";

const QUICK_LINKS_ALL = [
  {
    href: "/admin/productos",
    label: "Productos",
    hint: "Gestionar productos y stock",
    icon: Package,
    themeKey: "productos",
    requiresUserAdmin: false,
  },
  {
    href: "/admin/promociones",
    label: "Combos",
    hint: "Armá nuevos combos",
    icon: Tag,
    themeKey: "promociones",
    requiresUserAdmin: false,
  },
  {
    href: "/admin/categorias",
    label: "Categorías",
    hint: "Gestionar categorías",
    icon: Grid3X3,
    themeKey: "categorias",
    requiresUserAdmin: false,
  },
  {
    href: "/admin/usuarios",
    label: "Usuarios",
    hint: "Creá nuevos usuarios",
    icon: Users,
    themeKey: "usuarios",
    requiresUserAdmin: true,
  },
];

const QUICK_LINK_STAGGER_MS = 48;

export default function AdminDashboard() {
  const user = useAuthStore(selectAuthUser);
  const canManageUsers = useAuthStore(selectCanManageUsers);
  const greetName = (user?.nombre ?? user?.name ?? "").trim() || "Admin";
  const quickLinks = useMemo(
    () =>
      QUICK_LINKS_ALL.filter((l) => !l.requiresUserAdmin || canManageUsers).map(
        ({ requiresUserAdmin: _r, ...link }) => link
      ),
    [canManageUsers]
  );

  return (
    <div className="flex flex-col gap-6 sm:gap-7">
      <AdminWelcomeCard greetName={greetName} />

      <section aria-label="Atajos" className="flex flex-col gap-3">
        <h3 className="px-0.5 text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400 sm:text-sm">
          Atajos
        </h3>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5">
          {quickLinks.map((link, index) => (
            <AdminQuickLinkCard
              key={link.href}
              {...link}
              animationDelay={index * QUICK_LINK_STAGGER_MS}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}
