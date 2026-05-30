"use client";

import { CheckCircle } from "lucide-react";
import {
  CHECKOUT_SUCCESS_CARD_CLASS,
  CHECKOUT_SUCCESS_LAYOUT_CLASS,
  PUBLIC_PRESSABLE_CLASS,
} from "@/constants/homeTheme";
import { cn } from "@/lib/cn";

/**
 * Pantalla de éxito tras confirmar pedido (presentacional).
 * @param {object} props
 * @param {number|string} props.orderId
 * @param {boolean} props.whatsappOpened
 * @param {string|null|undefined} props.url
 * @param {() => void} props.onGoHome
 */
export default function CheckoutOrderSuccessPanel({
  orderId,
  whatsappOpened,
  url,
  onGoHome,
}) {
  return (
    <div className={CHECKOUT_SUCCESS_LAYOUT_CLASS}>
      <div className={CHECKOUT_SUCCESS_CARD_CLASS}>
        <span
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600/90 sm:mb-5 sm:h-16 sm:w-16"
          aria-hidden
        >
          <CheckCircle size={30} strokeWidth={2.25} />
        </span>

        <h2 className="text-xl font-bold tracking-tight text-foreground">
          ¡Pedido registrado!
        </h2>

        <p className="mt-2">
          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            Pedido #{orderId}
          </span>
        </p>

        <p className="mx-auto mt-4 max-w-sm text-sm leading-snug text-zinc-600">
          {whatsappOpened
            ? "Confirmá el pedido enviando el mensaje al local."
            : "No pudimos abrir WhatsApp automáticamente en este dispositivo."}
        </p>
        <p className="mx-auto mt-1 max-w-sm text-sm leading-snug text-zinc-500">
          {whatsappOpened
            ? "Si la pestaña no se abrió, tocá el botón de abajo."
            : "Tu pedido quedó guardado. Tocá el botón para abrir WhatsApp manualmente."}
        </p>

        <div className="mt-4 rounded-2xl border border-zinc-100 bg-zinc-50/80 px-4 py-3 text-xs leading-snug text-zinc-600 sm:text-sm">
          <p>Guardamos tu pedido correctamente.</p>
          <p className="mt-1">
            Ahora solo falta enviarlo por WhatsApp para confirmarlo con el local.
          </p>
        </div>

        <div className="mt-6 flex w-full flex-col gap-2.5">
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                PUBLIC_PRESSABLE_CLASS,
                "home-cta-primary-shadow inline-flex min-h-12 w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold text-white",
                "bg-gradient-to-br from-primary via-primary to-primary-dark",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              )}
            >
              Abrir WhatsApp
            </a>
          ) : null}
          <button
            type="button"
            onClick={onGoHome}
            className={cn(
              PUBLIC_PRESSABLE_CLASS,
              "inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-2.5 text-sm font-semibold text-zinc-700",
              "transition hover:border-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            )}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
