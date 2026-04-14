"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Grid3X3,
  ShoppingBag,
  Tag,
  Ticket,
  ArrowLeft,
} from "lucide-react";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/categorias", label: "Categorías", icon: Grid3X3 },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/promociones", label: "Promociones", icon: Tag },
  { href: "/admin/cupones", label: "Cupones", icon: Ticket },
];

export default function AdminLayout({ children }) {
  const { isAuthenticated, isAdmin, authReady } = useAuth({ redirectTo: "/login", requireAdmin: true });
  const pathname = usePathname();

  if (!authReady || !isAuthenticated || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">Verificando acceso...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 transition hover:text-gray-600">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-lg font-bold text-primary">OA! Admin</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-4">
        {/* Nav tabs */}
        <nav className="no-scrollbar mb-6 flex gap-1 overflow-x-auto rounded-xl bg-white p-1 shadow-sm">
          {adminNav.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={14} />
                {label}
              </Link>
            );
          })}
        </nav>

        {children}
      </div>
    </div>
  );
}
