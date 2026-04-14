/**
 * Log de requests salientes (solo desarrollo).
 */
export function logApiRequest(method, url, detail = null) {
  if (process.env.NODE_ENV !== "development") return;
  const extra = detail != null ? ` ${JSON.stringify(detail)}` : "";
  console.info(`[API] ${method} ${url}${extra}`);
}
