"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useClientAuth } from "@/hooks/useClientAuth";
import { useMyOrderDetail } from "@/hooks/account/useMyOrderDetail";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import AccountShell from "@/components/account/AccountShell";
import PublicPageHeader from "@/components/public/PublicPageHeader";
import OrderDetail from "@/components/account/OrderDetail";
import OrderDetailSkeleton from "@/components/account/OrderDetailSkeleton";
import {
  CHECKOUT_STATUS_CARD_CLASS,
  PUBLIC_PRESSABLE_CLASS,
} from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

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

  const headerTitle = order?.id ? `Pedido #${order.id}` : `Pedido #${orderId}`;

  if (authLoading || !isAuthenticated) {
    return (
      <AccountShell ariaLabel="Detalle del pedido">
        <OrderDetailSkeleton />
      </AccountShell>
    );
  }

  return (
    <AccountShell ariaLabel="Detalle del pedido">
      <PublicPageHeader
        title={headerTitle}
        subtitle="El local coordina confirmación y entrega por WhatsApp."
        className="mb-4 md:mb-5"
        onBack={() => router.push("/mis-pedidos")}
      />

      <div className="mx-auto w-full max-w-6xl">
        {showSkeleton && <OrderDetailSkeleton />}

        {!loading && notFound && (
          <div className={CHECKOUT_STATUS_CARD_CLASS}>
            <h2 className="text-base font-bold tracking-tight text-foreground md:text-lg">
              Pedido no encontrado
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-snug text-zinc-500">
              No existe o no tenés permiso para verlo.
            </p>
            <Link
              href="/mis-pedidos"
              className={cn(
                PUBLIC_PRESSABLE_CLASS,
                "home-cta-primary-shadow mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary to-primary-dark px-6 text-sm font-bold text-white",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              )}
            >
              Volver a mis pedidos
            </Link>
          </div>
        )}

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

        {!loading && !error && !notFound && order && <OrderDetail order={order} />}
      </div>
    </AccountShell>
  );
}
