"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import AppViewport, { APP_VIEWPORT_MAX_CLASS } from "@/components/layout/AppViewport";
import Sidebar from "@/components/ui/Sidebar";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import usePwaInstallPrompt from "@/hooks/usePwaInstallPrompt";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scrollLock";
import { useCartStore, selectCartTotal, selectCartCount } from "@/store/useCartStore";
import { formatPrice } from "@/utils/format/price";

const DESKTOP_BREAKPOINT = 768;
const SIDEBAR_WIDTH = "17.5rem";

export default function AppShell({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const installState = usePwaInstallPrompt();
  const total = useCartStore(selectCartTotal);
  const itemCount = useCartStore(selectCartCount);
  const hasItems = itemCount > 0;

  const isCheckout = pathname?.startsWith("/checkout");
  const isProductDetail = pathname?.startsWith("/producto/");
  const isSearch = pathname === "/buscar";
  const cartBarVisible = hasItems && !isCheckout && !isProductDetail && !isSearch;

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
    const handler = () => setIsDesktop(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (isSidebarOpen) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }
  }, [isSidebarOpen]);

  return (
    <AppViewport variant="public" innerClassName="overflow-hidden bg-surface ring-1 ring-black/5">
      <Navbar onMenuClick={() => setIsSidebarOpen((prev) => !prev)} />

      <div className="relative min-h-[calc(100dvh-3.25rem)] overflow-hidden">
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
          <main className="min-h-[calc(100dvh-3.25rem)] w-full">{children}</main>
        </div>
      </div>

      {cartBarVisible && (
        <div
          className={`fixed bottom-0 left-1/2 z-30 w-full ${APP_VIEWPORT_MAX_CLASS} transition-all duration-[400ms] ease-out`}
          style={{
            transform:
              isDesktop || !isSidebarOpen
                ? "translateX(-50%)"
                : `translate(calc(-50% + ${SIDEBAR_WIDTH}), 0)`,
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
