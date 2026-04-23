import apiClient from "./apiClient";
import { apiPaths } from "@/config/apiPaths";

// --- Pedidos (MANAGER: /orders) ---

export async function getAdminOrders(params = {}) {
  const { data } = await apiClient.get(apiPaths.orders.list, { params });
  return data?.data ?? data;
}

export async function updateOrderStatus(id, estado) {
  const { data } = await apiClient.patch(apiPaths.orders.updateStatus(id), {
    status: estado,
  });
  return data;
}

// --- Promociones (MANAGER: /promotions) ---

export async function getAdminPromotions() {
  const { data } = await apiClient.get(apiPaths.manager.promotions);
  return data?.data ?? data;
}

export async function createPromotion(payload) {
  const { data } = await apiClient.post(apiPaths.manager.promotions, payload);
  return data;
}

export async function updatePromotion(id, payload) {
  const { data } = await apiClient.put(apiPaths.manager.promotionById(id), payload);
  return data;
}

export async function deletePromotion(id) {
  const { data } = await apiClient.delete(apiPaths.manager.promotionById(id));
  return data;
}

// --- Cupones (MANAGER: /coupons) ---

export async function getAdminCoupons() {
  const { data } = await apiClient.get(apiPaths.manager.coupons);
  return data?.data ?? data;
}

export async function createCoupon(payload) {
  const { data } = await apiClient.post(apiPaths.manager.coupons, payload);
  return data;
}

export async function updateCoupon(id, payload) {
  const { data } = await apiClient.put(apiPaths.manager.couponById(id), payload);
  return data;
}

export async function deleteCoupon(id) {
  const { data } = await apiClient.delete(apiPaths.manager.couponById(id));
  return data;
}

// --- Admin rol ADMIN (panel reducido en backend) ---

export async function getAdminDashboard() {
  const { data } = await apiClient.get(apiPaths.admin.dashboard);
  return data;
}

export async function getAdminSettings() {
  const { data } = await apiClient.get(apiPaths.admin.settings);
  return data;
}

export async function updateAdminSettings(payload) {
  const { data } = await apiClient.put(apiPaths.admin.settings, payload);
  return data;
}
