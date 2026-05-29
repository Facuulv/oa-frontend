export const WHATSAPP_FOLLOWUP_NOTE = "El seguimiento continúa por WhatsApp.";
export const ORDER_SENT_TO_STORE_LABEL = "Pedido enviado al local";
export const ORDER_CANCELLED_LABEL = "Pedido cancelado";

const EMPTY_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

/** Copy de listado/detalle: no presentar estados DB como tracking en tiempo real. */
export function getOrderCustomerSummary(status) {
  const key = String(status ?? "").toUpperCase();
  if (key === "CANCELLED") {
    return {
      label: ORDER_CANCELLED_LABEL,
      hint: WHATSAPP_FOLLOWUP_NOTE,
      className: "bg-zinc-200 text-zinc-600",
    };
  }
  return {
    label: ORDER_SENT_TO_STORE_LABEL,
    hint: WHATSAPP_FOLLOWUP_NOTE,
    className: "bg-emerald-50 text-emerald-800",
  };
}

export function getDeliveryLabel(order) {
  const tipo = String(order?.tipo_entrega ?? "").toUpperCase();
  if (tipo === "DELIVERY" || tipo === "ENVIO") return "Delivery";
  if (tipo === "RETIRO") return "Retiro en local";
  return "Entrega";
}

export function formatOrderDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function normalizeMyOrdersPage(data) {
  const orders = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  const raw = data?.pagination ?? {};
  const page = Math.max(1, Number(raw.page) || 1);
  const limit = Math.max(1, Number(raw.limit) || 10);
  const total = Math.max(0, Number(raw.total) || 0);
  const totalPages =
    Number(raw.totalPages) > 0 ? Number(raw.totalPages) : total > 0 ? Math.ceil(total / limit) : 0;

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: Boolean(raw.hasNextPage ?? page < totalPages),
      hasPrevPage: Boolean(raw.hasPrevPage ?? page > 1),
    },
  };
}

/** @deprecated Usar normalizeMyOrdersPage */
export function normalizeMyOrdersResponse(data) {
  return normalizeMyOrdersPage(data).orders;
}

export function normalizeMyOrderDetail(data) {
  const order = data?.data ?? data;
  if (!order || typeof order !== "object") return null;
  const items = Array.isArray(order.items) ? order.items : [];
  return { ...order, items };
}

export function createEmptyPagination(limit = 10) {
  return { ...EMPTY_PAGINATION, limit };
}

const WHEN_LABELS = {
  CUANTO_ANTES: "Lo antes posible",
  PROGRAMADO: "Programado",
};

const DELIVERY_TYPE_LABELS = {
  DELIVERY: "Delivery",
  RETIRO: "Retiro en local",
  ENVIO: "Delivery",
};

function parseMetaPairs(metaString) {
  if (!metaString?.trim()) return [];
  return metaString
    .split(/\s*\|\s*/)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function humanizeMetaPair(pair, { omitDeliveryType }) {
  const colon = pair.indexOf(":");
  if (colon < 0) return pair;

  const key = pair.slice(0, colon).trim().toLowerCase();
  const value = pair.slice(colon + 1).trim();
  if (!value) return null;

  if (key === "deliverytype") {
    if (omitDeliveryType) return null;
    return DELIVERY_TYPE_LABELS[value.toUpperCase()] ?? `Entrega: ${value}`;
  }
  if (key === "when") {
    return WHEN_LABELS[value.toUpperCase()] ?? `Cuándo: ${value.replace(/_/g, " ").toLowerCase()}`;
  }
  if (key === "scheduledtime") {
    return `Horario: ${value}`;
  }

  return null;
}

/**
 * Separa notas del usuario y metadata técnica del checkout para mostrar en detalle.
 * @param {string | null | undefined} notes
 * @param {{ omitDeliveryType?: boolean }} [options]
 * @returns {{ userText: string | null, metaLines: string[], hasContent: boolean, fallback: string | null }}
 */
export function formatOrderNotesForDisplay(notes, { omitDeliveryType = true } = {}) {
  const raw = String(notes ?? "").trim();
  if (!raw) {
    return { userText: null, metaLines: [], hasContent: false, fallback: null };
  }

  const metaSeparator = " — ";
  const separatorIndex = raw.indexOf(metaSeparator);
  let userText = "";
  let metaString = "";

  if (separatorIndex >= 0) {
    userText = raw.slice(0, separatorIndex).trim();
    metaString = raw.slice(separatorIndex + metaSeparator.length).trim();
  } else if (/^\w+:[^|]+(\s*\|\s*\w+:[^|]+)*$/.test(raw)) {
    metaString = raw;
  } else {
    return { userText: raw, metaLines: [], hasContent: true, fallback: null };
  }

  const metaLines = [];
  for (const pair of parseMetaPairs(metaString)) {
    const line = humanizeMetaPair(pair, { omitDeliveryType });
    if (line) metaLines.push(line);
  }

  const hasContent = Boolean(userText) || metaLines.length > 0;
  if (!hasContent) {
    return { userText: null, metaLines: [], hasContent: true, fallback: raw };
  }

  return {
    userText: userText || null,
    metaLines,
    hasContent: true,
    fallback: null,
  };
}
