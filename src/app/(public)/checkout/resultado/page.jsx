"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getPaymentStatus } from "@/services/ordersService";
import { useCartStore } from "@/store/useCartStore";
import { resetAfterApprovedPayment } from "@/utils/checkout/resetAfterApprovedPayment";
import { CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";

function ResultContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("pedido_id") ?? searchParams.get("order_id");
  const [status, setStatus] = useState("loading");
  const [orderData, setOrderData] = useState(null);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    if (!orderId) {
      setStatus("error");
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;

    const poll = async () => {
      try {
        const data = await getPaymentStatus(orderId);
        setOrderData(data);

        const paymentState = (data.paymentStatus ?? "").toLowerCase();

        if (paymentState === "approved" || paymentState === "aprobado" || paymentState === "pagado") {
          setStatus("approved");
          resetAfterApprovedPayment(clearCart);
          return;
        }

        if (paymentState === "rejected" || paymentState === "rechazado") {
          setStatus("rejected");
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          setStatus("pending");
          return;
        }

        setTimeout(poll, 3000);
      } catch {
        setStatus("error");
      }
    };

    poll();
  }, [orderId, clearCart]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <Loader2 size={40} className="mb-4 animate-spin text-primary" />
        <p className="text-sm text-gray-600">Verificando estado del pago...</p>
      </div>
    );
  }

  const config = {
    approved: {
      icon: <CheckCircle size={48} className="text-green-500" />,
      title: "Pago aprobado",
      message: "Tu pedido fue procesado correctamente.",
    },
    rejected: {
      icon: <XCircle size={48} className="text-red-500" />,
      title: "Pago rechazado",
      message: "El pago no pudo ser procesado. Intentá nuevamente.",
    },
    pending: {
      icon: <Clock size={48} className="text-yellow-500" />,
      title: "Pago pendiente",
      message: "Tu pago está siendo procesado. Te notificaremos cuando se confirme.",
    },
    error: {
      icon: <XCircle size={48} className="text-gray-400" />,
      title: "Error",
      message: "No pudimos verificar el estado del pago.",
    },
  };

  const c = config[status];

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4">{c.icon}</div>
      <h2 className="mb-2 text-lg font-bold text-gray-800">{c.title}</h2>
      <p className="mb-6 text-sm text-gray-600">{c.message}</p>
      {orderData?.orderId && (
        <p className="mb-4 text-xs text-gray-400">Pedido #{orderData.orderId}</p>
      )}
      <Link
        href="/"
        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white"
      >
        Volver al inicio
      </Link>
    </div>
  );
}

export default function ResultadoPage() {
  return (
    <Suspense>
      <ResultContent />
    </Suspense>
  );
}
