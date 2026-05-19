"use client";

import Link from "next/link";
import { ChevronRight, MapPin, Package } from "lucide-react";
import { formatPrice } from "@/utils/format/price";
import {
  formatOrderDate,
  getDeliveryLabel,
  getOrderCustomerSummary,
} from "@/utils/orders/orderDisplay";

export default function OrderCard({ order }) {
  const orderId = order?.id;
  const summary = getOrderCustomerSummary(order?.status);
  const deliveryLabel = getDeliveryLabel(order);
  const createdAt = order?.created_at ?? order?.fecha_creacion;
  const total = Number(order?.total ?? 0);
  const address = order?.delivery_address ?? order?.direccion_entrega;

  return (
    <Link
      href={`/mis-pedidos/${orderId}`}
      className="block rounded-xl border border-zinc-100 bg-white p-4 shadow-sm transition hover:border-zinc-200 hover:shadow-md active:scale-[0.99]"
    >
      <article>
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-zinc-900">Pedido #{orderId}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{formatOrderDate(createdAt)}</p>
          </div>
          <ChevronRight size={18} className="mt-0.5 shrink-0 text-zinc-400" aria-hidden />
        </div>

        <div className="mb-3">
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${summary.className}`}
          >
            {summary.label}
          </span>
          <p className="mt-1.5 text-xs text-zinc-500">{summary.hint}</p>
        </div>

        <div className="space-y-1.5 text-sm text-zinc-600">
          <p className="flex items-center gap-2">
            <Package size={15} className="shrink-0 text-zinc-400" aria-hidden />
            <span>{deliveryLabel}</span>
          </p>
          {address && deliveryLabel === "Delivery" && (
            <p className="flex items-start gap-2 text-xs text-zinc-500">
              <MapPin size={14} className="mt-0.5 shrink-0 text-zinc-400" aria-hidden />
              <span className="line-clamp-2">{address}</span>
            </p>
          )}
        </div>

        <p className="mt-3 text-lg font-extrabold tabular-nums text-primary">{formatPrice(total)}</p>
      </article>
    </Link>
  );
}
