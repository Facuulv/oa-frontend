"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useClientAuth } from "@/hooks/useClientAuth";
import { useMyOrders } from "@/hooks/account/useMyOrders";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import AccountShell from "@/components/account/AccountShell";
import PublicPageHeader from "@/components/public/PublicPageHeader";
import OrderCard from "@/components/account/OrderCard";
import OrdersEmptyState from "@/components/account/OrdersEmptyState";
import OrdersListSkeleton from "@/components/account/OrdersListSkeleton";
import OrdersPagination from "@/components/account/OrdersPagination";
import {
  CHECKOUT_LIST_CLASS,
  CHECKOUT_STATUS_CARD_CLASS,
  PUBLIC_PRESSABLE_CLASS,
} from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

export default function MisPedidosPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useClientAuth({
    redirectTo: "/login?next=%2Fmis-pedidos",
    requireCliente: true,
  });

  const {
    orders,
    pagination,
    loading,
    error,
    goToPrevPage,
    goToNextPage,
    refetch,
  } = useMyOrders({
    enabled: isAuthenticated && !authLoading,
    limit: 8,
  });
  const showSkeleton = useDelayedLoading(loading && isAuthenticated);

  useEffect(() => {
    if (!loading && orders.length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pagination.page, loading, orders.length]);

  if (authLoading || !isAuthenticated) {
    return (
      <AccountShell ariaLabel="Mis pedidos">
        <OrdersListSkeleton count={3} />
      </AccountShell>
    );
  }

  const isEmpty = !loading && !error && pagination.total === 0;
  const hasOrders = !loading && !error && orders.length > 0;

  return (
    <AccountShell ariaLabel="Mis pedidos">
      <PublicPageHeader
        title="Mis pedidos"
        subtitle="Tus pedidos quedan registrados acá. El local te confirma todo por WhatsApp."
        className="mb-4 md:mb-5"
        onBack={() => router.push("/mi-cuenta")}
      />

      <div className="mx-auto w-full max-w-2xl space-y-4">
        {showSkeleton && <OrdersListSkeleton />}

        {!loading && error && (
          <div className={CHECKOUT_STATUS_CARD_CLASS}>
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className={cn(
                PUBLIC_PRESSABLE_CLASS,
                "home-cta-primary-shadow mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary via-primary to-primary-dark px-5 text-sm font-bold text-white",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              )}
            >
              <RefreshCw size={16} aria-hidden />
              Reintentar
            </button>
          </div>
        )}

        {isEmpty && <OrdersEmptyState />}

        {hasOrders && (
          <>
            <ul className={CHECKOUT_LIST_CLASS}>
              {orders.map((order) => (
                <li key={order.id}>
                  <OrderCard order={order} />
                </li>
              ))}
            </ul>

            <OrdersPagination
              pagination={pagination}
              onPrev={goToPrevPage}
              onNext={goToNextPage}
              disabled={loading}
            />
          </>
        )}

        <p className="pt-2 text-center">
          <Link
            href="/mi-cuenta"
            className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
          >
            Volver a mi cuenta
          </Link>
        </p>
      </div>
    </AccountShell>
  );
}
