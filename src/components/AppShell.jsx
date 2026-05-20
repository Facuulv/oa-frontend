"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import AppViewport from "@/components/layout/AppViewport";
import Sidebar from "@/components/ui/Sidebar";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import usePwaInstallPrompt from "@/hooks/usePwaInstallPrompt";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scrollLock";
import { useCartStore, selectCartTotal, selectCartCount } from "@/store/useCartStore";
import { useShallow } from "zustand/react/shallow";
import {
  PUBLIC_DESKTOP_BREAKPOINT_PX,
  PUBLIC_MAIN_SHELL_CLASS,
  PUBLIC_SIDEBAR_WIDTH,
} from "@/constants/layout";
import { formatPrice } from "@/utils/format/price";

export default function AppShell({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const installState = usePwaInstallPrompt();
  const { total, itemCount } = useCartStore(
    useShallow((state) => ({
      total: selectCartTotal(state),
      itemCount: selectCartCount(state),
    }))
  );
  const hasItems = itemCount > 0;

  const isCheckout = pathname?.startsWith("/checkout");
  const isProductDetail = pathname?.startsWith("/producto/");
  const isSearch = pathname === "/buscar";
  const isArmaTuCombo = pathname === "/arma-tu-combo";
  const cartBarVisible =
    mounted &&
    hasItems &&
    !isCheckout &&
    !isProductDetail &&
    !isSearch &&
    !isArmaTuCombo;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.add("has-public-navbar");
    body.classList.add("has-public-navbar");
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    const previousTheme = themeMeta?.getAttribute("content");
    if (themeMeta) themeMeta.setAttribute("content", "#C1121F");

    return () => {
      root.classList.remove("has-public-navbar");
      body.classList.remove("has-public-navbar");
      if (themeMeta && previousTheme != null) {
        themeMeta.setAttribute("content", previousTheme);
      }
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia(`(min-width: ${PUBLIC_DESKTOP_BREAKPOINT_PX}px)`);
    const onChange = (event) => setIsDesktop(event.matches);
    setIsDesktop(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (isSidebarOpen) lockBodyScroll();
    else unlockBodyScroll();
    return () => unlockBodyScroll();
  }, [isSidebarOpen]);

  return (
    <AppViewport variant="public" innerClassName="flex min-h-dvh flex-col ring-1 ring-black/5">
      <Navbar onMenuClick={() => setIsSidebarOpen((prev) => !prev)} />

      <div className={`${PUBLIC_MAIN_SHELL_CLASS} relative min-h-0 flex-1 overflow-hidden`}>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onInstallClick={() => setIsInstallGuideOpen(true)}
        />

        <div
          onClick={() => setIsSidebarOpen(false)}
          className={`absolute inset-0 z-40 bg-black/65 transition-opacity duration-200 ease-out ${
            isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          aria-hidden="true"
        />

        <div
          className={`relative z-10 min-h-full transition-transform duration-300 ease-out ${
            isSidebarOpen ? "translate-x-[17.5rem]" : "translate-x-0"
          }`}
        >
          <main className="w-full min-h-full">{children}</main>
        </div>
      </div>

      {cartBarVisible && (
        <div
          className="fixed bottom-0 left-0 right-0 z-30 w-full transition-all duration-[400ms] ease-out"
          style={{
            transform:
              !isSidebarOpen || isDesktop
                ? undefined
                : `translateX(${PUBLIC_SIDEBAR_WIDTH})`,
          }}
        >
          <button
            type="button"
            onClick={() => router.push("/checkout")}
            className="flex h-[45px] w-full items-center justify-between bg-primary p-[0.9em] text-base font-medium leading-none text-white shadow-[0_-4px_12px_rgba(0,0,0,0.08)] transition-all duration-200 hover:brightness-110"
          >
            <span>Ver mi pedido</span>
            <span className="whitespace-nowrap text-[1.2em] font-extrabold">
              {formatPrice(total)}
            </span>
          </button>
        </div>
      )}

      <InstallPrompt
        hidden={isSidebarOpen}
        isOpen={isInstallGuideOpen}
        onClose={() => setIsInstallGuideOpen(false)}
        installState={installState}
      />
    </AppViewport>
  );
}