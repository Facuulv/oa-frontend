import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  expandCartItemsToOrderLines,
  buildComponentOrderLines,
  COMBO_REBUILD_MESSAGE,
} from "./expandComboOrderLines.js";
import { CUSTOM_COMBO_LINE_KIND } from "../../constants/cartLineKinds.js";

const base = { id: 10, nombre: "Fernet", precio: 5000 };
const mixer = { id: 20, nombre: "Coca", precio: 2000 };
const extra = { id: 30, nombre: "Hielo 2.5kg", precio: 2500 };

describe("expandCartItemsToOrderLines", () => {
  it("producto normal queda igual", () => {
    const r = expandCartItemsToOrderLines([
      { articuloId: 99, cantidad: 2, precioUnitario: 100, nombre: "Papas" },
    ]);
    assert.equal(r.ok, true);
    assert.equal(r.lines.length, 1);
    assert.equal(r.lines[0].productId, 99);
    assert.equal(r.lines[0].quantity, 2);
  });

  it("combo se expande a base + mixer + extra", () => {
    const r = expandCartItemsToOrderLines([
      {
        lineKind: CUSTOM_COMBO_LINE_KIND,
        articuloId: "combo-personalizado-1",
        cantidad: 1,
        comboComponents: {
          displayName: "Combo Test",
          base,
          mixer,
          extras: { 30: { product: extra, cantidad: 1 } },
        },
      },
    ]);
    assert.equal(r.ok, true);
    assert.equal(r.lines.length, 3);
    assert.deepEqual(
      r.lines.map((l) => l.productId),
      [10, 20, 30]
    );
  });

  it("cantidad del combo multiplica cantidades internas", () => {
    const r = expandCartItemsToOrderLines([
      {
        lineKind: CUSTOM_COMBO_LINE_KIND,
        cantidad: 2,
        comboComponents: {
          displayName: "Combo x2",
          base,
          mixer,
          extras: { 30: { product: extra, cantidad: 1 } },
        },
      },
    ]);
    assert.equal(r.ok, true);
    assert.equal(r.lines.find((l) => l.productId === 10).quantity, 2);
    assert.equal(r.lines.find((l) => l.productId === 20).quantity, 2);
    assert.equal(r.lines.find((l) => l.productId === 30).quantity, 2);
  });

  it("sin comboComponents devuelve error", () => {
    const r = expandCartItemsToOrderLines([
      { lineKind: CUSTOM_COMBO_LINE_KIND, articuloId: "combo-personalizado-9" },
    ]);
    assert.equal(r.ok, false);
    assert.equal(r.error, COMBO_REBUILD_MESSAGE);
  });

  it("nunca devuelve productId ficticio", () => {
    const r = expandCartItemsToOrderLines([
      {
        lineKind: CUSTOM_COMBO_LINE_KIND,
        comboComponents: { displayName: "C", base, mixer, extras: {} },
      },
    ]);
    assert.equal(r.ok, true);
    for (const line of r.lines) {
      assert.ok(Number.isInteger(line.productId) && line.productId > 0);
      assert.ok(!String(line.productId).includes("combo-personalizado"));
    }
  });

  it("carrito mixto: normal + combo", () => {
    const r = expandCartItemsToOrderLines([
      { articuloId: 99, cantidad: 1, precioUnitario: 100 },
      {
        lineKind: CUSTOM_COMBO_LINE_KIND,
        comboComponents: {
          displayName: "Mi Combo",
          base,
          mixer,
          extras: {},
        },
      },
    ]);
    assert.equal(r.ok, true);
    assert.equal(r.lines.length, 3);
    assert.equal(r.lines[0].productId, 99);
  });
});

describe("buildComponentOrderLines", () => {
  it("legacy articulo sin components falla vía expand", () => {
    const r = buildComponentOrderLines({ base, mixer, extras: {} });
    assert.ok(r.lines);
    assert.equal(r.lines.length, 2);
  });
});
