"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import UltimoAntojoSection from "@/components/checkout/UltimoAntojoSection";
import AddressAutocompleteInput from "@/components/checkout/AddressAutocompleteInput";
import { formatPrice } from "@/utils/format/price";
import { useCheckoutFinalize } from "@/hooks/checkout/useCheckoutFinalize";

export default function CheckoutFinalizarPage() {
  const router = useRouter();
  const {
    items,
    total,
    formValues,
    fieldErrors,
    isSubmitting,
    orderSent,
    authLoading,
    isAuthenticatedCliente,
    authUser,
    isDelivery,
    isFormReady,
    savedAddresses,
    updateField,
    submit,
  } = useCheckoutFinalize();

  if (authLoading || !isAuthenticatedCliente || authUser?.origen === "ADMIN") {
    return (
      <div className="min-h-screen bg-white px-4 py-10 text-zinc-900">
        <div className="mx-auto max-w-md animate-pulse space-y-4">
          <div className="h-6 w-40 rounded bg-zinc-200" />
          <div className="h-24 rounded-2xl bg-zinc-100" />
          <div className="h-24 rounded-2xl bg-zinc-100" />
          <div className="h-24 rounded-2xl bg-zinc-100" />
          <div className="h-12 rounded-xl bg-zinc-200" />
        </div>
      </div>
    );
  }

  if (orderSent) {
    return (
      <div className="flex flex-col items-center justify-center bg-white px-6 py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Check size={28} strokeWidth={3} />
        </div>
        <h2 className="mb-2 text-lg font-bold text-zinc-900">¡Pedido registrado!</h2>
        <p className="mb-1 text-sm font-semibold text-[#C1121F]">Pedido #{orderSent.orderId}</p>
        <p className="mb-1 text-sm text-zinc-700">
          {orderSent.whatsappOpened
            ? "Confirmá el pedido enviando el mensaje al local."
            : "No pudimos abrir WhatsApp automáticamente en este dispositivo."}
        </p>
        <p className="mb-6 text-sm text-zinc-500">
          {orderSent.whatsappOpened
            ? "Si la pestaña no se abrió, tocá el botón de abajo."
            : "Tu pedido quedó guardado. Tocá el botón para abrir WhatsApp manualmente."}
        </p>
        <a
          href={orderSent.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-[#C1121F] px-6 py-2.5 text-sm font-bold text-white"
        >
          Abrir WhatsApp
        </a>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-3 rounded-xl border border-zinc-200 px-6 py-2.5 text-sm font-semibold text-zinc-700"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  const baseInputClass =
    "h-11 w-full rounded-xl border bg-white px-3 text-sm font-medium text-zinc-900 outline-none transition placeholder:font-normal placeholder:text-zinc-400";

  const inputClass = (field) =>
    `${baseInputClass} ${
      fieldErrors[field]
        ? "border-[#C1121F] ring-2 ring-[#C1121F]/15 focus:border-[#C1121F]"
        : "border-zinc-200 focus:border-[#C1121F]/40 focus:ring-2 focus:ring-[#C1121F]/15"
    }`;

  const paymentOptions = [
    { value: "efectivo", label: "Efectivo" },
    { value: "transferencia", label: "Transferencia" },
  ];

  return (
    <div className="min-h-screen bg-white pb-6 text-zinc-900">
      <div className="flex items-center gap-2 px-4 pb-2 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Volver"
          className="rounded-xl p-1.5 text-zinc-700 transition hover:bg-zinc-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-extrabold tracking-tight text-zinc-900">
          Finalizar pedido
        </h1>
      </div>

      <div className="space-y-6 px-4">
        {/* Datos personales */}
        <section>
          <h2 className="mb-1 text-sm font-bold text-zinc-900">Tus datos</h2>
          <p className="mb-3 text-xs text-zinc-500">
            Usamos esta información para confirmarte el pedido por WhatsApp.
          </p>
          <div className="space-y-3">
            <div>
              <label htmlFor="checkout-nombre" className="mb-1 block text-xs font-semibold text-zinc-700">
                Nombre <span className="text-[#C1121F]">*</span>
              </label>
              <input
                id="checkout-nombre"
                name="nombre"
                autoComplete="name"
                value={formValues.nombre}
                onChange={(e) => updateField("nombre", e.target.value)}
                placeholder="Cómo te llamamos"
                className={inputClass("nombre")}
              />
              {fieldErrors.nombre && (
                <p className="mt-1 text-xs font-medium text-[#C1121F]">{fieldErrors.nombre}</p>
              )}
            </div>
            <div>
              <label htmlFor="checkout-telefono" className="mb-1 block text-xs font-semibold text-zinc-700">
                Teléfono <span className="text-[#C1121F]">*</span>
              </label>
              <input
                id="checkout-telefono"
                name="telefono"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={formValues.telefono}
                onChange={(e) => updateField("telefono", e.target.value)}
                placeholder="Ej. 351 123 4567"
                className={inputClass("telefono")}
              />
              {fieldErrors.telefono && (
                <p className="mt-1 text-xs font-medium text-[#C1121F]">{fieldErrors.telefono}</p>
              )}
            </div>
            <div>
              <label htmlFor="checkout-email" className="mb-1 block text-xs font-semibold text-zinc-700">
                Email <span className="text-zinc-400">(opcional)</span>
              </label>
              <input
                id="checkout-email"
                name="email"
                type="email"
                autoComplete="email"
                value={formValues.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                className={inputClass("email")}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs font-medium text-[#C1121F]">{fieldErrors.email}</p>
              )}
            </div>
          </div>
        </section>

        {/* Entrega */}
        <section>
          <h2 className="mb-3 text-sm font-bold text-zinc-900">Entrega</h2>
          <div className="flex gap-2">
            {["RETIRO", "DELIVERY"].map((type) => {
              const selected = formValues.deliveryType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateField("deliveryType", type)}
                  className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition ${
                    selected
                      ? "border-[#C1121F] bg-[#C1121F]/5 text-[#C1121F]"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                  }`}
                >
                  {type === "RETIRO" ? "Retiro en local" : "Delivery"}
                </button>
              );
            })}
          </div>
          {isDelivery && (
            <div className="mt-3">
              <AddressAutocompleteInput
                value={formValues.direccion}
                onChange={(value) => updateField("direccion", value)}
                error={fieldErrors.direccion}
                savedAddresses={savedAddresses}
                required
              />
            </div>
          )}
        </section>

        {/* Método de pago */}
        <section>
          <h2 className="mb-3 text-sm font-bold text-zinc-900">Método de pago</h2>
          <div className="flex gap-2">
            {paymentOptions.map(({ value, label }) => {
              const isCashOnDelivery = value === "efectivo" && isDelivery;
              const disabled = isCashOnDelivery;
              const selected = formValues.paymentMethod === value;
              return (
                <button
                  key={value}
                  type="button"
                  disabled={disabled}
                  onClick={() => !disabled && updateField("paymentMethod", value)}
                  className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition ${
                    selected
                      ? "border-[#C1121F] bg-[#C1121F]/5 text-[#C1121F]"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                  } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                  aria-disabled={disabled}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {isDelivery && (
            <p className="mt-2 text-xs text-zinc-500">
              El pago en efectivo solo es válido para retiro en local.
            </p>
          )}
        </section>

        {/* Notas */}
        <section>
          <label htmlFor="checkout-notes" className="mb-2 block text-sm font-bold text-zinc-900">
            Notas
          </label>
          <textarea
            id="checkout-notes"
            value={formValues.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder="Alguna indicación adicional..."
            maxLength={300}
            className="h-20 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#C1121F]/40 focus:ring-2 focus:ring-[#C1121F]/15"
          />
        </section>

        {/* Sugerencias (compactas) — antes del resumen */}
        <UltimoAntojoSection />

        {/* Resumen de pago */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-700">
              Total ({items.length} {items.length === 1 ? "producto" : "productos"})
            </span>
            <span className="text-xl font-extrabold tabular-nums text-[#C1121F]">
              {formatPrice(total)}
            </span>
          </div>
        </section>

        <button
          type="button"
          onClick={() => void submit()}
          disabled={isSubmitting || items.length === 0 || !isFormReady}
          className="min-h-[48px] w-full rounded-xl bg-[#C1121F] px-6 py-3.5 text-base font-bold text-white shadow-lg transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 disabled:shadow-none"
        >
          {isSubmitting ? "Procesando..." : "Confirmar pedido"}
        </button>

        {!isFormReady && (
          <p className="text-center text-xs font-medium text-zinc-500">
            Completá nombre, teléfono{isDelivery ? " y dirección" : ""} para continuar.
          </p>
        )}
      </div>
    </div>
  );
}
