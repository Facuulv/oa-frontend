import { CUSTOM_COMBO_LINE_KIND } from "../../constants/cartLineKinds.js";

export const MAX_COMBO_LABELS = 10;
export const COMBO_LABEL_MAX_LENGTH = 80;

/**
 * Etiquetas de combos personalizados para trazabilidad en pedidos.observaciones (backend).
 * @param {Array<{ lineKind?: string, comboComponents?: { displayName?: string }, nombre?: string, name?: string }>} cartItems
 * @returns {string[]}
 */
export function buildComboLabelsFromCart(cartItems) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) return [];

  const seen = new Set();
  const labels = [];

  for (const item of cartItems) {
    if (item?.lineKind !== CUSTOM_COMBO_LINE_KIND) continue;

    const raw =
      item.comboComponents?.displayName?.trim() ||
      item.nombre?.trim() ||
      item.name?.trim() ||
      "";

    const label = raw.slice(0, COMBO_LABEL_MAX_LENGTH);
    if (!label || seen.has(label)) continue;

    seen.add(label);
    labels.push(label);
    if (labels.length >= MAX_COMBO_LABELS) break;
  }

  return labels;
}
