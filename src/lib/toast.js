"use client";

import { sileo } from "sileo";

const DEFAULT_DURATION_MS = 2800;
const DEDUPE_WINDOW_MS = 1200;
const recentToasts = new Map();

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
  const duration = options?.duration ?? DEFAULT_DURATION_MS;
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

function show(method, message, options = {}, fallback = "Ocurrió un error") {
  const { title, description, duration, dedupeKey } = buildOptions(message, { ...options, type: method }, fallback);
  if (shouldSkipToast(dedupeKey)) return null;

  let id = "";
  id = sileo[method]({
    title,
    description,
    duration,
    button: {
      title: "x",
      onClick: () => sileo.dismiss(id),
    },
    styles: {
      button:
        "h-7 min-w-7 rounded-full text-xs font-bold leading-none bg-black/5 hover:bg-black/10 active:scale-95",
      ...(options.styles || {}),
    },
    ...options,
  });
  return id;
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
    if (id) sileo.dismiss(id);
  },
  clear() {
    sileo.clear();
  },
};

export default toast;
