"use client";

import { Package, Grid3X3, ShoppingBag, Tag, Ticket } from "lucide-react";
import Link from "next/link";

const cards = [
  { href: "/admin/productos", label: "Productos", icon: Package, color: "bg-blue-50 text-blue-600" },
  { href: "/admin/categorias", label: "Categorías", icon: Grid3X3, color: "bg-purple-50 text-purple-600" },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag, color: "bg-green-50 text-green-600" },
  { href: "/admin/promociones", label: "Promociones", icon: Tag, color: "bg-amber-50 text-amber-600" },
  { href: "/admin/cupones", label: "Cupones", icon: Ticket, color: "bg-pink-50 text-pink-600" },
];

export default function AdminDashboard() {
  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-gray-800">Panel de administración</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map(({ href, label, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
              <Icon size={20} />
            </div>
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
