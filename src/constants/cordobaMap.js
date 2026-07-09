/** Centro aproximado de Córdoba capital. */
export const CORDOBA_CAPITAL_CENTER = [-31.4201, -64.1888];

/**
 * Rondeau 401 (Nueva Córdoba) — local Oa!
 * Coordenadas verificadas contra OSM / Nominatim en la esquina de Rondeau 401.
 */
export const LOCAL_OA_POSITION = [-31.423586, -64.1811728];

/** Viewbox Nominatim: min_lon, max_lat, max_lon, min_lat */
export const CORDOBA_CAPITAL_VIEWBOX = "-64.28,-31.35,-64.10,-31.52";

/** Límites Leaflet [[sur, oeste], [norte, este]] */
export const CORDOBA_CAPITAL_BOUNDS = [
  [-31.52, -64.28],
  [-31.35, -64.1],
];

export function isInsideCordobaCapitalBounds(lat, lon) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return false;
  return lat >= -31.52 && lat <= -31.35 && lon >= -64.28 && lon <= -64.1;
}

/** Filtra resultados de Nominatim para quedarnos solo con Córdoba capital. */
export function isCordobaCapitalResult(item) {
  const lat = parseFloat(item?.lat);
  const lon = parseFloat(item?.lon);
  if (!isInsideCordobaCapitalBounds(lat, lon)) return false;

  const addr = item?.address;
  if (!addr) {
    const name = (item.display_name || "").toLowerCase();
    if (name.includes("toledo") || name.includes("sacanta") || name.includes("oncativo")) {
      return false;
    }
    return name.includes("departamento capital");
  }

  if (addr.village) return false;
  if (addr.town && addr.town !== "Córdoba") return false;

  const dept = (addr.state_district || "").toLowerCase();
  if (dept === "departamento capital") return true;

  const city = (addr.city || "").toLowerCase();
  return city === "córdoba" || city === "cordoba";
}
