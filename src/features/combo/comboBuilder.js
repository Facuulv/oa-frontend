import { CUSTOM_COMBO_LINE_KIND } from "../../constants/cartLineKinds.js";

/** Misma lógica que sumSelectionMap en combo.constants (sin deps @/ para tests node). */
function sumExtrasSelectionMap(selections = {}) {
  let sum = 0;
  for (const key in selections) {
    const entry = selections[key];
    sum += (Number(entry?.product?.precio) || 0) * (entry?.cantidad ?? 0);
  }
  return sum;
}

/** @param {Record<string, { product?: object, cantidad?: number }>} map */
export function hasSelectionInMap(map = {}) {
  for (const key in map) {
    if ((map[key]?.cantidad ?? 0) > 0) return true;
  }
  return false;
}

/** Primer producto con cantidad > 0 (útil para imagen/nombre legacy). */
export function getFirstProductFromMap(map = {}) {
  for (const key in map) {
    const entry = map[key];
    if ((entry?.cantidad ?? 0) > 0 && entry?.product) return entry.product;
  }
  return null;
}

/** Entries from a selection map for editable summary lists. */
export function getSelectionMapEntries(map = {}) {
  const entries = [];
  for (const id in map) {
    const { product, cantidad } = map[id] ?? {};
    if ((cantidad ?? 0) > 0 && product) {
      entries.push({ id, product, cantidad });
    }
  }
  return entries;
}
/** Resumen legible de un mapa de selección: "2× Fernet, 1× Gin". */
export function formatSelectionMapSummary(map = {}) {
  const parts = [];
  for (const key in map) {
    const { product, cantidad } = map[key] ?? {};
    if ((cantidad ?? 0) > 0 && product?.nombre) {
      parts.push(`${cantidad}× ${product.nombre}`);
    }
  }
  return parts.length > 0 ? parts.join(", ") : null;
}

function appendMapToIngredientLines(lines, map = {}) {
  for (const id in map) {
    const { product, cantidad } = map[id] ?? {};
    if ((cantidad ?? 0) > 0 && product?.nombre) {
      lines.push(`${cantidad}× ${product.nombre}`);
    }
  }
}

/**
 * Total del combo: bases + mixers + extras (mapas { [id]: { product, cantidad } }).
 */
export function computeComboTotal(bases = {}, mixers = {}, extras = {}) {
  return (
    sumExtrasSelectionMap(bases) +
    sumExtrasSelectionMap(mixers) +
    sumExtrasSelectionMap(extras)
  );
}

/**
 * Lista legible de ingredientes para resumen y observaciones del carrito.
 */
export function buildIngredientList(bases = {}, mixers = {}, extras = {}) {
  const lines = [];
  appendMapToIngredientLines(lines, bases);
  appendMapToIngredientLines(lines, mixers);
  appendMapToIngredientLines(lines, extras);
  return lines;
}

/**
 * Etiqueta del resumen en barra/panel según selección y paso actual.
 */
export function getComboSummaryLabel({ bases = {}, mixers = {}, currentStep }) {
  const hasBases = hasSelectionInMap(bases);
  const hasMixers = hasSelectionInMap(mixers);
  if (hasBases && hasMixers) return "Total";
  if (hasBases) return "Elegí tu mix";
  if (currentStep === 2 && hasMixers) return "Elegí tu base";
  return "Armá tu combo";
}

/** Texto del CTA principal del wizard. */
export function getPrimaryActionLabel(currentStep) {
  return currentStep === 3 ? "Agregar al Carrito" : "Siguiente paso";
}

/** Deshabilita avanzar si el paso actual no tiene selección con cantidad > 0. */
export function getNextDisabled(currentStep, bases = {}, mixers = {}, extras = {}) {
  if (currentStep === 1) return !hasSelectionInMap(bases);
  if (currentStep === 2) return !hasSelectionInMap(mixers);
  if (currentStep === 3) {
    return !hasSelectionInMap(bases) || !hasSelectionInMap(mixers);
  }
  return false;
}

/**
 * Ítem de carrito para combo personalizado (shape usado por useCartStore y checkout).
 */
export function buildComboCartItem({
  resolvedComboName,
  bases = {},
  mixers = {},
  extras = {},
  total,
  ingredientList,
  stamp,
}) {
  const description = ingredientList.join(" + ");
  const articuloId = `combo-personalizado-${stamp}`;
  const legacyBase = getFirstProductFromMap(bases);
  const legacyMixer = getFirstProductFromMap(mixers);

  return {
    lineKind: CUSTOM_COMBO_LINE_KIND,
    comboComponents: {
      displayName: resolvedComboName,
      bases: { ...bases },
      mixers: { ...mixers },
      extras: { ...extras },
      base: legacyBase,
      mixer: legacyMixer,
    },
    articuloId,
    slug: articuloId,
    nombre: resolvedComboName,
    precioBase: total,
    cantidad: 1,
    categoria_nombre: "Combo Personalizado",
    imagen_url: legacyBase?.imagen_url ?? legacyMixer?.imagen_url ?? null,
    observaciones: `Combo Personalizado · ${description}`,
  };
}
