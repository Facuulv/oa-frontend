"use client";

import { useEffect, useMemo, useState } from "react";
import { useCartStore, selectCartItems, selectCartTotal } from "@/store/useCartStore";
import {
  useUserDataStore,
  selectUserAddresses,
  selectUserProfile,
} from "@/store/useUserDataStore";
import { validateCheckoutForm } from "@/utils/checkout/checkoutValidations";
import { buildWhatsappMessage, buildWhatsappUrl } from "@/utils/checkout/buildWhatsappMessage";

export const INITIAL_CHECKOUT_FORM = {
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
};

export function useCheckoutFinalize() {
  const items = useCartStore(selectCartItems);
  const total = useCartStore(selectCartTotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const savedProfile = useUserDataStore(selectUserProfile);
  const savedAddresses = useUserDataStore(selectUserAddresses);
  const saveFromOrder = useUserDataStore((s) => s.saveFromOrder);

  const [mounted, setMounted] = useState(false);
  const [formValues, setFormValues] = useState(INITIAL_CHECKOUT_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSent, setOrderSent] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setFormValues((prev) => ({
      ...prev,
      nombre: prev.nombre || savedProfile.nombre || "",
      telefono: prev.telefono || savedProfile.telefono || "",
      email: prev.email || savedProfile.email || "",
      direccion: prev.direccion || savedAddresses[0]?.direccion || "",
    }));
  }, [mounted, savedProfile, savedAddresses]);

  useEffect(() => {
    if (formValues.deliveryType === "DELIVERY" && formValues.paymentMethod === "efectivo") {
      setFormValues((prev) => ({ ...prev, paymentMethod: "transferencia" }));
    }
  }, [formValues.deliveryType, formValues.paymentMethod]);

  const isDelivery = formValues.deliveryType === "DELIVERY";

  const isFormReady = useMemo(() => {
    const hasName = formValues.nombre.trim().length > 0;
    const hasPhone = formValues.telefono.trim().length > 0;
    const hasAddress = !isDelivery || formValues.direccion.trim().length > 0;
    return hasName && hasPhone && hasAddress;
  }, [formValues.nombre, formValues.telefono, formValues.direccion, isDelivery]);

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

  const submit = () => {
    if (items.length === 0 || isSubmitting) return { ok: false };

    setFieldErrors({});
    const { ok, errors, normalized } = validateCheckoutForm(formValues);
    if (!ok) {
      setFieldErrors(errors);
      const firstKey = Object.keys(errors)[0];
      document
        .getElementById(`checkout-${firstKey}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return { ok: false };
    }

    setIsSubmitting(true);
    try {
      saveFromOrder({
        nombre: normalized.nombre,
        telefono: normalized.telefono,
        email: normalized.email,
        direccion: isDelivery ? normalized.direccion : "",
      });

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
      return { ok: true, url };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    items,
    total,
    formValues,
    fieldErrors,
    isSubmitting,
    orderSent,
    isDelivery,
    isFormReady,
    savedAddresses,
    updateField,
    submit,
  };
}
