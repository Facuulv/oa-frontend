"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useClientAuth } from "@/hooks/useClientAuth";
import { useMyOrders } from "@/hooks/account/useMyOrders";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import OrderCard from "@/components/account/OrderCard";
import OrdersEmptyState from "@/components/account/OrdersEmptyState";
import OrdersListSkeleton from "@/components/account/OrdersListSkeleton";
import OrdersPagination from "@/components/account/OrdersPagination";

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
  });
  const showSkeleton = useDelayedLoading(loading && isAuthenticated);

  useEffect(() => {
    if (!loading && orders.length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pagination.page, loading, orders.length]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-50 px-4 py-10">
        <OrdersListSkeleton count={3} />
      </div>
    );
  }

  const isEmpty = !loading && !error && pagination.total === 0;
  const hasOrders = !loading && !error && orders.length > 0;

  return (
    <div className="min-h-screen bg-zinc-50 pb-8">
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-zinc-100 bg-white px-4 py-3 shadow-sm">
        <button
          type="button"
          onClick={() => router.push("/mi-cuenta")}
          aria-label="Volver a mi cuenta"
          className="rounded-xl p-1.5 text-zinc-700 transition hover:bg-zinc-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-extrabold tracking-tight text-zinc-900">Mis pedidos</h1>
      </div>

      <div className="px-4 pt-4">
        <p className="mb-4 text-xs text-zinc-500">
          Tus pedidos quedan registrados acá. El local te confirma todo por WhatsApp.
        </p>

        {showSkeleton && <OrdersListSkeleton />}

        {!loading && error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-6 text-center">
            <p className="mb-4 text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
            >
              <RefreshCw size={16} />
              Reintentar
            </button>
          </div>
        )}

        {isEmpty && <OrdersEmptyState />}

        {hasOrders && (
          <>
            <ul className="space-y-3">
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

            <p className="mt-4 text-center text-xs text-zinc-500">
              {pagination.total} pedido{pagination.total === 1 ? "" : "s"} en total
            </p>
          </>
        )}

        <p className="mt-6 text-center">
          <Link href="/mi-cuenta" className="text-sm font-medium text-primary hover:underline">
            Volver a mi cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
