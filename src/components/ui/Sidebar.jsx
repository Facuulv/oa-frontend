"use client";

import Link from "next/link";
import {
  Home,
  Grid3X3,
  ShoppingCart,
  Tag,
  User,
  LogIn,
  Settings,
  X,
} from "lucide-react";
import { useAuthStore, selectIsAuthenticated, selectIsAdmin } from "@/store/useAuthStore";

const publicLinks = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/categoria/all", label: "Catálogo", icon: Grid3X3 },
  { href: "/promociones", label: "Promociones", icon: Tag },
  { href: "/checkout", label: "Mi carrito", icon: ShoppingCart },
];

const authLinks = [
  { href: "/mi-cuenta", label: "Mi cuenta", icon: User },
];

const adminLinks = [
  { href: "/admin", label: "Panel admin", icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isAdmin = useAuthStore(selectIsAdmin);

  return (
    <aside
      className={`absolute left-0 top-0 z-40 h-full w-64 bg-white shadow-xl transition-transform duration-[400ms] ease-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-lg font-bold text-primary">OA!</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {publicLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              <Icon size={18} className="text-gray-400" />
              {label}
            </Link>
          ))}

          <hr className="my-2" />

          {isAuthenticated ? (
            <>
              {authLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  <Icon size={18} className="text-gray-400" />
                  {label}
                </Link>
              ))}
              {isAdmin &&
                adminLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-primary transition hover:bg-primary/5"
                  >
                    <Icon size={18} className="text-primary" />
                    {label}
                  </Link>
                ))}
            </>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              <LogIn size={18} className="text-gray-400" />
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </aside>
  );
}
