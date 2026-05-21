import { CUSTOM_COMBO_LINE_KIND } from "../../constants/cartLineKinds.js";

export const COMBO_REBUILD_MESSAGE =
  "Volvé a armar tu combo para confirmar el pedido";

function resolveRealProductId(productOrId) {
  if (productOrId == null) return null;
  if (typeof productOrId === "object") {
    const id = productOrId.id ?? productOrId.productId ?? productOrId.articuloId;
    const n = Number(id);
    return Number.isInteger(n) && n > 0 ? n : null;
  }
  const n = Number(productOrId);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function isLegacyComboArticulo(item) {
  const raw = String(item?.articuloId ?? item?.slug ?? item?.id ?? "");
  return raw.startsWith("combo-personalizado");
}

function isCustomComboCartItem(item) {
  if (item?.lineKind === CUSTOM_COMBO_LINE_KIND) return true;
  return isLegacyComboArticulo(item);
}

function pushLine(lines, { productId, quantity, unitPrice, observations = "" }) {
  const qty = Number(quantity);
  if (!qty || qty < 1) return;
  lines.push({
    productId,
    quantity: qty,
    unitPrice: Number(unitPrice) || 0,
    observations,
    selectedExtras: [],
  });
}

function appendSelectionMap(lines, map, qtyMultiplier, comboLabel) {
  for (const key in map) {
    const entry = map[key];
    const product = entry?.product ?? entry;
    const productId = resolveRealProductId(product ?? key);
    const unitQty = Number(entry?.cantidad ?? entry?.quantity ?? 0);
    const quantity = unitQty * qtyMultiplier;
    if (quantity <= 0) continue;
    if (!productId) {
      return { error: COMBO_REBUILD_MESSAGE };
    }
    pushLine(lines, {
      productId,
      quantity,
      unitPrice: Number(product?.precio ?? entry?.precio) || 0,
      observations: comboLabel ? `Parte de ${comboLabel}` : "",
    });
  }
  return null;
}

/**
 * Expande snapshot de combo a líneas de pedido con productId reales.
 * @param {object} comboComponents
 * @param {number} comboQuantity
 * @returns {{ lines: object[] } | { error: string }}
 */
export function buildComponentOrderLines(comboComponents, comboQuantity = 1) {
  if (!comboComponents?.base || !comboComponents?.mixer) {
    return { error: COMBO_REBUILD_MESSAGE };
  }

  const qtyMult = Math.max(1, Math.floor(Number(comboQuantity) || 1));
  const baseId = resolveRealProductId(comboComponents.base);
  const mixerId = resolveRealProductId(comboComponents.mixer);
  if (!baseId || !mixerId) {
    return { error: COMBO_REBUILD_MESSAGE };
  }

  const label = String(comboComponents.displayName ?? "").trim();
  const lines = [];

  pushLine(lines, {
    productId: baseId,
    quantity: qtyMult,
    unitPrice: Number(comboComponents.base.precio) || 0,
    observations: label ? `Parte de ${label}` : "",
  });
  pushLine(lines, {
    productId: mixerId,
    quantity: qtyMult,
    unitPrice: Number(comboComponents.mixer.precio) || 0,
    observations: label ? `Parte de ${label}` : "",
  });

  const extrasErr = appendSelectionMap(
    lines,
    comboComponents.extras ?? {},
    qtyMult,
    label
  );
  if (extrasErr) return extrasErr;

  if (lines.length < 2) {
    return { error: COMBO_REBUILD_MESSAGE };
  }

  return { lines };
}

/** Línea de pedido desde ítem de carrito normal (no combo). */
export function mapNormalCartItemToOrderLine(item) {
  const productId = resolveRealProductId(item.articuloId ?? item.id);
  if (!productId) {
    return { error: "Producto inválido en el carrito. Quitá el ítem y volvé a agregarlo." };
  }
  return {
    line: {
      productId,
      quantity: item.cantidad ?? item.quantity ?? 1,
      unitPrice: item.precioUnitario ?? 0,
      selectedExtras: (item.extrasSeleccionados ?? []).map((e) => ({
        id: e.id,
        nombre: e.nombre,
        precio: e.precioExtra ?? e.precio ?? 0,
      })),
      observations: item.observaciones ?? "",
    },
  };
}

/**
 * Aplana carrito: combos → componentes; productos normales → una línea cada uno.
 * @returns {{ ok: true, lines: object[] } | { ok: false, error: string }}
 */
export function expandCartItemsToOrderLines(cartItems) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return { ok: false, error: "El carrito está vacío" };
  }

  const lines = [];

  for (const item of cartItems) {
    if (!isCustomComboCartItem(item)) {
      const mapped = mapNormalCartItemToOrderLine(item);
      if (mapped.error) return { ok: false, error: mapped.error };
      lines.push(mapped.line);
      continue;
    }

    if (!item.comboComponents) {
      return { ok: false, error: COMBO_REBUILD_MESSAGE };
    }

    const expanded = buildComponentOrderLines(
      item.comboComponents,
      item.cantidad ?? item.quantity ?? 1
    );
    if (expanded.error) {
      return { ok: false, error: expanded.error };
    }
    lines.push(...expanded.lines);
  }

  if (lines.length === 0) {
    return { ok: false, error: "No hay productos válidos para confirmar el pedido" };
  }

  return { ok: true, lines };
}
