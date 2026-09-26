import { describe, expect, it } from "vitest";
import { TURN_SCHEMA } from "./prompt";
import { romanisedItems } from "./romanised";

describe("romanised phonetics (Say it yourself)", () => {
  it("asks the model for romanised items in the same call", () => {
    expect(TURN_SCHEMA.properties.romanised).toEqual({ type: "ARRAY", items: { type: "STRING" } });
  });

  it("keeps the Visitor's romanised items, trimmed, without empty ones", () => {
    expect(romanisedItems(["  a-ròi mâak kráp ", "", "  "], "you")).toEqual(["a-ròi mâak kráp"]);
  });

  it("returns nothing for the Vendor, or when the model gave none", () => {
    expect(romanisedItems(["sa-wàt-dee"], "vendor")).toBeUndefined();
    expect(romanisedItems(undefined, "you")).toBeUndefined();
    expect(romanisedItems([], "you")).toBeUndefined();
    expect(romanisedItems("not an array", "you")).toBeUndefined();
  });
});
