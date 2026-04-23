"use client";

import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminAppShell from "@/components/admin/AdminAppShell";
import AppViewport from "@/components/layout/AppViewport";
import { Loader2 } from "lucide-react";

const ADMIN_LOADING_MESSAGE = "Preparando el panel…";

export default function AdminPanelLayout({ children }) {
  const pathname = usePathname();
  const loginRedirect = `/login?next=${encodeURIComponent(pathname || "/admin")}`;
  const { isAuthenticated, isAdmin, authReady } = useAdminAuth({
    redirectTo: loginRedirect,
    requireAdmin: true,
  });

  const showGate = !authReady || !isAuthenticated || !isAdmin;

  if (showGate) {
    return (
      <AppViewport innerClassName="flex flex-col items-center justify-center gap-3 overflow-hidden bg-[#ececec] px-6 text-center ring-1 ring-black/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
        <p className="text-sm text-zinc-600">{ADMIN_LOADING_MESSAGE}</p>
      </AppViewport>
    );
  }

  return <AdminAppShell>{children}</AdminAppShell>;
}
