"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import BrandLogo from "@/components/BrandLogo";
import NavbarSessionAvatar from "@/components/account/NavbarSessionAvatar";
import { useCartStore, selectCartCount } from "@/store/useCartStore";
import {
  useAuthStore,
  selectAuthUser,
  selectIsAuthenticatedCliente,
} from "@/store/useAuthStore";

export default function Navbar({ onMenuClick }) {
  const router = useRouter();
  const { totalItems, searchQuery, setSearchQuery, clearSearch } = useCartStore(
    useShallow((s) => ({
      totalItems: selectCartCount(s),
      searchQuery: s.searchQuery,
      setSearchQuery: s.setSearchQuery,
      clearSearch: s.clearSearch,
    }))
  );
  const isAuthenticated = useAuthStore(selectIsAuthenticatedCliente);
  const user = useAuthStore(selectAuthUser);
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  const showCartBadge = mounted && totalItems > 0;
  const showAuthenticated = mounted && isAuthenticated;
  const accountHref = showAuthenticated ? "/mi-cuenta" : "/login";
  const accountAriaLabel = showAuthenticated
    ? "Mi cuenta, sesión activa"
    : "Iniciar sesión";
  const accountTitle = showAuthenticated ? "Mi cuenta" : "Ingresar";

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
    <header className="app-public-navbar">
      <div className="app-public-navbar__inner">
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
              <BrandLogo priority />
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
              <BrandLogo priority />
            </div>

            <div className="flex items-center gap-1">
              <Link
                href="/checkout"
                className="relative rounded-md p-1 text-white/90"
                aria-label="Ver carrito"
              >
                <ShoppingCart size={22} />
                {showCartBadge && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </Link>

              <Link
                href={accountHref}
                title={accountTitle}
                className="navbar-account-trigger inline-flex h-8 w-8 items-center justify-center rounded-full text-white outline-none transition duration-200 active:scale-95 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                aria-label={accountAriaLabel}
              >
                <NavbarSessionAvatar
                  isAuthenticated={showAuthenticated}
                  user={user}
                />
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
