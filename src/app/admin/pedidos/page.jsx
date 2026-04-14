"use client";

import { ShoppingBag } from "lucide-react";

export default function AdminPedidosPage() {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <ShoppingBag size={20} className="text-gray-400" />
        <h2 className="text-lg font-bold text-gray-800">Pedidos</h2>
      </div>

      <div className="rounded-xl bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-gray-400">
          Aquí se listarán los pedidos con filtros por estado y acciones de gestión.
        </p>
      </div>
    </div>
  );
}
