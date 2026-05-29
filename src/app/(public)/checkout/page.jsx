"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useCartStore,
  selectCartItems,
  selectCartTotal,
  selectCartCount,
} from "@/store/useCartStore";
import {
  useAuthStore,
  selectAuthLoading,
  selectIsAuthenticatedCliente,
} from "@/store/useAuthStore";
import {
  CHECKOUT_FINALIZE_PATH,
  redirectToCheckoutLogin,
} from "@/hooks/checkout/useCheckoutFinalize";
import { toast } from "@/lib/toast";
import CheckoutShell from "@/components/checkout/CheckoutShell";
import CheckoutItemCard from "@/components/checkout/CheckoutItemCard";
import CheckoutEmptyState from "@/components/checkout/CheckoutEmptyState";
import CheckoutSummaryCard from "@/components/checkout/CheckoutSummaryCard";
import PublicPageHeader from "@/components/public/PublicPageHeader";
import { CHECKOUT_LAYOUT_CLASS, CHECKOUT_LIST_CLASS, CHECKOUT_SUMMARY_PANEL_CLASS } from "@/constants/homeTheme";
import { useStoreStatus } from "@/hooks/useStoreStatus";

function buildCartHeaderSubtitle(lineCount, unitCount) {
  if (lineCount === 0) return undefined;
  if (unitCount === lineCount) {
    return lineCount === 1 ? "1 producto" : `${lineCount} productos`;
  }
  const lines = lineCount === 1 ? "1 producto" : `${lineCount} productos`;
  const units = unitCount === 1 ? "1 unidad" : `${unitCount} unidades`;
  return `${lines} · ${units}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore(selectCartItems);
  const total = useCartStore(selectCartTotal);
  const unitCount = useCartStore(selectCartCount);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const authLoading = useAuthStore(selectAuthLoading);
  const {
    canAcceptOrders,
    isLoading: storeStatusLoading,
    mensaje: storeMensaje,
    nextOpeningText,
  } = useStoreStatus();

  const headerSubtitle = useMemo(
    () => buildCartHeaderSubtitle(items.length, unitCount),
    [items.length, unitCount],
  );

  const handleFinalizePedido = () => {
    if (!canAcceptOrders) {
      toast.error(
        storeMensaje ||
          "Estamos cerrados. Podés volver a realizar tu pedido dentro del horario de atención.",
      );
      return;
    }
    if (authLoading) {
      router.push(CHECKOUT_FINALIZE_PATH);
      return;
    }
    const state = useAuthStore.getState();
    if (state.user?.origen === "ADMIN") {
      toast.error("La sesión de administración no se puede usar para comprar.");
      router.replace("/admin");
      return;
    }
    if (!selectIsAuthenticatedCliente(state)) {
      redirectToCheckoutLogin(router);
      return;
    }
    router.push(CHECKOUT_FINALIZE_PATH);
  };

  if (items.length === 0) return <CheckoutEmptyState />;

  return (
    <CheckoutShell>
      <PublicPageHeader
        title="Mi carrito"
        subtitle={headerSubtitle}
        className="mb-4 md:mb-5"
      />

      <div className={CHECKOUT_LAYOUT_CLASS}>
        <div className={CHECKOUT_LIST_CLASS}>
          {items.map((item) => (
            <CheckoutItemCard
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>

        <div className={CHECKOUT_SUMMARY_PANEL_CLASS}>
          <CheckoutSummaryCard
            variant="desktop-panel"
            total={total}
            itemLineCount={items.length}
            unitCount={unitCount}
            onCheckout={handleFinalizePedido}
            checkoutDisabled={storeStatusLoading || !canAcceptOrders}
            closedHint={
              !canAcceptOrders && !storeStatusLoading
                ? storeMensaje || nextOpeningText
                : null
            }
          />
        </div>
      </div>

      <CheckoutSummaryCard
        variant="mobile-bar"
        total={total}
        itemLineCount={items.length}
        unitCount={unitCount}
        onCheckout={handleFinalizePedido}
        checkoutDisabled={storeStatusLoading || !canAcceptOrders}
        closedHint={
          !canAcceptOrders && !storeStatusLoading
            ? storeMensaje || nextOpeningText
            : null
        }
      />
    </CheckoutShell>
  );
}
