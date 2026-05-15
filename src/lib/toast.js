"use client";

import { toast as sonnerToast } from "sonner";

export const DEFAULT_TOAST_DURATION = 2800;
const DEDUPE_WINDOW_MS = 1200;
const recentToasts = new Map();

/** Keys propias o heredadas de Sileo que no deben pasarse a Sonner. */
const SILEO_AND_INTERNAL_KEYS = new Set([
  "dedupeKey",
  "styles",
  "button",
  "autopilot",
  "fill",
  "roundness",
  "type",
]);

function cleanupRecent(now) {
  for (const [key, ts] of recentToasts.entries()) {
    if (now - ts > DEDUPE_WINDOW_MS) recentToasts.delete(key);
  }
}

function normalizeMessage(message, fallback = "Ocurrió un error") {
  const text = typeof message === "string" ? message.trim() : "";
  return text || fallback;
}

function buildOptions(message, options, fallback) {
  const title = normalizeMessage(message, fallback);
  const description = options?.description;
  const duration = options?.duration ?? DEFAULT_TOAST_DURATION;
  const dedupeKey = options?.dedupeKey ?? `${options?.type || "info"}:${title}:${String(description ?? "")}`;
  return { title, description, duration, dedupeKey };
}

function shouldSkipToast(dedupeKey) {
  const now = Date.now();
  cleanupRecent(now);
  const prev = recentToasts.get(dedupeKey);
  if (prev && now - prev < DEDUPE_WINDOW_MS) return true;
  recentToasts.set(dedupeKey, now);
  return false;
}

function sonnerPassthrough(options) {
  if (!options || typeof options !== "object") return {};
  const out = { ...options };
  for (const k of SILEO_AND_INTERNAL_KEYS) delete out[k];
  delete out.description;
  delete out.duration;
  return out;
}

function show(method, message, options = {}, fallback = "Ocurrió un error") {
  const { title, description, duration, dedupeKey } = buildOptions(message, { ...options, type: method }, fallback);
  if (shouldSkipToast(dedupeKey)) return null;

  const data = {
    ...sonnerPassthrough(options),
    ...(description !== undefined && description !== null ? { description } : {}),
    duration,
  };

  switch (method) {
    case "success":
      return sonnerToast.success(title, data);
    case "error":
      return sonnerToast.error(title, data);
    case "warning":
      return sonnerToast.warning(title, data);
    case "info":
      return sonnerToast.info(title, data);
    default:
      return sonnerToast.info(title, data);
  }
}

export function getApiErrorMessage(error, fallback = "Ocurrió un error") {
  if (error && typeof error === "object" && typeof error.message === "string" && error.message.trim()) {
    return error.message.trim();
  }
  return fallback;
}

export const toast = {
  success(message, options) {
    return show("success", message, options, "Operación completada");
  },
  error(message, options) {
    return show("error", message, options, "Ocurrió un error");
  },
  info(message, options) {
    return show("info", message, options, "Información");
  },
  warning(message, options) {
    return show("warning", message, options, "Atención");
  },
  message(message, options) {
    return show("info", message, options, "Información");
  },
  dismiss(id) {
    if (id !== undefined && id !== null && id !== "") sonnerToast.dismiss(id);
  },
  clear() {
    sonnerToast.dismiss();
  },
};

export default toast;
