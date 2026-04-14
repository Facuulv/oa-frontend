"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, ShoppingCart, X, User } from "lucide-react";
import { useCartStore, selectCartCount } from "@/store/useCartStore";
import { useAuthStore, selectIsAuthenticated } from "@/store/useAuthStore";

export default function Navbar({ onMenuClick }) {
  const router = useRouter();
  const totalItems = useCartStore(selectCartCount);
  const searchQuery = useCartStore((s) => s.searchQuery);
  const setSearchQuery = useCartStore((s) => s.setSearchQuery);
  const clearSearch = useCartStore((s) => s.clearSearch);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    clearSearch();
  };

  const handleSearchSubmit = () => {
    const q = (searchQuery ?? "").trim();
    if (q) {
      router.push(`/buscar?q=${encodeURIComponent(q)}`);
      setIsSearchOpen(false);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-primary shadow-lg">
      <div className="flex h-13 w-full items-center justify-between px-3">
        {isSearchOpen ? (
          <>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onMenuClick}
                className="rounded-md p-1 text-white/90"
                aria-label="Abrir menú"
              >
                <Menu size={26} />
              </button>
              <Link href="/" className="text-xl font-bold text-white" aria-label="Inicio">
                OA!
              </Link>
            </div>

            <div className="navbar-search-expand relative ml-2 flex h-8 min-w-0 items-center rounded-lg bg-white/95 pl-2 pr-8">
              <Search size={15} className="shrink-0 text-slate-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Buscar..."
                className="ml-1.5 min-w-0 flex-1 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
                aria-label="Buscar productos"
              />
              <button
                type="button"
                onClick={handleCloseSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 transition hover:bg-slate-200/60"
                aria-label="Cerrar búsqueda"
              >
                <X size={16} />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onMenuClick}
                className="rounded-md p-1 text-white/90"
                aria-label="Abrir menú"
              >
                <Menu size={26} />
              </button>
              <Link href="/" className="text-xl font-bold text-white" aria-label="Inicio">
                OA!
              </Link>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href="/checkout"
                className="relative rounded-md p-1 text-white/90"
                aria-label="Ver carrito"
              >
                <ShoppingCart size={22} />
                {totalItems > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </Link>

              <Link
                href={isAuthenticated ? "/mi-cuenta" : "/login"}
                className="rounded-md p-1 text-white/90"
                aria-label={isAuthenticated ? "Mi cuenta" : "Iniciar sesión"}
              >
                <User size={22} />
              </Link>

              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="rounded-md p-1 text-white/90"
                aria-label="Buscar productos"
              >
                <Search size={22} />
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
