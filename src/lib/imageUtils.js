import appConfig from "@/config/app.config";

/**
 * Construye URL completa de imagen.
 * - URL absoluta (http/https) → se devuelve tal cual.
 * - Path local con extensión de imagen → tal cual (public/).
 * - Path relativa del API → se concatena con la base del API.
 * - Vacío → null para usar placeholder.
 */
export function buildImageUrl(path) {
  if (!path || typeof path !== "string") return null;
  const trimmed = path.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/") && /\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/i.test(trimmed)) {
    return trimmed;
  }
  const base = (appConfig.api.baseUrl || "").trim();
  if (!base) return trimmed;
  const baseClean = base.replace(/\/$/, "");
  return trimmed.startsWith("/") ? `${baseClean}${trimmed}` : `${baseClean}/${trimmed}`;
}
