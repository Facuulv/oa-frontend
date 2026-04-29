/**
 * Métricas de promociones (combo): tolera distintas claves del backend OA!.
 * Si no hay valor explícito, el caller puede calcular con componentes en UI.
 */

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** @param {Record<string, unknown>} row */
export function pickPrecioSeparadoBackend(row) {
  return num(
    row.precio_componentes_total ??
      row.total_componentes ??
      row.total_separado ??
      row.precio_separado ??
      row.subtotal_componentes,
  );
}

/** @param {Record<string, unknown>} row */
export function pickAhorroBackend(row) {
  return num(row.ahorro ?? row.descuento_monto ?? row.monto_ahorro);
}

/** @param {Record<string, unknown>} row */
export function pickCombosDisponiblesBackend(row) {
  const disp = row.disponibilidad;
  if (disp && typeof disp === "object") {
    const mv = disp.max_vendible ?? disp.maxVendible;
    if (mv != null) {
      const n = Number(mv);
      if (Number.isFinite(n)) return Math.max(0, Math.floor(n));
    }
  }
  const v =
    row.combos_disponibles ??
    row.disponibilidad_combos ??
    row.stock_combo_estimado ??
    row.combos_posibles;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.floor(n));
}

/**
 * @param {{ precio?: unknown, cantidad?: unknown }[]} componentes filas con precio unitario (opcional)
 * @returns {number|null}
 */
export function computePrecioSeparadoFromComponentes(componentes) {
  if (!Array.isArray(componentes) || componentes.length === 0) return null;
  let sum = 0;
  let any = false;
  for (const c of componentes) {
    const p = Number(c.precio ?? c.precio_unitario);
    const q = Number(c.cantidad);
    if (!Number.isFinite(p) || !Number.isFinite(q) || q <= 0) continue;
    any = true;
    sum += p * q;
  }
  return any ? sum : null;
}

/**
 * @param {{ stock?: unknown, cantidad?: unknown }[]} componentes
 * @returns {number|null} unidades de combo vendibles, o null si falta stock en alguno
 */
export function computeCombosDisponiblesFromComponentes(componentes) {
  if (!Array.isArray(componentes) || componentes.length === 0) return null;
  let min = Infinity;
  for (const c of componentes) {
    const stock = Number(c.stock);
    const qty = Number(c.cantidad);
    if (!Number.isFinite(qty) || qty <= 0) return null;
    if (!Number.isFinite(stock) || stock < 0) return null;
    min = Math.min(min, Math.floor(stock / qty));
  }
  if (!Number.isFinite(min) || min === Infinity) return null;
  return Math.max(0, min);
}

/**
 * @param {Record<string, unknown>} row
 * @param {{ precio?: unknown, cantidad?: unknown }[]|null} [componentesNormalizados]
 */
export function resolvePrecioSeparado(row, componentesNormalizados = null) {
  const fromApi = pickPrecioSeparadoBackend(row);
  if (fromApi != null) return fromApi;
  if (componentesNormalizados?.length) {
    return computePrecioSeparadoFromComponentes(componentesNormalizados);
  }
  return null;
}

/**
 * @param {Record<string, unknown>} row
 * @param {number|null} precioPromo
 * @param {number|null} precioSeparado
 */
export function resolveAhorro(row, precioPromo, precioSeparado) {
  const fromApi = pickAhorroBackend(row);
  if (fromApi != null) return fromApi;
  if (
    precioPromo != null &&
    precioSeparado != null &&
    Number.isFinite(precioPromo) &&
    Number.isFinite(precioSeparado)
  ) {
    const d = precioSeparado - precioPromo;
    return d > 0 ? d : 0;
  }
  return null;
}

/**
 * @param {Record<string, unknown>} row
 * @param {{ stock?: unknown, cantidad?: unknown }[]|null} [componentesNormalizados]
 */
export function resolveCombosDisponibles(row, componentesNormalizados = null) {
  const fromApi = pickCombosDisponiblesBackend(row);
  if (fromApi != null) return fromApi;
  if (componentesNormalizados?.length) {
    return computeCombosDisponiblesFromComponentes(componentesNormalizados);
  }
  return null;
}
