"use client";

import { useRouter } from "next/navigation";
import CheckoutShell from "@/components/checkout/CheckoutShell";
import CheckoutOrderSuccessPanel from "@/components/checkout/CheckoutOrderSuccessPanel";
import CheckoutDiscountCodeTeaser from "@/components/checkout/CheckoutDiscountCodeTeaser";
import CheckoutFinalizeSummaryPanel from "@/components/checkout/CheckoutFinalizeSummaryPanel";
import UltimoAntojoSection from "@/components/checkout/UltimoAntojoSection";
import AddressAutocompleteInput from "@/components/checkout/AddressAutocompleteInput";
import PublicPageHeader from "@/components/public/PublicPageHeader";
import { useCheckoutFinalize } from "@/hooks/checkout/useCheckoutFinalize";
import { cn } from "@/lib/cn";
import {
  ACCOUNT_FORM_GRID_CLASS,
  CHECKOUT_FINALIZE_CARD_CLASS,
  CHECKOUT_FINALIZE_LAYOUT_CLASS,
  CHECKOUT_FINALIZE_PAGE_CLASS,
  CHECKOUT_FINALIZE_SECTION_CLASS,
  CHECKOUT_FINALIZE_SUCCESS_SECTION_CLASS,
  CHECKOUT_FINALIZE_SELECTOR_ACTIVE_CLASS,
  CHECKOUT_FINALIZE_SELECTOR_BASE_CLASS,
  CHECKOUT_FINALIZE_SELECTOR_IDLE_CLASS,
  CHECKOUT_FINALIZE_SUMMARY_PANEL_CLASS,
  COMBO_SUMMARY_INPUT_CLASS,
  PUBLIC_FORM_INPUT_CLASS,
} from "@/constants/homeTheme";

function FieldLabel({ htmlFor, children, required, optional }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-zinc-700">
      {children}
      {required ? <span className="text-primary"> *</span> : null}
      {optional ? <span className="text-zinc-400"> (opcional)</span> : null}
    </label>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-primary">{message}</p>;
}

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
    checkoutBlocked,
    checkoutBlockedReason,
    storeStatusLoading,
    configLoading,
    nextOpeningText,
  } = useCheckoutFinalize();

  const inputClass = (field) =>
    cn(
      PUBLIC_FORM_INPUT_CLASS,
      fieldErrors[field] &&
        "border-primary ring-2 ring-primary/15 focus:border-primary",
    );

  const selectorClass = (selected, disabled = false) =>
    cn(
      CHECKOUT_FINALIZE_SELECTOR_BASE_CLASS,
      selected
        ? CHECKOUT_FINALIZE_SELECTOR_ACTIVE_CLASS
        : CHECKOUT_FINALIZE_SELECTOR_IDLE_CLASS,
      selected ? "text-primary" : "bg-white text-zinc-700",
      !selected && !disabled && "hover:border-zinc-300",
      disabled && "cursor-not-allowed opacity-50",
    );

  const paymentOptions = [
    { value: "efectivo", label: "Efectivo" },
    { value: "transferencia", label: "Transferencia" },
  ];

  const summaryProps = {
    items,
    total,
    isSubmitting,
    isFormReady,
    checkoutBlocked,
    checkoutBlockedReason,
    nextOpeningText,
    storeStatusLoading,
    configLoading,
    isDelivery,
    onConfirm: () => void submit(),
  };

  const shellProps = {
    pageClassName: CHECKOUT_FINALIZE_PAGE_CLASS,
    sectionClassName: CHECKOUT_FINALIZE_SECTION_CLASS,
  };

  if (authLoading || !isAuthenticatedCliente || authUser?.origen === "ADMIN") {
    return (
      <CheckoutShell ariaLabel="Finalizar pedido" {...shellProps}>
        <div className="mx-auto max-w-md animate-pulse space-y-4 py-6">
          <div className="h-8 w-48 rounded bg-zinc-200" />
          <div className="h-32 rounded-2xl bg-zinc-100" />
          <div className="h-32 rounded-2xl bg-zinc-100" />
          <div className="h-32 rounded-2xl bg-zinc-100" />
          <div className="h-12 rounded-xl bg-zinc-200" />
        </div>
      </CheckoutShell>
    );
  }

  if (orderSent) {
    return (
      <CheckoutShell
        ariaLabel="Pedido registrado"
        pageClassName={CHECKOUT_FINALIZE_PAGE_CLASS}
        sectionClassName={CHECKOUT_FINALIZE_SUCCESS_SECTION_CLASS}
      >
        <CheckoutOrderSuccessPanel
          orderId={orderSent.orderId}
          whatsappOpened={orderSent.whatsappOpened}
          url={orderSent.url}
          onGoHome={() => router.push("/")}
        />
      </CheckoutShell>
    );
  }

  return (
    <CheckoutShell ariaLabel="Finalizar pedido" {...shellProps}>
      <PublicPageHeader
        title="Finalizar pedido"
        subtitle="Completá tus datos para confirmar el pedido por WhatsApp."
        className="mb-4 md:mb-5"
      />

      <div className={CHECKOUT_FINALIZE_LAYOUT_CLASS}>
        <div className="flex min-w-0 flex-col gap-4 md:gap-5">
          {/* Tus datos */}
          <section className={CHECKOUT_FINALIZE_CARD_CLASS} aria-labelledby="checkout-datos-heading">
            <h2
              id="checkout-datos-heading"
              className="home-section-header__accent mb-1 text-sm font-bold text-foreground md:text-base"
            >
              Tus datos
            </h2>
            <p className="mb-4 text-xs text-zinc-500 sm:text-sm">
              Usamos esta información para confirmarte el pedido por WhatsApp.
            </p>
            <div className={ACCOUNT_FORM_GRID_CLASS}>
              <div className="md:col-span-2">
                <FieldLabel htmlFor="checkout-nombre" required>
                  Nombre
                </FieldLabel>
                <input
                  id="checkout-nombre"
                  name="nombre"
                  autoComplete="name"
                  value={formValues.nombre}
                  onChange={(e) => updateField("nombre", e.target.value)}
                  placeholder="Cómo te llamamos"
                  className={inputClass("nombre")}
                />
                <FieldError message={fieldErrors.nombre} />
              </div>
              <div>
                <FieldLabel htmlFor="checkout-telefono" required>
                  Teléfono
                </FieldLabel>
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
                <FieldError message={fieldErrors.telefono} />
              </div>
              <div>
                <FieldLabel htmlFor="checkout-email" optional>
                  Email
                </FieldLabel>
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
                <FieldError message={fieldErrors.email} />
              </div>
            </div>
          </section>

          {/* Entrega */}
          <section className={CHECKOUT_FINALIZE_CARD_CLASS} aria-labelledby="checkout-entrega-heading">
            <h2
              id="checkout-entrega-heading"
              className="home-section-header__accent mb-4 text-sm font-bold text-foreground md:text-base"
            >
              Entrega
            </h2>
            <div className="flex gap-2">
              {["RETIRO", "DELIVERY"].map((type) => {
                const selected = formValues.deliveryType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateField("deliveryType", type)}
                    className={selectorClass(selected)}
                  >
                    {type === "RETIRO" ? "Retiro en local" : "Delivery"}
                  </button>
                );
              })}
            </div>
            {isDelivery && (
              <div className="mt-4 space-y-3">
                <AddressAutocompleteInput
                  value={formValues.direccion}
                  onChange={(value) => updateField("direccion", value)}
                  location={
                    Number.isFinite(formValues.direccionLat) &&
                    Number.isFinite(formValues.direccionLng)
                      ? { lat: formValues.direccionLat, lng: formValues.direccionLng }
                      : null
                  }
                  onLocationChange={(coords) => {
                    updateField("direccionLat", coords?.lat ?? null);
                    updateField("direccionLng", coords?.lng ?? null);
                  }}
                  error={fieldErrors.direccion}
                  savedAddresses={savedAddresses}
                  required
                />
                <div>
                  <FieldLabel htmlFor="checkout-pisoDepto" optional>
                    Piso / Departamento
                  </FieldLabel>
                  <input
                    id="checkout-pisoDepto"
                    name="pisoDepto"
                    value={formValues.pisoDepto}
                    onChange={(e) => updateField("pisoDepto", e.target.value)}
                    placeholder="Ej. Piso 3, Depto B"
                    className={inputClass("pisoDepto")}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Método de pago */}
          <section className={CHECKOUT_FINALIZE_CARD_CLASS} aria-labelledby="checkout-pago-heading">
            <h2
              id="checkout-pago-heading"
              className="home-section-header__accent mb-4 text-sm font-bold text-foreground md:text-base"
            >
              Método de pago
            </h2>
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
                    className={selectorClass(selected, disabled)}
                    aria-disabled={disabled}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {isDelivery && (
              <p className="mt-3 text-xs text-zinc-500 sm:text-sm">
                El pago en efectivo solo es válido para retiro en local.
              </p>
            )}
          </section>

          {/* Notas */}
          <section className={CHECKOUT_FINALIZE_CARD_CLASS} aria-labelledby="checkout-notas-heading">
            <label
              id="checkout-notas-heading"
              htmlFor="checkout-notes"
              className="home-section-header__accent mb-3 block text-sm font-bold text-foreground md:text-base"
            >
              Notas
            </label>
            <textarea
              id="checkout-notes"
              value={formValues.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Alguna indicación adicional..."
              maxLength={300}
              className={cn(
                COMBO_SUMMARY_INPUT_CLASS,
                "min-h-[5rem] resize-none py-2.5 font-normal",
              )}
            />
          </section>

          <UltimoAntojoSection />

          <CheckoutDiscountCodeTeaser />

          {/* Resumen mobile */}
          <div className="lg:hidden">
            <CheckoutFinalizeSummaryPanel {...summaryProps} />
          </div>
        </div>

        {/* Resumen desktop sticky */}
        <div className={CHECKOUT_FINALIZE_SUMMARY_PANEL_CLASS}>
          <CheckoutFinalizeSummaryPanel {...summaryProps} />
        </div>
      </div>
    </CheckoutShell>
  );
}
