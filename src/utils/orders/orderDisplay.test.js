import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatOrderNotesForDisplay } from "./orderDisplay.js";

describe("formatOrderNotesForDisplay", () => {
  it("returns empty for blank notes", () => {
    const result = formatOrderNotesForDisplay("");
    assert.equal(result.hasContent, false);
    assert.equal(result.userText, null);
    assert.equal(result.metaLines.length, 0);
  });

  it("keeps free-form user text", () => {
    const result = formatOrderNotesForDisplay("Tocar timbre 2");
    assert.equal(result.userText, "Tocar timbre 2");
    assert.equal(result.metaLines.length, 0);
    assert.equal(result.hasContent, true);
  });

  it("humanizes technical meta and omits delivery type by default", () => {
    const result = formatOrderNotesForDisplay("deliveryType:DELIVERY | when:CUANTO_ANTES");
    assert.equal(result.userText, null);
    assert.deepEqual(result.metaLines, ["Lo antes posible"]);
  });

  it("splits user text from meta block", () => {
    const result = formatOrderNotesForDisplay(
      "Sin hielo — deliveryType:DELIVERY | when:CUANTO_ANTES",
    );
    assert.equal(result.userText, "Sin hielo");
    assert.deepEqual(result.metaLines, ["Lo antes posible"]);
  });

  it("includes scheduled time", () => {
    const result = formatOrderNotesForDisplay("scheduledTime:20:30");
    assert.deepEqual(result.metaLines, ["Horario: 20:30"]);
  });

  it("falls back to raw when meta parses to nothing", () => {
    const result = formatOrderNotesForDisplay("deliveryType:DELIVERY", {
      omitDeliveryType: true,
    });
    assert.equal(result.fallback, "deliveryType:DELIVERY");
    assert.equal(result.hasContent, true);
  });
});
