"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, selectCartItems, selectCartTotal } from "@/store/useCartStore";
import { validateCheckoutForm } from "@/utils/checkout/checkoutValidations";
import { buildWhatsappMessage, buildWhatsappUrl } from "@/utils/checkout/buildWhatsappMessage";
import UltimoAntojoSection from "@/components/checkout/UltimoAntojoSection";
import { formatPrice } from "@/utils/format/price";
import { ArrowLeft } from "lucide-react";

export default function CheckoutFinalizarPage() {
  const router = useRouter();
  const items = useCartStore(selectCartItems);
  const total = useCartStore(selectCartTotal);
  const clearCart = useCartStore((s) => s.clearCart);

  const [formValues, setFormValues] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    deliveryType: "RETIRO",
    paymentMethod: "efectivo",
    when: "CUANTO_ANTES",
    scheduledTime: "",
    notes: "",
    couponCode: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSent, setOrderSent] = useState(null);

  // En Delivery, el efectivo no aplica → forzar Transferencia.
  useEffect(() => {
    if (formValues.deliveryType === "DELIVERY" && formValues.paymentMethod === "efectivo") {
      setFormValues((prev) => ({ ...prev, paymentMethod: "transferencia" }));
    }
  }, [formValues.deliveryType, formValues.paymentMethod]);

  const updateField = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSubmit = () => {
    if (items.length === 0 || isSubmitting) return;

    setFieldErrors({});
    const { ok, errors, normalized } = validateCheckoutForm(formValues);

    if (!ok) {
      setFieldErrors(errors);
      const firstKey = Object.keys(errors)[0];
      document
        .getElementById(`checkout-${firstKey}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);
    try {
      const message = buildWhatsappMessage({
        customer: {
          nombre: normalized.nombre,
          telefono: normalized.telefono,
          email: normalized.email,
        },
        items,
        total,
        deliveryType: normalized.deliveryType,
        address: normalized.direccion,
        paymentMethod: normalized.paymentMethod,
        notes: normalized.notes,
      });

      const url = buildWhatsappUrl(message);
      window.open(url, "_blank", "noopener,noreferrer");

      clearCart();
      setOrderSent({ url });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSent) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <span className="text-2xl">✓</span>
        </div>
        <h2 className="mb-2 text-lg font-bold text-gray-800">¡Te llevamos a WhatsApp!</h2>
        <p className="mb-1 text-sm text-gray-600">
          Confirmá el pedido enviando el mensaje al local.
        </p>
        <p className="mb-6 text-sm text-gray-500">
          Si la pestaña no se abrió, tocá el botón de abajo.
        </p>
        <a
          href={orderSent.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white"
        >
          Abrir WhatsApp
        </a>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-3 rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  const inputClass = (field) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition ${
      fieldErrors[field] ? "border-red-400" : "border-gray-200 focus:border-primary"
    }`;

  const isDelivery = formValues.deliveryType === "DELIVERY";

  const paymentOptions = [
    { value: "efectivo", label: "Efectivo" },
    { value: "transferencia", label: "Transferencia" },
  ];

  return (
    <div className="pb-6">
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <button type="button" onClick={() => router.back()} className="rounded-md p-1 text-gray-500">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Finalizar pedido</h1>
      </div>

      <div className="space-y-5 px-4">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Tus datos</h2>
          <div className="space-y-3">
            <div>
              <input
                id="checkout-nombre"
                value={formValues.nombre}
                onChange={(e) => updateField("nombre", e.target.value)}
                placeholder="Nombre *"
                className={inputClass("nombre")}
              />
              {fieldErrors.nombre && <p className="mt-1 text-xs text-red-500">{fieldErrors.nombre}</p>}
            </div>
            <div>
              <input
                id="checkout-telefono"
                value={formValues.telefono}
                onChange={(e) => updateField("telefono", e.target.value)}
                placeholder="Teléfono *"
                className={inputClass("telefono")}
              />
              {fieldErrors.telefono && <p className="mt-1 text-xs text-red-500">{fieldErrors.telefono}</p>}
            </div>
            <div>
              <input
                id="checkout-email"
                type="email"
                value={formValues.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="Email (opcional)"
                className={inputClass("email")}
              />
              {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Entrega</h2>
          <div className="flex gap-2">
            {["RETIRO", "DELIVERY"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => updateField("deliveryType", type)}
                className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition ${
                  formValues.deliveryType === type
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-200 text-gray-600"
                }`}
              >
                {type === "RETIRO" ? "Retiro en local" : "Delivery"}
              </button>
            ))}
          </div>
          {isDelivery && (
            <div className="mt-3">
              <input
                id="checkout-direccion"
                value={formValues.direccion}
                onChange={(e) => updateField("direccion", e.target.value)}
                placeholder="Dirección *"
                className={inputClass("direccion")}
              />
              {fieldErrors.direccion && <p className="mt-1 text-xs text-red-500">{fieldErrors.direccion}</p>}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Método de pago</h2>
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
                  className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition ${
                    selected
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 text-gray-600"
                  } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                  aria-disabled={disabled}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {isDelivery && (
            <p className="mt-2 text-xs text-gray-500">
              El pago en efectivo solo es válido para retiro en local.
            </p>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Notas</h2>
          <textarea
            value={formValues.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder="Alguna indicación adicional..."
            maxLength={300}
            className="h-20 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-primary"
          />
        </section>

        <UltimoAntojoSection />

        <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total ({items.length} productos)</span>
            <span className="text-lg font-extrabold text-primary">{formatPrice(total)}</span>
          </div>
        </section>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || items.length === 0}
          className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50"
        >
          {isSubmitting ? "Procesando..." : "Confirmar pedido"}
        </button>
      </div>
    </div>
  );
}
