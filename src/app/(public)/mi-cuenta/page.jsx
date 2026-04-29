"use client";

import { useClientAuth } from "@/hooks/useClientAuth";
import { useRouter } from "next/navigation";
import { User, LogOut, Package, ChevronRight } from "lucide-react";

export default function MiCuentaPage() {
  const { user, isAuthenticated, logout, loading } = useClientAuth({
    redirectTo: "/login",
    requireCliente: true,
  });
  const router = useRouter();

  if (loading || !isAuthenticated) return null;

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // sesión local ya limpia
    }
    router.push("/");
  };

  return (
    <div className="px-4 py-4">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <User size={24} className="text-primary" />
        </div>
        <div>
          <p className="font-semibold text-gray-800">{user?.nombre ?? user?.name ?? "Usuario"}</p>
          <p className="text-xs text-gray-500">{user?.email ?? ""}</p>
        </div>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => router.push("/mi-cuenta")}
          className="flex w-full items-center justify-between rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <Package size={18} className="text-gray-400" />
            <span className="text-sm text-gray-700">Mis pedidos</span>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl bg-white p-4 text-red-500 shadow-sm transition hover:shadow-md"
        >
          <LogOut size={18} />
          <span className="text-sm">Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}
