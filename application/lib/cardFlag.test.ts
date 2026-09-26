import { describe, expect, it } from "vitest";
import { cardFlags } from "./cardFlag";
import type { ContextCard, MyInfo } from "./engine/types";

const card = (warning?: string): ContextCard => ({ name: "Nam prik ong", description: "Chili dip", warning });
const info = (allergies: MyInfo["allergies"], diet: MyInfo["diet"] = []): MyInfo => ({ allergies, spice: null, diet });

describe("cardFlags", () => {
  it("flags a known allergen from About you", () => {
    const f = cardFlags(card("Peanuts: may be in this dish. A risk to check."), info(["peanuts"]), []);
    expect(f.flag).toBe("May contain peanuts");
  });

  it("has no flag without a warning", () => {
    expect(cardFlags(card(), info(["peanuts"]), []).flag).toBeNull();
  });

  it("drops the flag and shows the vendor's no when the vendor ruled it out", () => {
    const f = cardFlags(card("The vendor says no peanuts. Double-check."), info(["peanuts"]), ["Chicken khao soi", "No peanuts"]);
    expect(f).toEqual({ flag: null, vendorNo: ["peanuts"] });
  });

  it("says the diet does not fit, without naming an allergen", () => {
    const f = cardFlags(card("May not fit your diet (no-pork). A risk to check."), info([], ["no-pork"]), []);
    expect(f.flag).toBe("May not fit your diet");
  });

  it("falls back to the first sentence of a model warning", () => {
    const f = cardFlags(card("Shrimp paste is common in this curry. A risk to check."), info(["gluten"]), []);
    expect(f.flag).toBe("Shrimp paste is common in this curry.");
  });
});
