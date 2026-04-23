import appConfig from "@/config/app.config";

/** @typedef {'productCard' | 'productDetail' | 'categoryCard' | 'checkoutLine' | 'hero' | 'adminThumb'} CatalogImagePreset */

/**
 * Transformaciones Cloudinary: f_auto, q_auto, dpr_auto (nitidez en retina), tamaño por contexto.
 * c_fill + g_auto en miniaturas / banners para alinear con object-cover en UI.
 * @see https://cloudinary.com/documentation/transformation_reference
 */
const CLOUDINARY_PRESETS = {
  /** Lista / búsqueda: thumb ~80px lógicos; w/h generosos para 2–3x sin peso excesivo */
  productCard: "c_fill,w_360,h_360,g_auto,q_auto,f_auto,dpr_auto",
  /** Detalle full-bleed móvil (~480 CSS px × DPR) */
  productDetail: "c_limit,w_960,q_auto,f_auto,dpr_auto",
  /** Grilla 2 cols (max ~200px/ancho útil × DPR) */
  categoryCard: "c_fill,w_800,h_374,g_auto,q_auto,f_auto,dpr_auto",
  /** Carrito: miniatura compacta */
  checkoutLine: "c_fill,w_224,h_224,g_auto,q_auto,f_auto,dpr_auto",
  /** Hero ancho completo app (~480–640 CSS) */
  hero: "c_fill,w_1280,h_512,g_auto,q_auto,f_auto,dpr_auto",
  /** Tablas admin */
  adminThumb: "c_fill,w_192,h_192,g_auto,q_auto,f_auto,dpr_auto",
};

const UPLOAD_MARKERS = ["/image/upload/", "/video/upload/", "/raw/upload/"];

function isCloudinaryHost(hostname) {
  return hostname === "res.cloudinary.com" || hostname.endsWith(".res.cloudinary.com");
}

/**
 * Inserta o reemplaza el primer bloque de transformación en URLs Cloudinary /upload/.
 * @param {string} absoluteUrl
 * @param {string} transformChain comma-separated Cloudinary transforms
 */
function applyCloudinaryDeliveryTransforms(absoluteUrl, transformChain) {
  try {
    const url = new URL(absoluteUrl);
    if (!isCloudinaryHost(url.hostname)) return absoluteUrl;

    let path = url.pathname;
    let marker = "";
    let idx = -1;
    for (const m of UPLOAD_MARKERS) {
      const i = path.indexOf(m);
      if (i !== -1) {
        marker = m;
        idx = i;
        break;
      }
    }
    if (idx === -1) return absoluteUrl;

    const rest = path.slice(idx + marker.length);
    if (!rest) return absoluteUrl;

    const segments = rest.split("/");
    const first = segments[0] ?? "";

    let newRest;
    if (/^v\d+$/i.test(first)) {
      newRest = `${transformChain}/${rest}`;
    } else if (first.includes(",")) {
      segments[0] = transformChain;
      newRest = segments.join("/");
    } else {
      newRest = `${transformChain}/${rest}`;
    }

    url.pathname = path.slice(0, idx + marker.length) + newRest;
    return url.toString();
  } catch {
    return absoluteUrl;
  }
}

/**
 * Resuelve path del API o URL absoluta (sin transformar).
 */
function resolveImagePath(path) {
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

/**
 * Construye URL de imagen para la UI (API relativa o absoluta).
 * @param {string|null|undefined} path
 * @param {{ preset?: CatalogImagePreset, deliveryChain?: string }} [options] — `preset` o cadena `deliveryChain` (coma-separada) si la URL es Cloudinary.
 */
export function buildImageUrl(path, options = {}) {
  const resolved = resolveImagePath(path);
  if (!resolved) return null;
  const chain = options.deliveryChain || (options.preset && CLOUDINARY_PRESETS[options.preset]);
  if (!chain) return resolved;
  if (!resolved.startsWith("http://") && !resolved.startsWith("https://")) return resolved;
  return applyCloudinaryDeliveryTransforms(resolved, chain);
}

/**
 * URL optimizada para `imagen_url` (p. ej. secure_url de Cloudinary): f_auto, q_auto, dpr_auto y tamaño según contexto.
 * Sin `preset`: en Cloudinary aplica `c_limit` + ancho máximo; otras URLs absolutas se devuelven sin cambiar.
 *
 * @param {string|null|undefined} imagen_url
 * @param {{ preset?: CatalogImagePreset, maxWidth?: number, deliveryChain?: string }} [options]
 * @returns {string|null}
 */
export function getOptimizedImageUrl(imagen_url, options = {}) {
  const { preset, maxWidth = 800, deliveryChain } = options;
  if (preset || deliveryChain) {
    return buildImageUrl(imagen_url, { preset, deliveryChain });
  }
  const resolved = resolveImagePath(imagen_url);
  if (!resolved) return null;
  if (!resolved.startsWith("http://") && !resolved.startsWith("https://")) return resolved;
  try {
    const u = new URL(resolved);
    if (!isCloudinaryHost(u.hostname)) return resolved;
  } catch {
    return resolved;
  }
  const chain = `c_limit,w_${maxWidth},q_auto,f_auto,dpr_auto`;
  return applyCloudinaryDeliveryTransforms(resolved, chain);
}
