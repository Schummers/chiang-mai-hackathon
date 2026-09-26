import { describe, expect, it } from "vitest";
import type { MyInfo } from "@/lib/engine/types";
import { photoSystemPrompt, photoUserPrompt, toPhotoCard } from "./photo";

const info = (allergies: MyInfo["allergies"] = [], diet: MyInfo["diet"] = []): MyInfo => ({ allergies, spice: null, diet });

describe("toPhotoCard", () => {
  it("keeps a valid menu, items capped and cleaned", () => {
    const card = toPhotoCard(
      {
        kind: "menu",
        title: "Noodle stall",
        description: "Northern classics.",
        items: [{ name: "Khao Soi", nameThai: "ข้าวซอย", note: "Mild ok" }, { name: "" }, ...Array.from({ length: 30 }, (_, i) => ({ name: `D${i}` }))],
      },
      info(),
    );
    expect(card.kind).toBe("menu");
    expect(card.items![0]).toEqual({ name: "Khao Soi", nameThai: "ข้าวซอย", note: "Mild ok" });
    expect(card.items!.every((i) => i.name)).toBe(true);
    expect(card.items!.length).toBeLessThanOrEqual(20);
  });

  it("flags a menu item from the pack's allergens, whatever the model said", () => {
    const card = toPhotoCard({ kind: "menu", title: "Menu", description: "", items: [{ name: "Gaeng Hang Lay", dishId: "kaeng-hang-le" }] }, info(["peanuts"]));
    expect(card.items![0].warning).toMatch(/peanut/i);
  });

  it("drops model warnings when About you is empty: nothing to conflict with", () => {
    const card = toPhotoCard({ kind: "menu", title: "Menu", description: "", items: [{ name: "Som Tam", warning: "May contain peanuts." }] }, info());
    expect(card.items![0].warning).toBeUndefined();
  });

  it("anchors a dish in the pack: meat, spice, local detail and flag from the pack", () => {
    const card = toPhotoCard({ kind: "dish", dishId: "kaeng-hang-le", title: "Hang Lay curry", description: "Pork curry.", spice: 3 }, info(["peanuts"]));
    expect(card).toMatchObject({ kind: "dish", title: "Hang Lay curry", description: "Pork curry." });
    expect(card.warning).toMatch(/peanut/i);
    expect(card.localDetail).toBeTruthy();
  });

  it("clamps spice and ignores unknown pack ids", () => {
    const card = toPhotoCard({ kind: "dish", dishId: "nope", title: "Mystery", description: "A dish.", spice: 9 }, info());
    expect(card.spice).toBe(3);
  });

  it("falls back to a plain sign card on anything off", () => {
    for (const raw of [null, "text", { kind: "poster", title: "x", description: "y" }, { kind: "dish" }]) {
      const card = toPhotoCard(raw, info());
      expect(card.kind).toBe("sign");
      expect(card.description).toBeTruthy();
    }
  });
});

describe("photo prompts", () => {
  it("anchors on the pack and asks for the visitor's language", () => {
    expect(photoSystemPrompt(9)).toContain("kaeng-hang-le");
    expect(photoSystemPrompt(9)).toContain("mangosteen");
    const user = photoUserPrompt("fr", info(["peanuts"]));
    expect(user).toContain("French");
    expect(user).toContain("peanuts");
  });
});
