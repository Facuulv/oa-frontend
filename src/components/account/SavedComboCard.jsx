"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { FALLBACK_COMBO_NAME } from "@/store/useSavedCombosStore";
import { formatPrice } from "@/utils/format/price";
import { ACCOUNT_CARD_CLASS, PUBLIC_PRESSABLE_CLASS } from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

/**
 * Card de combo guardado con acciones cargar y eliminar.
 * @param {object} props
 * @param {object} props.combo
 * @param {() => void | Promise<void>} props.onDelete
 */
export default function SavedComboCard({ combo, onDelete }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const displayName = combo.name?.trim() || combo.label || FALLBACK_COMBO_NAME;
  const description = combo.label || "Combo personalizado";
  const total = Number(combo.total) || 0;

  const closeConfirm = () => {
    if (!deleting) setConfirmOpen(false);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <article className={cn(ACCOUNT_CARD_CLASS, "flex h-full flex-col p-4")}>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-bold text-zinc-900">{displayName}</p>
          <p className="mt-1 line-clamp-2 text-xs leading-snug text-zinc-500">{description}</p>
          <p className="product-price mt-2 text-lg font-extrabold leading-none text-primary">
            {formatPrice(total)}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-zinc-100 pt-3">
          <Link
            href={`/arma-tu-combo?combo=${encodeURIComponent(combo.id)}`}
            className="inline-flex min-h-10 min-w-0 flex-1 items-center gap-1 rounded-sm text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Cargar combo
            <ChevronRight size={14} className="shrink-0" aria-hidden />
          </Link>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-xl text-red-500 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
            aria-label={`Eliminar ${displayName}`}
          >
            <Trash2 size={16} aria-hidden />
          </button>
        </div>
      </article>

      <Modal
        isOpen={confirmOpen}
        onClose={closeConfirm}
        title="Eliminar combo"
        closeDisabled={deleting}
        centered
        maxWidthClass="w-full max-w-md"
        animatePanelPop
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={closeConfirm}
              disabled={deleting}
              className={cn(
                PUBLIC_PRESSABLE_CLASS,
                "inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-800 sm:w-auto",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60",
              )}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void handleConfirmDelete()}
              disabled={deleting}
              data-modal-initial-focus
              className={cn(
                PUBLIC_PRESSABLE_CLASS,
                "home-cta-primary-shadow inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary to-primary-dark px-4 text-sm font-bold text-white disabled:opacity-60 sm:w-auto",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              )}
            >
              {deleting ? "Eliminando…" : "Eliminar combo"}
            </button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-zinc-700">
          ¿Estás seguro que querés eliminar{" "}
          <span className="font-semibold text-zinc-900">{displayName}</span>? Esta acción no se
          puede deshacer.
        </p>
      </Modal>
    </>
  );
}
