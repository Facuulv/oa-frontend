"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, selectCartItems, selectCartTotal } from "@/store/useCartStore";
import {
  useUserDataStore,
  selectUserAddresses,
  selectUserProfile,
} from "@/store/useUserDataStore";
import { useAuthStore, selectAuthLoading, selectIsAuthenticatedCliente } from "@/store/useAuthStore";
import { toast } from "@/lib/toast";
import { createOrder } from "@/services/ordersService";
import { validateCheckoutForm } from "@/utils/checkout/checkoutValidations";
import { buildCheckoutPayload, resolveCreatedOrderMeta } from "@/utils/checkout/checkoutPayload";
import { buildWhatsappMessage, buildWhatsappUrl } from "@/utils/checkout/buildWhatsappMessage";
import { useStoreStatus } from "@/hooks/useStoreStatus";
import { fetchConfigPublica } from "@/services/configPublicaService";
import { fetchEstadoTienda } from "@/services/estadoTiendaService";

const STORE_CLOSED_MESSAGE =
  "Estamos cerrados. Podés volver a realizar tu pedido dentro del horario de atención.";

export const CHECKOUT_FINALIZE_PATH = "/checkout/finalizar";
export const CHECKOUT_FINALIZE_LOGIN_NEXT = `/login?next=${encodeURIComponent(CHECKOUT_FINALIZE_PATH)}`;
export const CHECKOUT_LOGIN_REDIRECT_MESSAGE = "Redirigiendo al login…";

export function redirectToCheckoutLogin(router) {
  toast.info(CHECKOUT_LOGIN_REDIRECT_MESSAGE);
  router.replace(CHECKOUT_FINALIZE_LOGIN_NEXT);
}

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
  const router = useRouter();
  const items = useCartStore(selectCartItems);
  const total = useCartStore(selectCartTotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const authLoading = useAuthStore(selectAuthLoading);
  const isAuthenticatedCliente = useAuthStore(selectIsAuthenticatedCliente);
  const authUser = useAuthStore((s) => s.user);
  const savedProfile = useUserDataStore(selectUserProfile);
  const savedAddresses = useUserDataStore(selectUserAddresses);
  const saveFromOrder = useUserDataStore((s) => s.saveFromOrder);

  const [mounted, setMounted] = useState(false);
  const [formValues, setFormValues] = useState(INITIAL_CHECKOUT_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSent, setOrderSent] = useState(null);
  const [whatsappPedidos, setWhatsappPedidos] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);

  const {
    canAcceptOrders,
    isLoading: storeStatusLoading,
    mensaje: storeMensaje,
    nextOpeningText,
    fetchError: storeFetchError,
    refetch: refetchStoreStatus,
  } = useStoreStatus();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setConfigLoading(true);
    fetchConfigPublica()
      .then((cfg) => {
        if (!cancelled) setWhatsappPedidos(cfg.whatsappPedidos);
      })
      .finally(() => {
        if (!cancelled) setConfigLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (authUser?.origen === "ADMIN") {
      router.replace("/admin");
      return;
    }
    if (!isAuthenticatedCliente) {
      redirectToCheckoutLogin(router);
    }
  }, [authLoading, isAuthenticatedCliente, authUser, router]);

  const authDisplayName = useMemo(() => {
    if (!authUser) return "";
    const full = [authUser.nombre, authUser.apellido].filter(Boolean).join(" ").trim();
    return full || authUser.name || "";
  }, [authUser]);

  useEffect(() => {
    if (!mounted) return;

    if (isAuthenticatedCliente && authUser) {
      setFormValues((prev) => ({
        ...prev,
        nombre: authDisplayName,
        telefono: authUser.telefono ?? "",
        email: authUser.email ?? "",
        direccion: prev.direccion || savedAddresses[0]?.direccion || "",
      }));
      return;
    }

    setFormValues((prev) => ({
      ...prev,
      nombre: prev.nombre || savedProfile.nombre || "",
      telefono: prev.telefono || savedProfile.telefono || "",
      email: prev.email || savedProfile.email || "",
      direccion: prev.direccion || savedAddresses[0]?.direccion || "",
    }));
  }, [
    mounted,
    isAuthenticatedCliente,
    authUser,
    authDisplayName,
    savedProfile,
    savedAddresses,
  ]);

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

  const submit = async () => {
    if (items.length === 0 || isSubmitting) return { ok: false };
    if (authLoading) return { ok: false };

    if (authUser?.origen === "ADMIN") {
      toast.error("La sesión de administración no se puede usar para comprar.");
      router.replace("/admin");
      return { ok: false };
    }

    if (!isAuthenticatedCliente) {
      redirectToCheckoutLogin(router);
      return { ok: false };
    }

    const [estado, config] = await Promise.all([
      fetchEstadoTienda({ force: true }),
      fetchConfigPublica({ force: true }),
    ]);
    setWhatsappPedidos(config.whatsappPedidos);

    if (!config.whatsappPedidos) {
      toast.error(
        "WhatsApp del local no configurado. No podemos finalizar el pedido en este momento.",
      );
      refetchStoreStatus();
      return { ok: false };
    }

    if (!config.cartaHabilitada || !estado.canAcceptOrders) {
      toast.error(
        estado.mensaje ||
          storeMensaje ||
          STORE_CLOSED_MESSAGE,
      );
      refetchStoreStatus();
      return { ok: false };
    }

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
      const { payload, error: payloadError } = buildCheckoutPayload({ normalized, items });
      if (payloadError || !payload) {
        toast.error(payloadError ?? "No pudimos preparar el pedido. Revisá el carrito.");
        return { ok: false };
      }

      const created = await createOrder(payload);
      const { orderId } = resolveCreatedOrderMeta(created);
      if (!orderId) {
        throw new Error("No recibimos el número de pedido. Intentá nuevamente.");
      }

      saveFromOrder({
        nombre: normalized.nombre,
        telefono: normalized.telefono,
        email: normalized.email,
        direccion: isDelivery ? normalized.direccion : "",
      });

      const message = buildWhatsappMessage({
        orderId,
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

      const url = buildWhatsappUrl(message, config.whatsappPedidos);
      if (!url) {
        toast.error(
          "WhatsApp del local no configurado. Tu pedido quedó registrado; contactá al local por otro medio.",
        );
        clearCart();
        setOrderSent({ orderId, url: null, whatsappOpened: false });
        return { ok: true, orderId, url: null };
      }

      const popup = window.open(url, "_blank", "noopener,noreferrer");

      clearCart();
      setOrderSent({ orderId, url, whatsappOpened: Boolean(popup) });
      return { ok: true, orderId, url };
    } catch (error) {
      const code = error?.code;
      if (code === "STORE_CLOSED" || code === "CARTA_CERRADA") {
        toast.error(error?.message || STORE_CLOSED_MESSAGE);
        refetchStoreStatus();
        return { ok: false };
      }
      toast.error(error?.message ?? "Error al crear el pedido. Intentá de nuevo.");
      return { ok: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkoutBlocked =
    storeStatusLoading ||
    configLoading ||
    !canAcceptOrders ||
    !whatsappPedidos;

  const checkoutBlockedReason = (() => {
    if (storeStatusLoading || configLoading) return null;
    if (!whatsappPedidos) {
      return "WhatsApp del local no configurado. No podemos finalizar pedidos por ahora.";
    }
    if (!canAcceptOrders) {
      return storeFetchError
        ? storeMensaje
        : storeMensaje || STORE_CLOSED_MESSAGE;
    }
    return null;
  })();

  return {
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
    canAcceptOrders,
    storeStatusLoading,
    configLoading,
    checkoutBlocked,
    checkoutBlockedReason,
    nextOpeningText,
    storeFetchError,
  };
}
