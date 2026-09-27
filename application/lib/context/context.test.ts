import { describe, expect, it } from "vitest";
import { distanceM, looksLikeMarket, rankPlaces } from "@/lib/server/places";
import { infoCards } from "./infoCards";
import { contextBlocks, localTime, systemPrompt, turnPrompt, turnTool } from "./prompt";
import { EMPTY_MY_INFO, type NearbyPlaces } from "@/lib/engine/types";

const here = { lat: 18.7903, lng: 98.9995 };
const at = (lat: number, lng: number) => ({ latitude: lat, longitude: lng });

describe("nearby places", () => {
  it("measures metres between two points", () => {
    expect(Math.round(distanceM(here, { lat: 18.7912, lng: 98.9995 }))).toBe(100);
  });

  it("keeps open, named places, nearest first", () => {
    const ranked = rankPlaces(
      [
        { displayName: { text: "Far" }, location: at(18.7912, 98.9995), priceLevel: "PRICE_LEVEL_INEXPENSIVE" },
        { displayName: { text: "Closed" }, location: at(18.7903, 98.9995), businessStatus: "CLOSED_PERMANENTLY" },
        { displayName: { text: "Near" }, location: at(18.7904, 98.9995), primaryTypeDisplayName: { text: "Noodle shop" } },
        { location: at(18.7903, 98.9995) },
      ],
      here,
      5,
    );
    expect(ranked.map((p) => p.name)).toEqual(["Near", "Far"]);
    expect(ranked[0]).toMatchObject({ type: "Noodle shop", distanceM: 11 });
    expect(ranked[1].price).toBe("inexpensive");
  });

  it("tells a market from a stall Google also types as market", () => {
    expect(looksLikeMarket("Kad Luang (Luang Market)")).toBe(true);
    expect(looksLikeMarket("ตลาดวโรรส-กลางคืน (กาดหลวง)")).toBe(true);
    expect(looksLikeMarket("Tissu")).toBe(false);
    expect(looksLikeMarket("คอนหวัน อาหารทะเล")).toBe(false);
  });
});

describe("context blocks", () => {
  const places: NearbyPlaces = {
    accuracyM: 20,
    food: [{ name: "Big Brother Song noodle shop", type: "Chinese noodle restaurant", distanceM: 21, rating: 4.5, ratingCount: 496 }],
    markets: [{ name: "Kad Luang (Luang Market)", type: "Market", distanceM: 127 }],
  };

  it("frames each block with what it is, places ranked as given", () => {
    const text = contextBlocks({ notes: "Allergic to cashews", places, device: { now: "2026-09-27T03:15:00.000Z", timeZone: "Asia/Bangkok" } });
    expect(text).toContain("<visitor_notes>");
    expect(text).toContain("optional extra context");
    expect(text).toContain("Allergic to cashews");
    expect(text).toContain("possibly happening at one of these places");
    expect(text).toContain("1. Big Brother Song noodle shop: Chinese noodle restaurant, 21 m away, 4.5★ (496)");
    expect(text).toContain("1. Kad Luang (Luang Market): Market, 127 m away");
    expect(text).toContain("Sunday 27 September 2026, 10:15 (Asia/Bangkok), morning");
  });

  it("is empty when the phone sent nothing", () => {
    expect(contextBlocks(undefined)).toBe("");
    expect(contextBlocks({ notes: "  ", places: { accuracyM: 10, food: [], markets: [] } })).toBe("");
  });

  it("goes before the transcript, and past cards go into the history", () => {
    const history = [{ id: "a", speaker: "vendor" as const, translation: ["Khao soi"], original: ["ข้าวซอย"], card: null, cards: [{ heading: "Khao Soi", body: "Curry noodles." }] }];
    const prompt = turnPrompt("เผ็ดไหม", "you", "en", EMPTY_MY_INFO, history, { notes: "No coriander" });
    expect(prompt.indexOf("No coriander")).toBeLessThan(prompt.indexOf("Raw transcript"));
    expect(prompt).toContain("[context card shown to the Visitor: Khao Soi: Curry noodles.]");
  });

  it("reads the month in the phone's time zone", () => {
    expect(localTime("2026-09-30T20:00:00.000Z", "Asia/Bangkok")?.month).toBe(10);
    expect(localTime("not a date", "Asia/Bangkok")).toBeNull();
  });
});

describe("prompt switches", () => {
  it("drops the guide and the card rules when switched off", () => {
    const off = systemPrompt(9, { pack: false, cards: false });
    expect(off).not.toContain("kaeng-hang-le");
    expect(off).not.toContain('"suggestion"');
    expect(systemPrompt(9)).toContain('"suggestion"');
  });

  it("removes cards from the tool schema when off", () => {
    expect(turnTool(true).input_schema.properties).toHaveProperty("cards");
    expect(turnTool(false).input_schema.properties).not.toHaveProperty("cards");
    expect(turnTool(false).input_schema.required).not.toContain("cards");
  });
});

describe("infoCards", () => {
  it("keeps at most 2 cards with a heading and a body", () => {
    const cards = infoCards([
      { heading: " Khao Soi ", body: "Curry noodles.", suggestion: "More?" },
      { heading: "", body: "no heading" },
      { heading: "Sai Ua", body: "Sausage.", headingThai: "ไส้อั่ว" },
      { heading: "Third", body: "dropped" },
      null,
    ]);
    expect(cards).toEqual([
      { heading: "Khao Soi", body: "Curry noodles.", suggestion: "More?" },
      { heading: "Sai Ua", body: "Sausage.", headingThai: "ไส้อั่ว" },
    ]);
    expect(infoCards("nope")).toEqual([]);
  });
});
