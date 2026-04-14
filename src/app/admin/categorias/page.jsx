"use client";

import { Grid3X3, Plus } from "lucide-react";

export default function AdminCategoriasPage() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid3X3 size={20} className="text-gray-400" />
          <h2 className="text-lg font-bold text-gray-800">Categorías</h2>
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:brightness-110"
        >
          <Plus size={16} />
          Nueva categoría
        </button>
      </div>

      <div className="rounded-xl bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-gray-400">
          Aquí se listará la tabla de categorías con acciones CRUD.
        </p>
      </div>
    </div>
  );
}
