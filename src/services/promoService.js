import apiClient from "./apiClient";
import { apiPaths } from "@/config/apiPaths";

export async function getActivePromotions() {
  const { data } = await apiClient.get(apiPaths.public.promotions);
  return Array.isArray(data) ? data : data?.data ?? [];
}

export async function validateCoupon(code) {
  const { data } = await apiClient.post(apiPaths.public.couponsValidate, { code });
  return data;
}
