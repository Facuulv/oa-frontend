import { apiPaths } from "@/config/apiPaths";
import { requireApiBaseUrl } from "@/utils/api/baseUrl";
import { logApiRequest } from "@/utils/api/requestLog";

function jsonHeaders() {
  return { "Content-Type": "application/json" };
}

function notifyClientUnauthorized(status) {
  if (status === 401 && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
  }
}

const PAYMENT_METHOD_MAP = {
  efectivo: "CASH",
  cash: "CASH",
  transferencia: "TRANSFER",
  transfer: "TRANSFER",
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
  const tipoEntrega = payload.deliveryType === "DELIVERY" ? "ENVIO" : "RETIRO";

  return {
    items,
    couponCode: String(payload.couponCode ?? "").trim() || null,
    deliveryAddress,
    customerName,
    customerEmail,
    customerPhone,
    notes,
    tipoEntrega,
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
    credentials: "include",
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    notifyClientUnauthorized(response.status);
    const validationDetails = Array.isArray(data?.errors) ? data.errors : [];
    const detailMessage =
      validationDetails.length > 0
        ? String(validationDetails[0].message ?? validationDetails[0]).replace(/^[^.]*:\s*/, "")
        : null;
    const msg = detailMessage ?? data?.message ?? data?.error ?? `Error ${response.status}`;
    const error = new Error(msg);
    error.details = validationDetails;
    throw error;
  }

  return data;
}

export async function getMyOrderDetail(orderId) {
  const id = String(orderId ?? "").trim();
  if (!id) throw new Error("Falta el identificador del pedido.");

  const base = requireApiBaseUrl();
  const url = `${base}${apiPaths.orders.myDetail(id)}`;
  logApiRequest("GET", url);
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: jsonHeaders(),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    notifyClientUnauthorized(response.status);
    const msg = data?.message ?? data?.error ?? "No pudimos cargar el pedido";
    const error = new Error(msg);
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function getMyOrders({ page = 1, limit = 10 } = {}) {
  const base = requireApiBaseUrl();
  const params = new URLSearchParams({
    page: String(page),
    limit: String(Math.min(Math.max(limit, 1), 100)),
  });
  const url = `${base}${apiPaths.orders.myList}?${params}`;
  logApiRequest("GET", url);
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: jsonHeaders(),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    notifyClientUnauthorized(response.status);
    throw new Error(data?.message ?? data?.error ?? "Error al obtener pedidos");
  }
  return data;
}
