"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw, Settings } from "lucide-react";

export default function ConfiguracionHeader({ onReload, reloading }) {
  return (
    <header className="admin-quick-card-enter flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <Link
          href="/admin"
          className="admin-pressable inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 active:bg-zinc-100"
          aria-label="Volver al panel"
        >
          <ArrowLeft size={18} strokeWidth={2.25} />
        </Link>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <Settings size={18} strokeWidth={2} aria-hidden />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              Configuración
            </h1>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Carta online, horarios de atención y WhatsApp de pedidos.
          </p>
        </div>
      </div>
      {onReload ? (
        <button
          type="button"
          onClick={onReload}
          disabled={reloading}
          className="admin-pressable inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 disabled:opacity-60 sm:self-center"
        >
          <RefreshCw size={16} className={reloading ? "animate-spin" : ""} aria-hidden />
          Actualizar
        </button>
      ) : null}
    </header>
  );
}
