"use client";

import { Tag, Plus } from "lucide-react";

export default function AdminPromocionesPage() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag size={20} className="text-gray-400" />
          <h2 className="text-lg font-bold text-gray-800">Promociones</h2>
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:brightness-110"
        >
          <Plus size={16} />
          Nueva promoción
        </button>
      </div>

      <div className="rounded-xl bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-gray-400">
          Aquí se gestionarán las promociones activas e inactivas.
        </p>
      </div>
    </div>
  );
}
