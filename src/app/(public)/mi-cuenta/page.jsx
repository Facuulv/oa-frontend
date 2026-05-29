"use client";

import { useClientAuth } from "@/hooks/useClientAuth";
import { useRouter } from "next/navigation";
import { User, LogOut, Package, Sparkles, MapPin } from "lucide-react";
import AccountProfileHero from "@/components/account/AccountProfileHero";
import AccountShell from "@/components/account/AccountShell";
import AccountOptionCard from "@/components/account/AccountOptionCard";
import { getUserDisplayName } from "@/utils/account/userDisplay";
import { isProfileIncomplete } from "@/utils/account/profileHelpers";
import ProfileIncompleteBanner from "@/components/account/ProfileIncompleteBanner";
import {
  useSavedCombosStore,
  selectSavedCombos,
} from "@/store/useSavedCombosStore";
import { useEffect } from "react";
import {
  ACCOUNT_LOGOUT_CARD_CLASS,
  ACCOUNT_OPTIONS_GRID_CLASS,
  PUBLIC_PRESSABLE_CLASS,
} from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

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
    <AccountShell ariaLabel="Mi cuenta">
      <AccountProfileHero
        user={user}
        displayName={displayName}
        email={user?.email ?? ""}
      />

      <div className="mt-4 space-y-4 md:mt-5">
        {isProfileIncomplete(user) && <ProfileIncompleteBanner />}

        <div className={ACCOUNT_OPTIONS_GRID_CLASS}>
          {quickInfo.map((item) => (
            <AccountOptionCard
              key={item.key}
              title={item.title}
              subtitle={item.subtitle}
              cta={item.cta}
              icon={item.icon}
              badge={item.badge}
              disabled={item.disabled}
              onClick={item.onClick}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            ACCOUNT_LOGOUT_CARD_CLASS,
            PUBLIC_PRESSABLE_CLASS,
            "group flex items-center justify-between text-red-600 transition hover:border-red-200",
          )}
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 transition group-hover:bg-red-100">
              <LogOut size={18} strokeWidth={2.25} aria-hidden />
            </span>
            <span className="text-sm font-semibold">Cerrar sesión</span>
          </div>
        </button>
      </div>
    </AccountShell>
  );
}
