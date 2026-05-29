"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useClientAuth } from "@/hooks/useClientAuth";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { useSavedCombosStore, selectSavedCombos } from "@/store/useSavedCombosStore";
import { toast } from "@/lib/toast";
import AccountShell from "@/components/account/AccountShell";
import PublicPageHeader from "@/components/public/PublicPageHeader";
import SavedCombosSummaryCard from "@/components/account/SavedCombosSummaryCard";
import SavedComboCard from "@/components/account/SavedComboCard";
import SavedCombosEmptyState from "@/components/account/SavedCombosEmptyState";
import SavedCombosListSkeleton from "@/components/account/SavedCombosListSkeleton";
import { ACCOUNT_OPTIONS_GRID_CLASS } from "@/constants/homeTheme";

export default function MiCuentaCombosPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useClientAuth({
    redirectTo: "/login?next=%2Fmi-cuenta%2Fcombos",
    requireCliente: true,
  });
  const combos = useSavedCombosStore(selectSavedCombos);
  const removeComboWithSync = useSavedCombosStore((s) => s.removeComboWithSync);
  const syncCombosFromApi = useSavedCombosStore((s) => s.syncCombosFromApi);
  const syncing = useSavedCombosStore((s) => s.syncing);
  const hasSyncedFromApi = useSavedCombosStore((s) => s.hasSyncedFromApi);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      void syncCombosFromApi();
    }
  }, [authLoading, isAuthenticated, syncCombosFromApi]);

  const showAuthSkeleton = useDelayedLoading(authLoading);
  const showSyncSkeleton = useDelayedLoading(
    syncing && !hasSyncedFromApi && combos.length === 0 && isAuthenticated && !authLoading,
  );
  const showSkeleton = showAuthSkeleton || showSyncSkeleton;

  const handleDelete = async (comboId) => {
    const ok = await removeComboWithSync(comboId);
    if (!ok) toast.error("No pudimos eliminar el combo");
  };

  if (authLoading || !isAuthenticated) {
    return (
      <AccountShell ariaLabel="Mis combos">
        <PublicPageHeader
          title="Mis combos"
          subtitle="Recuperá tus combos guardados y volvé a pedir en segundos."
          className="mb-4 md:mb-5"
          onBack={() => router.push("/mi-cuenta")}
        />
        <div className="mx-auto w-full max-w-5xl space-y-4">
          <SavedCombosListSkeleton count={2} />
        </div>
      </AccountShell>
    );
  }

  return (
    <AccountShell ariaLabel="Mis combos">
      <PublicPageHeader
        title="Mis combos"
        subtitle="Recuperá tus combos guardados y volvé a pedir en segundos."
        className="mb-4 md:mb-5"
        onBack={() => router.push("/mi-cuenta")}
      />

      <div className="mx-auto w-full max-w-5xl space-y-4">
        {showSkeleton ? (
          <SavedCombosListSkeleton count={2} />
        ) : (
          <>
            <SavedCombosSummaryCard count={combos.length} />

            {combos.length === 0 ? (
              <SavedCombosEmptyState />
            ) : (
              <ul className={ACCOUNT_OPTIONS_GRID_CLASS}>
                {combos.map((combo) => (
                  <li key={combo.id} className="min-w-0">
                    <SavedComboCard combo={combo} onDelete={() => handleDelete(combo.id)} />
                  </li>
                ))}
              </ul>
            )}

            <p className="pt-2 text-center">
              <Link
                href="/mi-cuenta"
                className="rounded-sm text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Volver a mi cuenta
              </Link>
            </p>
          </>
        )}
      </div>
    </AccountShell>
  );
}
