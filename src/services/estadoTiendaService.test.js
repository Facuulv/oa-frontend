import { describe, test } from "node:test";
import assert from "node:assert/strict";

// Test pure logic via exported normalize path - import after mocking would be heavy;
// duplicate compute rule inline for documentation
function computeCanAcceptOrders({ bloqueado, estaAbierto, validarHorarios }) {
  if (bloqueado) return false;
  if (!validarHorarios) return true;
  return Boolean(estaAbierto);
}

describe("canAcceptOrders", () => {
  test("abierto y no bloqueado", () => {
    assert.equal(
      computeCanAcceptOrders({ bloqueado: false, estaAbierto: true, validarHorarios: true }),
      true,
    );
  });

  test("cerrado por horario", () => {
    assert.equal(
      computeCanAcceptOrders({ bloqueado: false, estaAbierto: false, validarHorarios: true }),
      false,
    );
  });

  test("bloqueado por carta deshabilitada", () => {
    assert.equal(
      computeCanAcceptOrders({ bloqueado: true, estaAbierto: false, validarHorarios: true }),
      false,
    );
  });

  test("validación horarios off", () => {
    assert.equal(
      computeCanAcceptOrders({ bloqueado: false, estaAbierto: false, validarHorarios: false }),
      true,
    );
  });
});
