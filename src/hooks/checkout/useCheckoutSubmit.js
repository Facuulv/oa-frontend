import { useCallback } from "react";
import { toast } from "@/lib/toast";
import { createOrder, createMercadoPagoCheckout } from "@/services/ordersService";
import { validateCheckoutForm } from "@/utils/checkout/checkoutValidations";
import {
  buildMercadoPagoCheckoutPayload,
  buildCheckoutPayload,
  resolveCreatedOrderMeta,
} from "@/utils/checkout/checkoutPayload";

export function useCheckoutSubmit({
  items,
  total,
  isSubmitting,
  paymentMethod,
  setFieldErrors,
  setIsSubmitting,
  setOrderCreated,
  clearCart,
  formValues,
}) {
  return useCallback(async () => {
    if (items.length === 0) {
      toast.error("Tu carrito está vacío.");
      return;
    }
    if (isSubmitting) return;

    setFieldErrors({});

    const { ok, errors, normalized } = validateCheckoutForm(formValues);

    if (!ok) {
      setFieldErrors(errors);
      toast.error("Revisá los campos marcados.");
      const firstKey = Object.keys(errors)[0];
      const el = document.getElementById(`checkout-${firstKey}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);

    try {
      if (paymentMethod === "mercadopago") {
        const payloadMP = buildMercadoPagoCheckoutPayload({ normalized, items });
        const mpResponse = await createMercadoPagoCheckout(payloadMP);
        const urlPago = mpResponse?.data?.url_pago ?? mpResponse?.url_pago;

        if (!urlPago || typeof urlPago !== "string") {
          throw new Error("No recibimos una URL de pago válida. Intentá nuevamente.");
        }

        window.location.href = urlPago;
        return;
      }

      const { payload } = buildCheckoutPayload({ normalized, items });
      const data = await createOrder(payload);
      const { orderId, status } = resolveCreatedOrderMeta(data);
      setOrderCreated({ id: orderId, status });
      clearCart();
    } catch (err) {
      const msg =
        err?.message ??
        (paymentMethod === "mercadopago"
          ? "No pudimos iniciar el pago. Intentá nuevamente."
          : "Error al crear el pedido. Intentá de nuevo.");
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [items, isSubmitting, setFieldErrors, formValues, total, setIsSubmitting, clearCart, setOrderCreated, paymentMethod]);
}
