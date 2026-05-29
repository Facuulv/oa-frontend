"use client";

import Link from "next/link";
import { ChevronRight, MapPin, Package } from "lucide-react";
import { formatPrice } from "@/utils/format/price";
import {
  formatOrderDate,
  getDeliveryLabel,
  getOrderCustomerSummary,
} from "@/utils/orders/orderDisplay";
import { ACCOUNT_OPTION_CARD_CLASS } from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

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
      className={cn(ACCOUNT_OPTION_CARD_CLASS, "block no-underline")}
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
            className={cn(
              "inline-block rounded-full px-2.5 py-1 text-xs font-semibold",
              summary.className,
            )}
          >
            {summary.label}
          </span>
          <p className="mt-1.5 text-xs leading-snug text-zinc-500">{summary.hint}</p>
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

        <p className="product-price mt-3 text-lg font-extrabold leading-none text-primary">
          {formatPrice(total)}
        </p>
      </article>
    </Link>
  );
}
