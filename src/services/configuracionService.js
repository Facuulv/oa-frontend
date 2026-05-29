import apiClient from "./apiClient";
import {
  apiPaths,
  ADMIN_CONFIG_EMAIL_RECUPERACION_PATH,
} from "@/config/apiPaths";

/**
 * @param {unknown} path
 * @param {string} label
 * @returns {string}
 */
function resolveAdminPath(path, label) {
  if (typeof path === "string" && path.startsWith("/")) {
    return path;
  }
  const err = new Error(
    `Ruta de API no configurada (${label}). Revisá apiPaths.admin o reiniciá el servidor de desarrollo.`,
  );
  err.code = "API_PATH_UNDEFINED";
  throw err;
}

const emailRecuperacionPath = () =>
  resolveAdminPath(
    apiPaths.admin?.configuracionEmailRecuperacion ??
      ADMIN_CONFIG_EMAIL_RECUPERACION_PATH,
    "configuracionEmailRecuperacion",
  );

/**
 * @returns {Promise<{ settings: object, horarios: object[], estado: object }>}
 */
export async function getAdminConfiguracion() {
  const { data } = await apiClient.get(apiPaths.admin.configuracion);
  return data?.data ?? data;
}

/**
 * @param {{ cartaOnlineHabilitada?: boolean, validarHorarios?: boolean }} payload
 */
export async function updateConfiguracionCarta(payload) {
  const { data } = await apiClient.put(apiPaths.admin.configuracionCarta, payload);
  return data;
}

/**
 * @param {{ dia_semana: number, franjas: Array<{ hora_apertura: string, hora_cierre: string, activo: boolean }> }} payload
 */
export async function updateConfiguracionHorarioDia(payload) {
  const { data } = await apiClient.put(apiPaths.admin.configuracionHorariosDia, payload);
  return data;
}

/**
 * @param {{ numero: string }} payload
 */
export async function updateConfiguracionWhatsapp(payload) {
  const { data } = await apiClient.put(apiPaths.admin.configuracionWhatsapp, payload);
  return data;
}

export async function getAdminEmailRecuperacion() {
  const path = emailRecuperacionPath();
  const { data } = await apiClient.get(path);
  return data?.data ?? data;
}

/**
 * @param {{ nombre: string, asunto: string, textoIntro?: string }} payload
 */
export async function updateConfiguracionEmailRecuperacion(payload) {
  const path = emailRecuperacionPath();
  const body = {
    nombre: payload?.nombre,
    asunto: payload?.asunto,
    textoIntro: payload?.textoIntro ?? "",
  };
  const { data } = await apiClient.put(path, body);
  return data;
}
