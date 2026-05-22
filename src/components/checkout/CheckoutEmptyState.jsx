"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import CheckoutShell from "@/components/checkout/CheckoutShell";
import PublicPageHeader from "@/components/public/PublicPageHeader";
import {
  CHECKOUT_STATUS_CARD_CLASS,
  PUBLIC_PRESSABLE_CLASS,
} from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

export default function CheckoutEmptyState() {
  return (
    <CheckoutShell ariaLabel="Carrito vacío">
      <PublicPageHeader title="Mi carrito" className="mb-4 md:mb-5" />
      <div className={CHECKOUT_STATUS_CARD_CLASS}>
        <span
          className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"
          aria-hidden
        >
          <ShoppingCart size={22} strokeWidth={2.25} />
        </span>
        <h2 className="text-base font-bold tracking-tight text-foreground md:text-lg">
          Tu carrito está vacío
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-snug text-zinc-500">
          Agregá productos para comenzar tu pedido
        </p>
        <div className="mt-5 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
          <Link
            href="/"
            className={cn(
              PUBLIC_PRESSABLE_CLASS,
              "inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white",
              "motion-safe:transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            )}
          >
            Ir al catálogo
          </Link>
        </div>
      </div>
    </CheckoutShell>
  );
}
