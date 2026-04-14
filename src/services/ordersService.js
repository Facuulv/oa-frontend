import { apiPaths } from "@/config/apiPaths";
import { requireApiBaseUrl } from "@/utils/api/baseUrl";
import { getToken } from "@/utils/auth/token";
import { logApiRequest } from "@/utils/api/requestLog";

function authHeaders() {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

const PAYMENT_METHOD_MAP = {
  efectivo: "CASH",
  cash: "CASH",
  transferencia: "TRANSFER",
  transfer: "TRANSFER",
  mercadopago: "MERCADOPAGO",
  MERCADOPAGO: "MERCADOPAGO",
  CASH: "CASH",
  TRANSFER: "TRANSFER",
};

function mapPaymentMethod(raw) {
  const key = String(raw ?? "efectivo").trim().toLowerCase();
  return PAYMENT_METHOD_MAP[key] || PAYMENT_METHOD_MAP[raw] || "CASH";
}

function toBackendOrderBody(payload) {
  const customer = payload.customer ?? {};
  const customerName = String(customer.nombre ?? customer.name ?? "").trim();
  const customerPhone = String(customer.telefono ?? customer.phone ?? "").trim() || null;
  let customerEmail = String(customer.email ?? "").trim();
  if (!customerEmail) {
    customerEmail = "noreply@example.com";
  }

  const items = (payload.items ?? []).map((item) => ({
    productId: Number(item.productId ?? item.articuloId ?? item.id),
    quantity: Number(item.quantity ?? item.cantidad ?? 1),
    unitPrice: Number(item.precioUnitario ?? item.unitPrice ?? 0),
    notes: String(item.observations ?? item.observaciones ?? "").trim() || null,
  }));

  const deliveryAddress =
    payload.deliveryType === "DELIVERY"
      ? String(payload.address ?? customer.direccion ?? "").trim() || null
      : null;

  const meta = [];
  if (payload.deliveryType) meta.push(`deliveryType:${payload.deliveryType}`);
  if (payload.when) meta.push(`when:${payload.when}`);
  if (payload.scheduledTime) meta.push(`scheduledTime:${payload.scheduledTime}`);
  const notesBase = String(payload.notes ?? "").trim();
  const notesExtra = meta.length ? meta.join(" | ") : "";
  const notes = [notesBase, notesExtra].filter(Boolean).join(" — ") || null;

  return {
    items,
    couponCode: String(payload.couponCode ?? "").trim() || null,
    deliveryAddress,
    customerName,
    customerEmail,
    customerPhone,
    notes,
    paymentMethod: mapPaymentMethod(payload.paymentMethod),
  };
}

export async function createOrder(payload) {
  const base = requireApiBaseUrl();
  const url = `${base}${apiPaths.public.orders}`;
  const body = toBackendOrderBody(payload);
  logApiRequest("POST", url, { items: body.items?.length });
  const response = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const validationDetails = Array.isArray(data?.errors) ? data.errors : [];
    const detailMessage =
      validationDetails.length > 0
        ? String(validationDetails[0].message ?? validationDetails[0]).replace(/^[^.]*:\s*/, "")
        : null;
    const msg =
      detailMessage ?? data?.message ?? data?.error ?? `Error ${response.status}`;
    const error = new Error(msg);
    error.details = validationDetails;
    throw error;
  }

  return data;
}

export async function createMercadoPagoCheckout(payload) {
  const base = requireApiBaseUrl();
  const url = `${base}${apiPaths.public.checkoutPreference}`;
  const body = toBackendOrderBody({
    ...payload,
    paymentMethod: "MERCADOPAGO",
  });
  logApiRequest("POST", url, { items: body.items?.length });
  const response = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg =
      data?.message ?? data?.error ??
      "No pudimos iniciar el pago con Mercado Pago. Intentá nuevamente.";
    throw new Error(msg);
  }

  return data;
}

export async function getPaymentStatus(orderId) {
  if (!orderId) throw new Error("Falta el identificador del pedido.");

  const token = getToken();
  if (!token) {
    throw new Error("No pudimos verificar el estado del pago.");
  }

  const data = await getMyOrders();
  const list = Array.isArray(data) ? data : data?.data ?? [];
  const order = list.find((o) => String(o.id) === String(orderId));
  if (!order) {
    throw new Error("No pudimos verificar el estado del pago.");
  }

  const paymentStatus = (order.payment_status ?? order.paymentStatus ?? "").toLowerCase();
  return {
    orderId: order.id,
    status: order.status,
    paymentStatus: paymentStatus || String(order.status ?? "").toLowerCase(),
  };
}

export async function getMyOrders() {
  const base = requireApiBaseUrl();
  const url = `${base}${apiPaths.orders.myList}`;
  logApiRequest("GET", url);
  const response = await fetch(url, {
    method: "GET",
    headers: authHeaders(),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message ?? data?.error ?? "Error al obtener pedidos");
  }
  return data;
}
