"use client";

import { Plus } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/utils/format/price";

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
];

/**
 * Sugeridos horizontales para el final del checkout ("¿No te falta nada?").
 * Tap → suma 1 al carrito mediante `useCartStore.addItem`.
 */
export default function UltimoAntojoSection() {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <section>
      <h2 className="mb-1 text-sm font-semibold text-gray-700">¿No te falta nada?</h2>
      <p className="mb-3 text-xs text-gray-500">Sumá un último antojo a tu pedido.</p>

      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
        {SUGERIDOS.map((s) => (
          <button
            key={s.id}
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
            className="flex w-32 shrink-0 flex-col items-center rounded-xl border border-gray-200 bg-white p-3 text-center shadow-sm transition active:scale-[.98]"
            aria-label={`Agregar ${s.nombre} al carrito`}
          >
            <div className={`mb-2 flex h-16 w-16 items-center justify-center rounded-full text-2xl ${s.bg}`}>
              <span aria-hidden>{s.emoji}</span>
            </div>
            <p className="line-clamp-2 text-xs font-medium text-gray-800">{s.nombre}</p>
            <p className="mt-1 text-sm font-bold text-primary">{formatPrice(s.precioBase)}</p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              <Plus size={12} />
              Agregar
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
