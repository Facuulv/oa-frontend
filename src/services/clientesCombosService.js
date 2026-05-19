import { apiPaths } from "@/config/apiPaths";
import { requireApiBaseUrl } from "@/utils/api/baseUrl";
import { logApiRequest } from "@/utils/api/requestLog";

function notifyClientUnauthorized(status) {
  if (status === 401 && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
  }
}

function parseErrorMessage(data, fallback) {
  return data?.message ?? data?.error ?? fallback;
}

export async function getClienteCombos() {
  const base = requireApiBaseUrl();
  const url = `${base}${apiPaths.clientes.combos}`;
  logApiRequest("GET", url);
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    notifyClientUnauthorized(response.status);
    const error = new Error(parseErrorMessage(data, "No pudimos cargar tus combos"));
    error.status = response.status;
    throw error;
  }
  return Array.isArray(data?.data) ? data.data : [];
}

export async function createClienteCombo(payload) {
  const base = requireApiBaseUrl();
  const url = `${base}${apiPaths.clientes.combos}`;
  logApiRequest("POST", url);
  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    notifyClientUnauthorized(response.status);
    const error = new Error(parseErrorMessage(data, "No pudimos guardar el combo"));
    error.status = response.status;
    throw error;
  }
  return data?.data ?? null;
}

export async function deleteClienteCombo(comboId) {
  const base = requireApiBaseUrl();
  const url = `${base}${apiPaths.clientes.comboById(comboId)}`;
  logApiRequest("DELETE", url);
  const response = await fetch(url, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    notifyClientUnauthorized(response.status);
    const error = new Error(parseErrorMessage(data, "No pudimos eliminar el combo"));
    error.status = response.status;
    throw error;
  }
}
