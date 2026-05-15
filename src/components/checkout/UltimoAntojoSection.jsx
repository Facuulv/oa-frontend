"use client";

import { Plus } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/utils/format/price";

/**
 * Sugerencias compactas para el final del checkout.
 * Scroll horizontal: foto pequeña, precio y botón "+" circular rojo.
 */
const SUGERIDOS = [
  {
    id: "sug-hielo",
    articuloId: "sug-hielo",
    slug: "hielo-3kg",
    nombre: "Hielo 3kg",
    precioBase: 1500,
    emoji: "🧊",
    bg: "bg-sky-100",
  },
  {
    id: "sug-coca",
    articuloId: "sug-coca",
    slug: "coca-500ml",
    nombre: "Coca-Cola 500ml",
    precioBase: 1800,
    emoji: "🥤",
    bg: "bg-red-100",
  },
  {
    id: "sug-speed",
    articuloId: "sug-speed",
    slug: "speed-250ml",
    nombre: "Speed 250ml",
    precioBase: 1200,
    emoji: "⚡",
    bg: "bg-amber-100",
  },
  {
    id: "sug-papas",
    articuloId: "sug-papas",
    slug: "papas-classic",
    nombre: "Papas fritas",
    precioBase: 2200,
    emoji: "🍟",
    bg: "bg-yellow-100",
  },
];
export default function UltimoAntojoSection() {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-bold text-zinc-900">No te olvides nada</h2>
        <span className="text-xs font-medium text-zinc-500">Sumalo con un toque</span>
      </div>

      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {SUGERIDOS.map((s) => (
          <div
            key={s.id}
            className="relative flex w-24 shrink-0 flex-col items-center rounded-2xl border border-zinc-200 bg-white p-2.5 shadow-sm"
          >
            <div
              className={`mb-1.5 flex h-14 w-14 items-center justify-center rounded-full text-2xl ${s.bg}`}
              aria-hidden
            >
              <span>{s.emoji}</span>
            </div>
            <p
              className="line-clamp-1 w-full text-center text-[11px] font-medium text-zinc-700"
              title={s.nombre}
            >
              {s.nombre}
            </p>
            <p className="mt-0.5 text-sm font-bold text-[#C1121F] tabular-nums">
              {formatPrice(s.precioBase)}
            </p>
            <button
              type="button"
              onClick={() =>
                addItem({
                  articuloId: s.articuloId,
                  slug: s.slug,
                  nombre: s.nombre,
                  precioBase: s.precioBase,
                  cantidad: 1,
                })
              }
              aria-label={`Agregar ${s.nombre} al carrito`}
              className="absolute -right-1.5 -top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#C1121F] text-white shadow-md transition active:scale-95"
            >
              <Plus size={16} strokeWidth={2.5} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
