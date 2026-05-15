"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/ui/Sidebar";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scrollLock";
import { useCartStore, selectCartTotal, selectCartCount } from "@/store/useCartStore";
import { formatPrice } from "@/utils/format/price";

<<<<<<< Updated upstream
const DESKTOP_BREAKPOINT = 768;

export default function AppShell({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
=======
export default function AppShell({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
>>>>>>> Stashed changes
  const pathname = usePathname();
  const router = useRouter();
  const total = useCartStore(selectCartTotal);
  const itemCount = useCartStore(selectCartCount);
  const hasItems = itemCount > 0;

  const isCheckout = pathname?.startsWith("/checkout");
  const isProductDetail = pathname?.startsWith("/producto/");
  const isSearch = pathname === "/buscar";
<<<<<<< Updated upstream
=======
  const isArmaTuCombo = pathname === "/arma-tu-combo";
  const cartBarVisible =
    mounted &&
    hasItems &&
    !isCheckout &&
    !isProductDetail &&
    !isSearch &&
    !isArmaTuCombo;
>>>>>>> Stashed changes

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isSidebarOpen) lockBodyScroll();
    else unlockBodyScroll();
  }, [isSidebarOpen]);

  return (
<<<<<<< Updated upstream
    <div className="min-h-screen w-full bg-background">
      <div className="relative mx-auto min-h-screen w-full max-w-[480px] overflow-hidden bg-surface">
        <Navbar onMenuClick={() => setIsSidebarOpen((prev) => !prev)} />
=======
    <AppViewport
      variant="public"
      className="bg-white text-zinc-900"
      innerClassName="overflow-hidden bg-white text-zinc-900 ring-1 ring-black/5 transition-colors duration-300"
    >
      <Navbar onMenuClick={() => setIsSidebarOpen((prev) => !prev)} />
>>>>>>> Stashed changes

        <div className="relative min-h-[calc(100dvh-3.25rem)] overflow-hidden">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

          <div
            onClick={() => setIsSidebarOpen(false)}
            className={`absolute right-0 top-0 bottom-0 bg-black/30 transition-all duration-[400ms] ease-out ${
              isSidebarOpen
                ? "left-64 z-40 opacity-100 pointer-events-auto"
                : "left-0 z-30 opacity-0 pointer-events-none"
            }`}
            aria-hidden="true"
          />

<<<<<<< Updated upstream
          <div
            className={`relative z-10 min-h-full transition-transform duration-[400ms] ease-out ${
              isSidebarOpen ? "translate-x-64" : "translate-x-0"
            }`}
          >
            <main className="min-h-[calc(100dvh-3.25rem)] w-full">
              {children}
            </main>
          </div>
=======
        <div className="relative z-10 min-h-full w-full">
          <main className="min-h-[calc(100dvh-3.25rem)] w-full">{children}</main>
        </div>
      </div>

      {cartBarVisible && (
        <div className={`fixed bottom-0 left-1/2 z-30 w-full ${APP_VIEWPORT_MAX_CLASS} -translate-x-1/2 p-4`}>
          <button
            type="button"
            onClick={() => router.push("/checkout")}
            className="flex h-[45px] w-full items-center justify-between rounded-xl border border-primary bg-white p-[0.9em] text-base font-medium leading-none text-primary shadow-md transition-colors hover:bg-zinc-50"
          >
            <span>Ver mi pedido</span>
            <span className="whitespace-nowrap text-[1.2em] font-extrabold">{formatPrice(total)}</span>
          </button>
>>>>>>> Stashed changes
        </div>

        {hasItems && !isCheckout && !isProductDetail && !isSearch && (
          <div
            className="fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] transition-all duration-[400ms] ease-out"
            style={{
              transform:
                isDesktop || !isSidebarOpen
                  ? "translateX(-50%)"
                  : "translate(calc(-50% + 16rem), 0)",
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
      </div>
    </div>
  );
}