"use client";

import { Users, UserPlus } from "lucide-react";

export default function AdminUsuariosPage() {
  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Users size={22} className="text-zinc-400" />
          <h2 className="text-lg font-bold text-zinc-900">Usuarios</h2>
        </div>
        <button
          type="button"
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 sm:w-auto"
        >
          <UserPlus size={18} />
          Nuevo usuario
        </button>
      </div>

      <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-zinc-200/60">
        <p className="text-sm leading-relaxed text-zinc-500">
          Acá se listarán los usuarios y permisos. Todavía no hay ABM: solo estamos dejando el lugar listo.
        </p>
      </div>
    </div>
  );
}
