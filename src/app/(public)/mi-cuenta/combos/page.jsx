"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Trash2, ChevronRight } from "lucide-react";
import { useClientAuth } from "@/hooks/useClientAuth";
import {
  useSavedCombosStore,
  selectSavedCombos,
  FALLBACK_COMBO_NAME,
} from "@/store/useSavedCombosStore";
import { formatPrice } from "@/utils/format/price";
import { useEffect } from "react";
import { toast } from "@/lib/toast";

export default function MiCuentaCombosPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useClientAuth({
    redirectTo: "/login?next=%2Fmi-cuenta%2Fcombos",
    requireCliente: true,
  });
  const combos = useSavedCombosStore(selectSavedCombos);
  const removeComboWithSync = useSavedCombosStore((s) => s.removeComboWithSync);
  const syncCombosFromApi = useSavedCombosStore((s) => s.syncCombosFromApi);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      void syncCombosFromApi();
    }
  }, [loading, isAuthenticated, syncCombosFromApi]);

  if (loading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-4">
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.push("/mi-cuenta")}
          aria-label="Volver a mi cuenta"
          className="rounded-xl p-1.5 text-zinc-700 transition hover:bg-zinc-200/70"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-extrabold tracking-tight text-zinc-900">Mis combos</h1>
      </div>

      <div className="mb-4 rounded-2xl bg-zinc-950 p-4 text-white shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-red-200/90">Guardados</p>
            <p className="mt-1 text-sm text-zinc-200">
              Tenés <span className="font-bold text-white">{combos.length}</span> combo
              {combos.length === 1 ? "" : "s"} listo{combos.length === 1 ? "" : "s"}.
            </p>
          </div>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <Sparkles size={18} />
          </span>
        </div>
      </div>

      {combos.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-7 text-center shadow-sm">
          <p className="text-sm font-semibold text-zinc-800">Todavía no guardaste combos</p>
          <p className="mt-1 text-xs text-zinc-500">
            Armá uno nuevo y guardalo para volver a pedir en segundos.
          </p>
          <Link
            href="/arma-tu-combo"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            Ir a Arma tu combo
            <ChevronRight size={15} />
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {combos.map((combo) => {
            const displayName = combo.name?.trim() || combo.label || FALLBACK_COMBO_NAME;
            return (
              <li key={combo.id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-zinc-900">{displayName}</p>
                    <p className="mt-1 truncate text-xs text-zinc-500">
                      {combo.label || "Combo personalizado"}
                    </p>
                    <p className="mt-2 text-sm font-extrabold text-primary">
                      {formatPrice(Number(combo.total) || 0)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await removeComboWithSync(combo.id);
                      if (!ok) toast.error("No pudimos eliminar el combo");
                    }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-red-500 transition hover:bg-red-50"
                    aria-label={`Eliminar ${displayName}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <Link
                  href={`/arma-tu-combo?combo=${encodeURIComponent(combo.id)}`}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary"
                >
                  Cargar combo
                  <ChevronRight size={14} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
