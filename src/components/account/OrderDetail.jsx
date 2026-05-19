"use client";

import Link from "next/link";
import { MapPin, Package, Phone, User } from "lucide-react";
import { formatPrice } from "@/utils/format/price";
import {
  formatOrderDate,
  getDeliveryLabel,
  getOrderCustomerSummary,
  WHATSAPP_FOLLOWUP_NOTE,
} from "@/utils/orders/orderDisplay";

function OrderLineItem({ item }) {
  const name = item?.product_name ?? item?.nombre_producto ?? "Producto";
  const qty = Number(item?.quantity ?? item?.cantidad ?? 1);
  const unitPrice = Number(item?.unit_price ?? item?.precio_unitario ?? 0);
  const lineSubtotal = Number(item?.subtotal ?? unitPrice * qty);
  const notes = item?.notes ?? item?.observaciones;

  return (
    <li className="border-b border-zinc-100 py-3 last:border-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-900">
            {name} <span className="font-normal text-zinc-500">x{qty}</span>
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">{formatPrice(unitPrice)} c/u</p>
          {notes && (
            <p className="mt-1 text-xs text-zinc-500">
              <span className="font-medium">Nota:</span> {notes}
            </p>
          )}
        </div>
        <p className="shrink-0 text-sm font-bold tabular-nums text-zinc-800">
          {formatPrice(lineSubtotal)}
        </p>
      </div>
    </li>
  );
}

export default function OrderDetail({ order }) {
  const summary = getOrderCustomerSummary(order?.status);
  const deliveryLabel = getDeliveryLabel(order);
  const address = order?.delivery_address ?? order?.direccion_entrega;
  const subtotal = Number(order?.subtotal ?? 0);
  const discount = Number(order?.discount ?? order?.descuento ?? 0);
  const total = Number(order?.total ?? 0);
  const notes = order?.notes ?? order?.observaciones;
  const coupon = order?.coupon_code ?? order?.codigo_cupon;
  const items = order?.items ?? [];

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-lg font-extrabold text-zinc-900">Pedido #{order.id}</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              {formatOrderDate(order?.created_at ?? order?.fecha_creacion)}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${summary.className}`}
          >
            {summary.label}
          </span>
        </div>

        <p className="mb-3 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
          {WHATSAPP_FOLLOWUP_NOTE} Coordiná confirmación, pago y entrega directamente con el local.
        </p>

        <div className="space-y-2 text-sm text-zinc-600">
          <p className="flex items-center gap-2">
            <Package size={16} className="shrink-0 text-zinc-400" aria-hidden />
            {deliveryLabel}
          </p>
          {address && deliveryLabel === "Delivery" && (
            <p className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-zinc-400" aria-hidden />
              <span>{address}</span>
            </p>
          )}
          {order?.customer_name && (
            <p className="flex items-center gap-2">
              <User size={16} className="shrink-0 text-zinc-400" aria-hidden />
              {order.customer_name}
            </p>
          )}
          {order?.customer_phone && (
            <p className="flex items-center gap-2">
              <Phone size={16} className="shrink-0 text-zinc-400" aria-hidden />
              {order.customer_phone}
            </p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-bold text-zinc-900">Productos</h2>
        {items.length === 0 ? (
          <p className="text-sm text-zinc-500">No hay ítems registrados para este pedido.</p>
        ) : (
          <ul>
            {items.map((item) => (
              <OrderLineItem key={item.id ?? `${item.product_id}-${item.product_name}`} item={item} />
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-bold text-zinc-900">Resumen</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between text-zinc-600">
            <dt>Subtotal</dt>
            <dd className="tabular-nums font-medium text-zinc-800">{formatPrice(subtotal)}</dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-zinc-600">
              <dt>Descuento</dt>
              <dd className="tabular-nums font-medium text-emerald-700">-{formatPrice(discount)}</dd>
            </div>
          )}
          {coupon && (
            <div className="flex justify-between text-zinc-600">
              <dt>Cupón</dt>
              <dd className="font-medium text-zinc-800">{coupon}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-zinc-100 pt-2 text-base">
            <dt className="font-bold text-zinc-900">Total</dt>
            <dd className="font-extrabold tabular-nums text-primary">{formatPrice(total)}</dd>
          </div>
        </dl>
      </section>

      {notes && (
        <section className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-bold text-zinc-900">Observaciones</h2>
          <p className="text-sm text-zinc-600 whitespace-pre-wrap">{notes}</p>
        </section>
      )}

      <Link
        href="/"
        className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110"
      >
        Hacer otro pedido
      </Link>
    </div>
  );
}
