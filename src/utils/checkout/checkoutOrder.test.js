import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildCheckoutPayloadCore as buildCheckoutPayload } from "./buildCheckoutPayloadCore.js";
import { toBackendOrderBody } from "./toBackendOrderBody.js";
import { buildComboLabelsFromCart } from "./buildComboLabelsFromCart.js";
import { CUSTOM_COMBO_LINE_KIND } from "../../constants/cartLineKinds.js";

const normalized = {
  nombre: "Test",
  telefono: "2991234567",
  email: "t@test.com",
  direccion: "",
  deliveryType: "RETIRO",
  paymentMethod: "efectivo",
  when: "CUANTO_ANTES",
};

const base = { id: 10, nombre: "Fernet", precio: 5000 };
const mixer = { id: 20, nombre: "Coca", precio: 2000 };

function assertNoForbiddenApiFields(body) {
  assert.equal(body.lineKind, undefined);
  assert.equal(body.comboComponents, undefined);
  assert.equal(body.articuloId, undefined);
  for (const item of body.items) {
    assert.ok(Number.isInteger(item.productId) && item.productId > 0);
    assert.ok(!String(item.productId).startsWith("combo-personalizado"));
    assert.equal(item.lineKind, undefined);
    assert.equal(item.comboComponents, undefined);
  }
}

describe("buildComboLabelsFromCart", () => {
  it("sin combos devuelve array vacío", () => {
    assert.deepEqual(buildComboLabelsFromCart([{ articuloId: 1, nombre: "Papas" }]), []);
  });

  it("un combo usa displayName", () => {
    const labels = buildComboLabelsFromCart([
      {
        lineKind: CUSTOM_COMBO_LINE_KIND,
        comboComponents: { displayName: "Combo Fernet + Coca" },
        nombre: "Otro",
      },
    ]);
    assert.deepEqual(labels, ["Combo Fernet + Coca"]);
  });

  it("fallback a nombre si no hay displayName", () => {
    const labels = buildComboLabelsFromCart([
      { lineKind: CUSTOM_COMBO_LINE_KIND, nombre: "  Mi Combo  " },
    ]);
    assert.deepEqual(labels, ["Mi Combo"]);
  });

  it("varios combos en orden", () => {
    const labels = buildComboLabelsFromCart([
      { lineKind: CUSTOM_COMBO_LINE_KIND, nombre: "A" },
      { lineKind: CUSTOM_COMBO_LINE_KIND, nombre: "B" },
    ]);
    assert.deepEqual(labels, ["A", "B"]);
  });
});

describe("buildCheckoutPayload + toBackendOrderBody", () => {
  it("pedido normal sin comboLabels", () => {
    const { payload, error } = buildCheckoutPayload({
      normalized,
      items: [{ articuloId: 99, cantidad: 1, precioUnitario: 100 }],
    });
    assert.equal(error, null);
    assert.equal(payload.comboLabels, undefined);

    const body = toBackendOrderBody(payload);
    assert.equal(body.comboLabels, undefined);
    assertNoForbiddenApiFields(body);
  });

  it("pedido con combo: items expandidos y comboLabels", () => {
    const cart = [
      {
        lineKind: CUSTOM_COMBO_LINE_KIND,
        articuloId: "combo-personalizado-123",
        nombre: "Fallback nombre",
        comboComponents: {
          displayName: "Combo X",
          base,
          mixer,
          extras: {},
        },
      },
    ];
    const { payload, error } = buildCheckoutPayload({ normalized, items: cart });
    assert.equal(error, null);
    assert.deepEqual(payload.comboLabels, ["Combo X"]);
    assert.equal(payload.items.length, 2);
    assert.ok(payload.items.every((i) => Number.isInteger(i.productId)));

    const body = toBackendOrderBody(payload);
    assert.deepEqual(body.comboLabels, ["Combo X"]);
    assert.equal(body.items.length, 2);
    assertNoForbiddenApiFields(body);
    assert.ok(!JSON.stringify(body).includes("combo-personalizado"));
    assert.ok(!JSON.stringify(body).includes("comboComponents"));
  });

  it("carrito mixto: items normal + combo, comboLabels solo combo", () => {
    const cart = [
      { articuloId: 99, cantidad: 1, precioUnitario: 100 },
      {
        lineKind: CUSTOM_COMBO_LINE_KIND,
        comboComponents: { displayName: "Combo Mix", base, mixer, extras: {} },
      },
    ];
    const { payload } = buildCheckoutPayload({ normalized, items: cart });
    assert.deepEqual(payload.comboLabels, ["Combo Mix"]);
    assert.equal(payload.items.length, 3);

    const body = toBackendOrderBody(payload);
    assert.deepEqual(body.comboLabels, ["Combo Mix"]);
    assert.equal(body.items.length, 3);
    assert.equal(body.items[0].productId, 99);
    assertNoForbiddenApiFields(body);
  });
});
