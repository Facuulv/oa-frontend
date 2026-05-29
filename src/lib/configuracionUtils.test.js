import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  isHorarioNocturno,
  validateDiaHorario,
} from "./configuracionUtils.js";

describe("configuracionUtils — horarios", () => {
  test("permite horario nocturno 20:00 → 02:30", () => {
    assert.equal(isHorarioNocturno("20:00", "02:30"), true);
    const r = validateDiaHorario({
      activo: true,
      hora_apertura: "20:00",
      hora_cierre: "02:30",
    });
    assert.equal(r.ok, true);
    assert.equal(r.nocturno, true);
  });

  test("rechaza apertura igual a cierre", () => {
    const r = validateDiaHorario({
      activo: true,
      hora_apertura: "20:00",
      hora_cierre: "20:00",
    });
    assert.equal(r.ok, false);
  });

  test("permite horario diurno normal", () => {
    const r = validateDiaHorario({
      activo: true,
      hora_apertura: "11:00",
      hora_cierre: "23:00",
    });
    assert.equal(r.ok, true);
    assert.equal(r.nocturno, false);
  });
});
