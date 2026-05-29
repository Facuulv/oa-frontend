import { apiPaths } from "@/config/apiPaths";
import { requireApiBaseUrl } from "@/utils/api/baseUrl";

const REFRESH_MS = 30_000;

const EMPTY_CONFIG = {
  whatsappPedidos: null,
  cartaHabilitada: false,
  fetchError: true,
};

let cached = { ...EMPTY_CONFIG };
let lastFetchAt = 0;
let inflight = null;

export function getCachedConfigPublica() {
  return { ...cached };
}

function normalizeWhatsapp(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return null;
  if (!/^549\d{8,10}$/.test(digits)) return null;
  return digits;
}

export async function fetchConfigPublica({ force = false } = {}) {
  const now = Date.now();
  if (!force && now - lastFetchAt < REFRESH_MS && !cached.fetchError) {
    return getCachedConfigPublica();
  }

  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const base = requireApiBaseUrl();
      const url = `${base}${apiPaths.public.cartaConfig}`;
      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();
      const raw = json?.data ?? json;

      cached = {
        whatsappPedidos: normalizeWhatsapp(raw?.whatsappPedidos),
        cartaHabilitada: raw?.cartaHabilitada !== false,
        fetchError: false,
      };
      lastFetchAt = Date.now();
      return getCachedConfigPublica();
    } catch (error) {
      console.warn("[configPublica] Error consultando API:", error?.message || error);
      cached = { ...EMPTY_CONFIG };
      lastFetchAt = Date.now();
      return getCachedConfigPublica();
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}
