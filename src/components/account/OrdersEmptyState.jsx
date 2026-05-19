"use client";

import Link from "next/link";
import { Package } from "lucide-react";

export default function OrdersEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-100 bg-white px-6 py-14 text-center shadow-sm">
      <Package size={48} className="mb-4 text-zinc-300" />
      <h2 className="mb-2 text-lg font-semibold text-zinc-800">Todavía no tenés pedidos</h2>
      <p className="mb-6 max-w-xs text-sm text-zinc-500">
        Cuando confirmes un pedido desde el checkout, lo vas a ver acá. El local te confirma todo por
        WhatsApp.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
      >
        Ir al catálogo
      </Link>
    </div>
  );
}
