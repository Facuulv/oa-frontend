/**
 * Error HTTP de API con errores por campo (validación del backend).
 */
export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {{ fieldErrors?: Record<string, string>, status?: number, body?: unknown }} [meta]
   */
  constructor(message, meta = {}) {
    super(message);
    this.name = "ApiError";
    this.fieldErrors = meta.fieldErrors ?? {};
    this.status = meta.status;
    this.body = meta.body;
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
