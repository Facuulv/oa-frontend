import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CUSTOM_COMBO_LINE_KIND } from "../../constants/cartLineKinds.js";
import {
  computeComboTotal,
  buildIngredientList,
  getComboSummaryLabel,
  getPrimaryActionLabel,
  getNextDisabled,
  buildComboCartItem,
  hasSelectionInMap,
} from "./comboBuilder.js";

const base = { id: 10, nombre: "Fernet", precio: 5000, imagen_url: "/fernet.jpg" };
const mixer = { id: 20, nombre: "Coca", precio: 2000, imagen_url: null };
const extraProduct = { id: 30, nombre: "Hielo 2.5kg", precio: 2500 };

const bases = { 10: { product: base, cantidad: 1 } };
const mixers = { 20: { product: mixer, cantidad: 1 } };
const multiBases = {
  10: { product: base, cantidad: 2 },
  11: { product: { id: 11, nombre: "Gin", precio: 4500 }, cantidad: 1 },
};

describe("hasSelectionInMap", () => {
  it("true cuando hay cantidad > 0", () => {
    assert.equal(hasSelectionInMap(bases), true);
    assert.equal(hasSelectionInMap({}), false);
  });
});

describe("computeComboTotal", () => {
  it("total con base + mixer sin extras", () => {
    assert.equal(computeComboTotal(bases, mixers, {}), 7000);
  });

  it("total con base + mixer + extras", () => {
    const extras = { 30: { product: extraProduct, cantidad: 1 } };
    assert.equal(computeComboTotal(bases, mixers, extras), 9500);
  });

  it("múltiples bases y cantidades", () => {
    assert.equal(computeComboTotal(multiBases, mixers, {}), 16500);
  });

  it("extras con cantidad mayor a 1", () => {
    const extras = { 30: { product: extraProduct, cantidad: 3 } };
    assert.equal(computeComboTotal(bases, mixers, extras), 14500);
  });

  it("sin base ni mixer solo suma extras", () => {
    const extras = { 30: { product: extraProduct, cantidad: 2 } };
    assert.equal(computeComboTotal({}, {}, extras), 5000);
  });
});

describe("buildIngredientList", () => {
  it("formato correcto con base, mixer y extras", () => {
    const extras = {
      30: { product: extraProduct, cantidad: 1 },
      31: { product: { id: 31, nombre: "Papas", precio: 1000 }, cantidad: 2 },
    };
    const list = buildIngredientList(bases, mixers, extras);
    assert.deepEqual(list, [
      "1× Fernet",
      "1× Coca",
      "1× Hielo 2.5kg",
      "2× Papas",
    ]);
  });

  it("solo base cuando no hay mixer", () => {
    assert.deepEqual(buildIngredientList(bases, {}, {}), ["1× Fernet"]);
  });
});

describe("getComboSummaryLabel", () => {
  it("Total cuando hay base y mixer", () => {
    assert.equal(
      getComboSummaryLabel({ bases, mixers, currentStep: 3 }),
      "Total"
    );
  });

  it("Elegí tu mix con solo base", () => {
    assert.equal(
      getComboSummaryLabel({ bases, mixers: {}, currentStep: 1 }),
      "Elegí tu mix"
    );
  });

  it("Elegí tu base en paso 2 con mixer sin base", () => {
    assert.equal(
      getComboSummaryLabel({ bases: {}, mixers, currentStep: 2 }),
      "Elegí tu base"
    );
  });

  it("Armá tu combo por defecto", () => {
    assert.equal(
      getComboSummaryLabel({ bases: {}, mixers: {}, currentStep: 1 }),
      "Armá tu combo"
    );
  });
});

describe("getPrimaryActionLabel", () => {
  it("Siguiente paso en pasos 1 y 2", () => {
    assert.equal(getPrimaryActionLabel(1), "Siguiente paso");
    assert.equal(getPrimaryActionLabel(2), "Siguiente paso");
  });

  it("Agregar al Carrito en paso 3", () => {
    assert.equal(getPrimaryActionLabel(3), "Agregar al Carrito");
  });
});

describe("getNextDisabled", () => {
  it("paso 1 deshabilitado sin base", () => {
    assert.equal(getNextDisabled(1, {}, {}), true);
    assert.equal(getNextDisabled(1, bases, {}), false);
  });

  it("paso 2 deshabilitado sin mixer", () => {
    assert.equal(getNextDisabled(2, bases, {}), true);
    assert.equal(getNextDisabled(2, bases, mixers), false);
  });

  it("paso 3 deshabilitado sin base o mixer", () => {
    assert.equal(getNextDisabled(3, {}, {}), true);
    assert.equal(getNextDisabled(3, bases, {}), true);
    assert.equal(getNextDisabled(3, {}, mixers), true);
    assert.equal(getNextDisabled(3, bases, mixers), false);
  });
});

describe("buildComboCartItem", () => {
  const ingredientList = ["1× Fernet", "1× Coca", "1× Hielo 2.5kg"];
  const extras = { 30: { product: extraProduct, cantidad: 1 } };
  const stamp = 1700000000000;

  it("mantiene shape crítico para carrito y checkout", () => {
    const item = buildComboCartItem({
      resolvedComboName: "Combo Fernet + Coca",
      bases,
      mixers,
      extras,
      total: 9500,
      ingredientList,
      stamp,
    });

    assert.equal(item.lineKind, CUSTOM_COMBO_LINE_KIND);
    assert.equal(item.comboComponents.displayName, "Combo Fernet + Coca");
    assert.deepEqual(item.comboComponents.bases, bases);
    assert.deepEqual(item.comboComponents.mixers, mixers);
    assert.equal(item.comboComponents.base, base);
    assert.equal(item.comboComponents.mixer, mixer);
    assert.deepEqual(item.comboComponents.extras, extras);
    assert.notEqual(item.comboComponents.extras, extras);

    assert.equal(item.articuloId, "combo-personalizado-1700000000000");
    assert.equal(item.slug, "combo-personalizado-1700000000000");
    assert.match(String(item.articuloId), /^combo-personalizado-/);

    assert.equal(item.nombre, "Combo Fernet + Coca");
    assert.equal(item.precioBase, 9500);
    assert.equal(item.cantidad, 1);
    assert.equal(item.categoria_nombre, "Combo Personalizado");
    assert.equal(item.imagen_url, "/fernet.jpg");
    assert.equal(
      item.observaciones,
      "Combo Personalizado · 1× Fernet + 1× Coca + 1× Hielo 2.5kg"
    );
  });

  it("imagen_url cae al mixer si base no tiene imagen", () => {
    const baseSinImg = { ...base, imagen_url: null };
    const mixerConImg = { ...mixer, imagen_url: "/coca.jpg" };
    const item = buildComboCartItem({
      resolvedComboName: "Combo Test",
      bases: { 10: { product: baseSinImg, cantidad: 1 } },
      mixers: { 20: { product: mixerConImg, cantidad: 1 } },
      extras: {},
      total: 7000,
      ingredientList: ["1× Fernet", "1× Coca"],
      stamp: 1,
    });
    assert.equal(item.imagen_url, "/coca.jpg");
  });
});
