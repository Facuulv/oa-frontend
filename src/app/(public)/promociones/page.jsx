"use client";

import { Tag } from "lucide-react";

export default function PromocionesPage() {
  return (
    <div className="px-4 py-4">
      <div className="mb-4 flex items-center gap-2">
        <Tag size={20} className="text-primary" />
        <h1 className="text-lg font-bold text-gray-800">Promociones</h1>
      </div>

      <p className="py-12 text-center text-sm text-gray-400">
        Próximamente encontrarás aquí las mejores ofertas y promociones.
      </p>
    </div>
  );
}
