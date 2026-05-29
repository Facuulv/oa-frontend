import { apiPaths } from "@/config/apiPaths";
import { requireApiBaseUrl } from "@/utils/api/baseUrl";

const REFRESH_MS = 30_000;

export const ESTADO_FETCH_ERROR_MESSAGE =
  "No pudimos verificar si la tienda está abierta. Intentá nuevamente en unos segundos.";

const CONSERVATIVE_ESTADO = {
  estaAbierto: false,
  bloqueado: true,
  validarHorarios: true,
  mensaje: ESTADO_FETCH_ERROR_MESSAGE,
  nextOpeningText: null,
  timezone: "America/Argentina/Buenos_Aires",
  canAcceptOrders: false,
  fetchError: true,
};

let cached = { ...CONSERVATIVE_ESTADO };
let lastFetchAt = 0;
let inflight = null;

function computeCanAcceptOrders({ bloqueado, estaAbierto, validarHorarios }) {
  if (bloqueado) return false;
  if (!validarHorarios) return true;
  return Boolean(estaAbierto);
}

function normalizeEstadoPayload(raw) {
  const bloqueado = Boolean(raw?.bloqueado);
  const estaAbierto = Boolean(raw?.estaAbierto);
  const validarHorarios = raw?.validarHorarios !== false;

  return {
    estaAbierto,
    bloqueado,
    validarHorarios,
    mensaje: String(raw?.mensaje || "").trim() || (estaAbierto ? "Estamos abiertos" : "Estamos cerrados"),
    nextOpeningText: raw?.nextOpeningText ?? null,
    timezone: raw?.timezone || "America/Argentina/Buenos_Aires",
    canAcceptOrders: computeCanAcceptOrders({ bloqueado, estaAbierto, validarHorarios }),
    fetchError: false,
  };
}

export function getCachedEstadoTienda() {
  return { ...cached };
}

export async function fetchEstadoTienda({ force = false } = {}) {
  const now = Date.now();
  if (!force && now - lastFetchAt < REFRESH_MS && !cached.fetchError) {
    return getCachedEstadoTienda();
  }

  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const base = requireApiBaseUrl();
      const url = `${base}${apiPaths.public.cartaEstado}`;
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
      if (!raw || typeof raw !== "object") {
        throw new Error("Respuesta inválida");
      }

      cached = normalizeEstadoPayload(raw);
      lastFetchAt = Date.now();
      return getCachedEstadoTienda();
    } catch (error) {
      console.warn("[estadoTienda] Error consultando API:", error?.message || error);
      cached = { ...CONSERVATIVE_ESTADO };
      lastFetchAt = Date.now();
      return getCachedEstadoTienda();
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export function mapEstadoToStoreStatus(estado = cached) {
  return {
    isOpen: estado.canAcceptOrders,
    estaAbierto: estado.estaAbierto,
    bloqueado: estado.bloqueado,
    canAcceptOrders: estado.canAcceptOrders,
    mensaje: estado.mensaje,
    message: estado.mensaje,
    nextOpeningText: estado.nextOpeningText,
    timezone: estado.timezone,
    validarHorarios: estado.validarHorarios,
    fetchError: Boolean(estado.fetchError),
  };
}
