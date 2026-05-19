"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useClientAuth } from "@/hooks/useClientAuth";
import { useMyOrderDetail } from "@/hooks/account/useMyOrderDetail";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import OrderDetail from "@/components/account/OrderDetail";
import OrderDetailSkeleton from "@/components/account/OrderDetailSkeleton";

export default function MisPedidoDetallePage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id;

  const { isAuthenticated, loading: authLoading } = useClientAuth({
    redirectTo: `/login?next=${encodeURIComponent(`/mis-pedidos/${orderId ?? ""}`)}`,
    requireCliente: true,
  });

  const { order, loading, error, notFound, refetch } = useMyOrderDetail(orderId, {
    enabled: isAuthenticated && !authLoading && Boolean(orderId),
  });
  const showSkeleton = useDelayedLoading(loading && isAuthenticated);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-50 px-4 py-10">
        <OrderDetailSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-8">
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-zinc-100 bg-white px-4 py-3 shadow-sm">
        <button
          type="button"
          onClick={() => router.push("/mis-pedidos")}
          aria-label="Volver a mis pedidos"
          className="rounded-xl p-1.5 text-zinc-700 transition hover:bg-zinc-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-extrabold tracking-tight text-zinc-900">
          Pedido #{orderId}
        </h1>
      </div>

      <div className="px-4 pt-4">
        {showSkeleton && <OrderDetailSkeleton />}

        {!loading && notFound && (
          <div className="rounded-xl border border-zinc-100 bg-white px-6 py-14 text-center shadow-sm">
            <p className="mb-2 text-lg font-semibold text-zinc-800">Pedido no encontrado</p>
            <p className="mb-6 text-sm text-zinc-500">
              No existe o no tenés permiso para verlo.
            </p>
            <Link
              href="/mis-pedidos"
              className="inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white"
            >
              Volver a mis pedidos
            </Link>
          </div>
        )}

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

        {!loading && !error && !notFound && order && <OrderDetail order={order} />}
      </div>
    </div>
  );
}
