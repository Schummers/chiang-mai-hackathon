import { describe, expect, it } from "vitest";
import { EMPTY_MY_INFO, type MyInfo } from "@/lib/engine/types";
import { cardFor, momentCard, wordCard } from "./cards";
import { systemPrompt } from "./prompt";

const peanuts: MyInfo = { ...EMPTY_MY_INFO, allergies: ["peanuts"] };

describe("cardFor", () => {
  it("fills a dish card from the pack and the overlay, not from the model", () => {
    const card = cardFor({ kind: "dish", id: "kaeng-hang-le", meat: "Chicken", spice: 3 }, EMPTY_MY_INFO);
    expect(card).toMatchObject({ kind: "dish", name: "Kaeng Hang Le", nameThai: "แกงฮังเล", meat: "Pork belly", spice: 1 });
    expect(card?.description).toMatch(/pork/i);
    expect(card?.warning).toBeUndefined();
  });

  it("flags a peanut risk from the overlay when My info has the allergy", () => {
    const card = cardFor({ kind: "dish", id: "kaeng-hang-le" }, peanuts);
    expect(card?.warning).toMatch(/Peanuts: may be in this dish/);
    expect(card?.warning).toMatch(/never a guarantee/);
  });

  it("flags a diet conflict from the ingredients", () => {
    const card = cardFor({ kind: "dish", id: "sai-ua" }, { ...EMPTY_MY_INFO, diet: ["no-pork"] });
    expect(card?.warning).toMatch(/no-pork/);
  });

  it("uses the model's meat and spice when the overlay has none", () => {
    const card = cardFor({ kind: "dish", id: "kai-thot-makhwaen", meat: "Chicken", spice: 5 }, EMPTY_MY_INFO);
    expect(card).toMatchObject({ meat: "Chicken", spice: 3 });
  });

  it("shows an off-guide dish only when it carries a flag", () => {
    const mention = { kind: "offguide" as const, name: "Gaeng som pla", warning: "Shrimp paste is common in this curry." };
    expect(cardFor(mention, EMPTY_MY_INFO)).toBeNull();
    expect(cardFor(mention, { ...EMPTY_MY_INFO, allergies: ["shellfish"] })).toMatchObject({ offGuide: true, name: "Gaeng som pla" });
  });

  it("treats an unknown dish id as off-guide", () => {
    expect(cardFor({ kind: "dish", id: "made-up", name: "Made up" }, EMPTY_MY_INFO)).toBeNull();
  });

  it("returns nothing for kind none", () => {
    expect(cardFor({ kind: "none" }, peanuts)).toBeNull();
  });
});

describe("wordCard", () => {
  it("explains the false friend ยินดี as thank you", () => {
    const card = wordCard("ยินดีเจ้า");
    expect(card?.kind).toBe("word");
    expect(card?.description).toMatch(/thank you/);
  });

  it("explains a glossary word", () => {
    expect(wordCard("เต้าใด")?.description).toMatch(/how much/i);
  });

  it("returns null for a word outside the pack", () => {
    expect(wordCard("xyz")).toBeNull();
  });
});

describe("momentCard", () => {
  it("describes late September as the rainy season with a festival", () => {
    const card = momentCard("2026-09-27");
    expect(card.kind).toBe("moment");
    expect(card.name).toMatch(/Rainy/);
    expect(card.localDetail).toBeTruthy();
  });
});

describe("systemPrompt", () => {
  it("lists the dish ids and only the produce in season", () => {
    const sept = systemPrompt(9);
    expect(sept).toContain("kaeng-hang-le");
    expect(sept).toContain("ยินดี");
    expect(sept.length).toBeLessThan(40_000);
  });
});
