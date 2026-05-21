import { buildCheckoutPayloadCore } from "./buildCheckoutPayloadCore.js";

export function buildCheckoutPayload(args) {
  return buildCheckoutPayloadCore(args);
}

export function resolveCreatedOrderMeta(data) {
  const inner = data?.data ?? data;
  return {
    orderId: inner?.id ?? data?.pedidoId ?? data?.id ?? null,
    status: inner?.status ?? inner?.estado ?? data?.estado ?? "PENDING",
  };
}
