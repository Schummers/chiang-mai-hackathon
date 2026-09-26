import { describe, expect, it } from "vitest";
import type { MyInfo, PhotoCard } from "./engine/types";
import { menuRows, readablePhotoCard } from "./photoCard";

const info = (allergies: MyInfo["allergies"], diet: MyInfo["diet"] = []): MyInfo => ({ allergies, spice: null, diet });
const menu = (items: PhotoCard["items"]): PhotoCard => ({ kind: "menu", title: "Menu", description: "", items });

describe("menuRows", () => {
  it("puts About you conflicts first, as a short allergen pill", () => {
    const { rows } = menuRows(
      menu([
        { name: "Khao Soi", note: "Mild ok" },
        { name: "Som Tam", warning: "Often has peanuts: ask." },
      ]),
      info(["peanuts"]),
    );
    expect(rows).toEqual([
      { name: "Som Tam", nameThai: undefined, pill: { conflict: true, label: "Peanuts" } },
      { name: "Khao Soi", nameThai: undefined, pill: { conflict: false, label: "Mild ok" } },
    ]);
  });

  it("flags a diet warning when About you has a diet", () => {
    const { rows } = menuRows(menu([{ name: "Sai Oua", warning: "Pork sausage: not for your diet." }]), info([], ["no-pork"]));
    expect(rows[0].pill).toEqual({ conflict: true, label: "Diet" });
  });

  it("ignores a warning that matches nothing in About you", () => {
    const { rows } = menuRows(menu([{ name: "Som Tam", warning: "Often has peanuts." }]), info([]));
    expect(rows[0].pill).toBeNull();
  });

  it("shows 5 rows at most and counts the rest", () => {
    const items = Array.from({ length: 8 }, (_, i) => ({ name: `Dish ${i}` }));
    const { rows, more } = menuRows(menu(items), info([]));
    expect(rows).toHaveLength(5);
    expect(more).toBe(3);
  });
});

describe("readablePhotoCard", () => {
  it("keeps a card that says something", () => {
    const card: PhotoCard = { kind: "produce", title: "Longan", description: "Sweet, peel and eat." };
    expect(readablePhotoCard(card)).toBe(card);
  });

  it("turns an empty read into a Sign card saying so", () => {
    for (const card of [
      { kind: "dish", title: "", description: "" },
      { kind: "menu", title: "Menu", description: "", items: [] },
    ] as PhotoCard[]) {
      const out = readablePhotoCard(card);
      expect(out.kind).toBe("sign");
      expect(out.title).toMatch(/couldn't read/i);
      expect(out.description).not.toBe("");
    }
  });
});
