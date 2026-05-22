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

/**
 * Total del combo: base + mixer + extras (mapa { [id]: { product, cantidad } }).
 */
export function computeComboTotal(base, mixer, extras = {}) {
  let sum = 0;
  if (base) sum += Number(base.precio) || 0;
  if (mixer) sum += Number(mixer.precio) || 0;
  sum += sumExtrasSelectionMap(extras);
  return sum;
}

/**
 * Lista legible de ingredientes para resumen y observaciones del carrito.
 */
export function buildIngredientList(base, mixer, extras = {}) {
  const lines = [];
  if (base) lines.push(`1× ${base.nombre}`);
  if (mixer) lines.push(`1× ${mixer.nombre}`);
  for (const id in extras) {
    const { product, cantidad } = extras[id];
    lines.push(`${cantidad}× ${product.nombre}`);
  }
  return lines;
}

/**
 * Etiqueta del resumen en barra/panel según selección y paso actual.
 */
export function getComboSummaryLabel({ selectedBase, selectedMixer, currentStep }) {
  if (selectedBase && selectedMixer) return "Total";
  if (selectedBase) return "Elegí tu mix";
  if (currentStep === 2 && selectedMixer) return "Elegí tu base";
  return "Armá tu combo";
}

/** Texto del CTA principal del wizard. */
export function getPrimaryActionLabel(currentStep) {
  return currentStep === 3 ? "Crear mi Combo" : "Siguiente";
}

/** Deshabilita avanzar en pasos 1 y 2 sin selección obligatoria. */
export function getNextDisabled(currentStep, selectedBase, selectedMixer) {
  return (
    (currentStep === 1 && !selectedBase) ||
    (currentStep === 2 && !selectedMixer)
  );
}

/**
 * Ítem de carrito para combo personalizado (shape usado por useCartStore y checkout).
 */
export function buildComboCartItem({
  resolvedComboName,
  selectedBase,
  selectedMixer,
  extras = {},
  total,
  ingredientList,
  stamp,
}) {
  const description = ingredientList.join(" + ");
  const articuloId = `combo-personalizado-${stamp}`;

  return {
    lineKind: CUSTOM_COMBO_LINE_KIND,
    comboComponents: {
      displayName: resolvedComboName,
      base: selectedBase,
      mixer: selectedMixer,
      extras: { ...extras },
    },
    articuloId,
    slug: articuloId,
    nombre: resolvedComboName,
    precioBase: total,
    cantidad: 1,
    categoria_nombre: "Combo Personalizado",
    imagen_url: selectedBase.imagen_url ?? selectedMixer.imagen_url ?? null,
    observaciones: `Combo Personalizado · ${description}`,
  };
}
