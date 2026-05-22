import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isCartBarRoute } from "./cartBarRoutes.js";

describe("isCartBarRoute", () => {
  it("muestra en rutas de exploración", () => {
    assert.equal(isCartBarRoute("/"), true);
    assert.equal(isCartBarRoute("/promociones"), true);
    assert.equal(isCartBarRoute("/catalogo"), true);
    assert.equal(isCartBarRoute("/catalogo?x=1"), false);
    assert.equal(isCartBarRoute("/buscar"), true);
    assert.equal(isCartBarRoute("/categoria/vinos"), true);
  });

  it("oculta en cuenta, checkout, producto y combo", () => {
    assert.equal(isCartBarRoute("/mi-cuenta"), false);
    assert.equal(isCartBarRoute("/mi-cuenta/datos"), false);
    assert.equal(isCartBarRoute("/mis-pedidos"), false);
    assert.equal(isCartBarRoute("/mis-pedidos/1"), false);
    assert.equal(isCartBarRoute("/checkout"), false);
    assert.equal(isCartBarRoute("/checkout/finalizar"), false);
    assert.equal(isCartBarRoute("/producto/fernet"), false);
    assert.equal(isCartBarRoute("/arma-tu-combo"), false);
  });

  it("rechaza pathname vacío", () => {
    assert.equal(isCartBarRoute(null), false);
    assert.equal(isCartBarRoute(undefined), false);
    assert.equal(isCartBarRoute(""), false);
  });
});
