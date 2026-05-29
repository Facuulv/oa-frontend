"use client";

import Link from "next/link";
import { MapPin, Package, Phone, User } from "lucide-react";
import { formatPrice } from "@/utils/format/price";
import {
  formatOrderDate,
  formatOrderNotesForDisplay,
  getDeliveryLabel,
  getOrderCustomerSummary,
  WHATSAPP_FOLLOWUP_NOTE,
} from "@/utils/orders/orderDisplay";
import {
  ACCOUNT_CARD_CLASS,
  CHECKOUT_LAYOUT_CLASS,
  PUBLIC_PRESSABLE_CLASS,
} from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

/** Sidebar sticky en desktop; sin `flex` en mobile para no anular `hidden`. */
const ORDER_DETAIL_SIDEBAR_CLASS = cn(
  "hidden shrink-0 lg:flex lg:flex-col lg:gap-4",
  "lg:sticky lg:top-[calc(var(--app-header-total-height)+1rem)] lg:self-start lg:w-full",
);

function OrderLineItem({ item }) {
  const name = item?.product_name ?? item?.nombre_producto ?? "Producto";
  const qty = Number(item?.quantity ?? item?.cantidad ?? 1);
  const unitPrice = Number(item?.unit_price ?? item?.precio_unitario ?? 0);
  const lineSubtotal = Number(item?.subtotal ?? unitPrice * qty);
  const notes = item?.notes ?? item?.observaciones;

  return (
    <li className="border-b border-zinc-100/90 py-3 last:border-0 last:pb-0">
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

function OrderDetailHeaderCard({ order, summary, deliveryLabel, address }) {
  return (
    <section className={cn(ACCOUNT_CARD_CLASS, "p-4 md:p-5")}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-lg font-extrabold tracking-tight text-zinc-900">Pedido #{order.id}</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {formatOrderDate(order?.created_at ?? order?.fecha_creacion)}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
            summary.className,
          )}
        >
          {summary.label}
        </span>
      </div>

      <p className="mb-3 rounded-xl border border-zinc-100/90 bg-zinc-50/80 px-3 py-2.5 text-xs leading-snug text-zinc-600">
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
  );
}

function OrderProductsCard({ items }) {
  return (
    <section className={cn(ACCOUNT_CARD_CLASS, "p-4 md:p-5")}>
      <h2 className="mb-2 text-sm font-bold text-zinc-900">Productos</h2>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">No hay ítems registrados para este pedido.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <OrderLineItem
              key={item.id ?? `${item.product_id}-${item.product_name}`}
              item={item}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function OrderSummaryCard({ subtotal, discount, coupon, total }) {
  return (
    <section className={cn(ACCOUNT_CARD_CLASS, "p-4 md:p-5")}>
      <h2 className="mb-3 text-sm font-bold text-zinc-900">Resumen</h2>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between text-zinc-600">
          <dt>Subtotal</dt>
          <dd className="font-medium tabular-nums text-zinc-800">{formatPrice(subtotal)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-zinc-600">
            <dt>Descuento</dt>
            <dd className="font-medium tabular-nums text-emerald-700">-{formatPrice(discount)}</dd>
          </div>
        )}
        {coupon && (
          <div className="flex justify-between text-zinc-600">
            <dt>Cupón</dt>
            <dd className="font-medium text-zinc-800">{coupon}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-zinc-100/90 pt-2 text-base">
          <dt className="font-bold text-zinc-900">Total</dt>
          <dd className="product-price font-extrabold leading-none text-primary">
            {formatPrice(total)}
          </dd>
        </div>
      </dl>
    </section>
  );
}

function OrderObservationsCard({ notes }) {
  const formatted = formatOrderNotesForDisplay(notes, { omitDeliveryType: true });
  if (!formatted.hasContent) return null;

  return (
    <section className={cn(ACCOUNT_CARD_CLASS, "p-4 md:p-5")}>
      <h2 className="mb-2 text-sm font-bold text-zinc-900">Observaciones</h2>
      {formatted.fallback ? (
        <p className="whitespace-pre-wrap text-sm leading-snug text-zinc-600">{formatted.fallback}</p>
      ) : (
        <div className="space-y-2 text-sm leading-snug text-zinc-600">
          {formatted.userText && <p className="whitespace-pre-wrap">{formatted.userText}</p>}
          {formatted.metaLines.length > 0 && (
            <ul className="list-inside list-disc space-y-0.5 text-zinc-500">
              {formatted.metaLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

function OrderReorderCta() {
  return (
    <Link
      href="/"
      className={cn(
        PUBLIC_PRESSABLE_CLASS,
        "home-cta-primary-shadow flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary to-primary-dark px-6 py-3 text-sm font-bold text-white",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "sm:text-base",
      )}
    >
      Hacer otro pedido
    </Link>
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
  const showObservations = formatOrderNotesForDisplay(notes, { omitDeliveryType: true }).hasContent;

  return (
    <div className={CHECKOUT_LAYOUT_CLASS}>
      <div className="flex min-w-0 flex-col gap-4">
        <OrderDetailHeaderCard
          order={order}
          summary={summary}
          deliveryLabel={deliveryLabel}
          address={address}
        />
        <OrderProductsCard items={items} />
        <div className="flex flex-col gap-4 lg:hidden">
          <OrderSummaryCard
            subtotal={subtotal}
            discount={discount}
            coupon={coupon}
            total={total}
          />
          {showObservations && <OrderObservationsCard notes={notes} />}
          <OrderReorderCta />
        </div>
      </div>

      <aside className={ORDER_DETAIL_SIDEBAR_CLASS}>
        <OrderSummaryCard
          subtotal={subtotal}
          discount={discount}
          coupon={coupon}
          total={total}
        />
        {showObservations && <OrderObservationsCard notes={notes} />}
        <OrderReorderCta />
      </aside>
    </div>
  );
}
