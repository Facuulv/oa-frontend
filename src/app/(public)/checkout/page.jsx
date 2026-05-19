"use client";

import { useRouter } from "next/navigation";
import { useCartStore, selectCartItems, selectCartTotal } from "@/store/useCartStore";
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
import CheckoutItemCard from "@/components/checkout/CheckoutItemCard";
import CheckoutEmptyState from "@/components/checkout/CheckoutEmptyState";
import CheckoutFooter from "@/components/checkout/CheckoutFooter";
import { ArrowLeft } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore(selectCartItems);
  const total = useCartStore(selectCartTotal);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const authLoading = useAuthStore(selectAuthLoading);

  const handleFinalizePedido = () => {
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
    <div className="pb-24">
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md p-1 text-gray-500 transition hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Mi carrito</h1>
      </div>

      <div className="space-y-3 px-4">
        {items.map((item) => (
          <CheckoutItemCard
            key={item.id}
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />
        ))}
      </div>

      <CheckoutFooter
        total={total}
        onCheckout={handleFinalizePedido}
      />
    </div>
  );
}
