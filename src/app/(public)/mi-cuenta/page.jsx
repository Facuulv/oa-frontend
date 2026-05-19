"use client";

import { useClientAuth } from "@/hooks/useClientAuth";
import { useRouter } from "next/navigation";
import {
  User,
  LogOut,
  Package,
  ChevronRight,
  Sparkles,
  MapPin,
} from "lucide-react";
import AccountProfileHero from "@/components/account/AccountProfileHero";
import { getUserDisplayName } from "@/utils/account/userDisplay";
import { isProfileIncomplete } from "@/utils/account/profileHelpers";
import ProfileIncompleteBanner from "@/components/account/ProfileIncompleteBanner";
import { useSavedCombosStore, selectSavedCombos } from "@/store/useSavedCombosStore";
import { useEffect } from "react";

export default function MiCuentaPage() {
  const { user, isAuthenticated, logout, loading } = useClientAuth({
    redirectTo: "/login?next=%2Fmi-cuenta",
    requireCliente: true,
  });
  const router = useRouter();
  const savedCombos = useSavedCombosStore(selectSavedCombos);
  const syncCombosFromApi = useSavedCombosStore((s) => s.syncCombosFromApi);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      void syncCombosFromApi();
    }
  }, [loading, isAuthenticated, syncCombosFromApi]);

  if (loading || !isAuthenticated) return null;

  const displayName = getUserDisplayName(user);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // sesión local ya limpia
    }
    router.push("/");
  };

  const quickInfo = [
    {
      key: "datos",
      title: "Mis datos",
      subtitle: "Editá tu perfil y mantené tus datos actualizados.",
      icon: User,
      cta: "Ver mis datos",
      onClick: () => router.push("/mi-cuenta/datos"),
    },
    {
      key: "pedidos",
      title: "Mis pedidos",
      subtitle: "Seguí tus compras y revisá el detalle completo.",
      icon: Package,
      cta: "Ir a mis pedidos",
      onClick: () => router.push("/mis-pedidos"),
    },
    {
      key: "combos",
      title: "Mis combos",
      subtitle: "Recuperá combos guardados y volvé a pedir rápido.",
      icon: Sparkles,
      cta: "Ver mis combos",
      badge: `${savedCombos.length}`,
      onClick: () => router.push("/mi-cuenta/combos"),
    },
    {
      key: "direcciones",
      title: "Direcciones",
      subtitle: "Guardá direcciones favoritas. Disponible pronto.",
      icon: MapPin,
      cta: "Próximamente",
      disabled: true,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-4">
      <AccountProfileHero
        user={user}
        displayName={displayName}
        email={user?.email ?? ""}
      />

      <div className="mt-4 space-y-3">
        {isProfileIncomplete(user) && <ProfileIncompleteBanner />}

        {quickInfo.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={item.onClick}
              disabled={item.disabled}
              className={`group w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition ${
                item.disabled
                  ? "cursor-not-allowed border-zinc-100 opacity-75"
                  : "border-zinc-200 active:scale-[0.99] hover:border-zinc-300 hover:shadow-md"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-zinc-900">{item.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">{item.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">
                      {item.badge}
                    </span>
                  )}
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition group-hover:bg-red-50 group-hover:text-red-600">
                    <Icon size={18} />
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-primary">{item.cta}</span>
                {!item.disabled && <ChevronRight size={16} className="text-zinc-400" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-between rounded-2xl border border-red-100 bg-white p-4 text-red-600 shadow-sm transition active:scale-[0.99] hover:border-red-200 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
              <LogOut size={18} />
            </span>
            <span className="text-sm font-semibold">Cerrar sesión</span>
          </div>
          <ChevronRight size={16} className="text-red-300" />
        </button>
      </div>
    </div>
  );
}
