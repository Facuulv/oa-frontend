"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default function CheckoutEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <ShoppingCart size={48} className="mb-4 text-gray-300" />
      <h2 className="mb-2 text-lg font-semibold text-gray-700">Tu carrito está vacío</h2>
      <p className="mb-6 text-sm text-gray-500">
        Agregá productos para comenzar tu pedido
      </p>
      <Link
        href="/"
        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:brightness-110"
      >
        Ir al catálogo
      </Link>
    </div>
  );
}
