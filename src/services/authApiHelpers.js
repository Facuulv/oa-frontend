/** Mensaje legible desde cuerpo JSON de error de la API (auth y afines). */
export function apiErrorMessage(data, fallback) {
  if (!data || typeof data !== "object") return fallback;
  const m = data.message;
  if (typeof m === "string" && m.trim()) return m.trim();
  if (Array.isArray(m) && m.length) {
    const parts = m.filter((x) => typeof x === "string").map((x) => x.trim());
    if (parts.length) return parts.join("; ");
  }
  if (typeof data.error === "string" && data.error.trim()) return data.error.trim();
  return fallback;
}
