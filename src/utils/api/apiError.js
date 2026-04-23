/**
 * Error HTTP de API con errores por campo (validación del backend).
 */
export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {{ fieldErrors?: Record<string, string>, status?: number, body?: unknown, code?: string }} [meta]
   */
  constructor(message, meta = {}) {
    super(message);
    this.name = "ApiError";
    this.fieldErrors = meta.fieldErrors ?? {};
    this.status = meta.status;
    this.body = meta.body;
    /** Código estable del backend OA! (ej. CATEGORIA_DUPLICADA). */
    this.code = meta.code;
  }
}

function firstStringMessage(value) {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    const s = value.find((x) => typeof x === "string" && x.trim());
    return s ? s.trim() : "";
  }
  return "";
}

/**
 * Normaliza respuestas de validación típicas (Express, Nest, Laravel, etc.)
 * a un mapa campo → primer mensaje.
 * @param {unknown} data
 * @returns {Record<string, string>}
 */
export function flattenValidationErrors(data) {
  const out = {};
  if (!data || typeof data !== "object") return out;

  const merge = (rawKey, val) => {
    if (!rawKey) return;
    const key = String(rawKey).includes(".") ? String(rawKey).split(".").pop() : String(rawKey);
    const msg = firstStringMessage(val);
    if (msg) out[key] = msg;
  };

  /** OA! validación Zod: `errors: [{ path, message }]` (`path` string o segmentos) */
  if (Array.isArray(data.errors) && data.errors.length) {
    const first = data.errors[0];
    if (first && typeof first === "object" && ("path" in first || "message" in first)) {
      for (const item of data.errors) {
        if (item && typeof item === "object") {
          const p = item.path;
          const pathKey = Array.isArray(p)
            ? p.filter((x) => x != null && x !== "").join(".")
            : p;
          merge(pathKey, item.message ?? item.msg);
        }
      }
      if (Object.keys(out).length) return out;
    }
  }

  const nested = data.errors ?? data.error?.errors;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    for (const [k, v] of Object.entries(nested)) merge(k, v);
    if (Object.keys(out).length) return out;
  }

  const msgField = data.message;
  if (msgField && typeof msgField === "object" && !Array.isArray(msgField)) {
    for (const [k, v] of Object.entries(msgField)) merge(k, v);
    if (Object.keys(out).length) return out;
  }

  if (Array.isArray(msgField)) {
    for (const line of msgField) {
      if (typeof line !== "string") continue;
      const trimmed = line.trim();
      const colon = trimmed.match(/^([\w.]+)\s*:\s*(.+)$/);
      if (colon) {
        merge(colon[1], colon[2]);
        continue;
      }
      const pipe = trimmed.match(/^([\w.]+)\s*\|\s*(.+)$/);
      if (pipe) merge(pipe[1], pipe[2]);
    }
    if (Object.keys(out).length) return out;
  }

  if (typeof msgField === "string") {
    for (const part of msgField.split(/[,;\n]/)) {
      const t = part.trim();
      const m = t.match(/^([\w.]+)\s*[:|]\s*(.+)$/);
      if (m) merge(m[1], m[2]);
    }
    if (Object.keys(out).length) return out;
  }

  if (Array.isArray(data.details)) {
    for (const d of data.details) {
      const path = Array.isArray(d?.path) ? d.path.join(".") : d?.path ?? d?.field ?? d?.property;
      const message = d?.message ?? d?.msg;
      merge(path, message);
    }
  }

  return out;
}

/**
 * Mensaje principal del cuerpo de error del backend OA! (`error` o `message`).
 * @param {unknown} data
 * @param {string} fallback
 */
export function oaApiErrorMessage(data, fallback = "Error en la solicitud") {
  if (!data || typeof data !== "object") return fallback;
  const e = data.error;
  if (typeof e === "string" && e.trim()) return e.trim();
  const m = data.message;
  if (typeof m === "string" && m.trim()) return m.trim();
  return fallback;
}

/**
 * Convierte un error de Axios en {@link ApiError} usando el formato OA!.
 * @param {unknown} error
 */
export function apiErrorFromAxios(error) {
  const res = error && typeof error === "object" && "response" in error ? error.response : null;
  if (!res || typeof res !== "object") {
    const msg = error instanceof Error ? error.message : "Error de red";
    return new ApiError(msg, { body: error });
  }
  const status = typeof res.status === "number" ? res.status : undefined;
  const data = res.data;
  const body = data && typeof data === "object" ? data : {};
  const code = typeof body.code === "string" ? body.code : undefined;
  const message = oaApiErrorMessage(body, status ? `Error ${status}` : "Error en la solicitud");
  const fieldErrors = flattenValidationErrors(body);
  return new ApiError(message, { fieldErrors, status, body, code });
}
