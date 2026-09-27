import { describe, expect, it } from "vitest";
import { completedString, localTime, systemPrompt, turnPrompt, turnTool, type TurnPromptInput } from "./prompt";

const base: TurnPromptInput = {
  side: "them",
  heard: "เอาผักหวานบ่",
  languages: { me: "en", them: "th" },
  history: [],
  context: {},
  options: { cards: true, pack: true },
  particle: "m",
};

describe("systemPrompt", () => {
  it("is the same for every Turn with the same options, so it caches", () => {
    expect(systemPrompt({ cards: true, pack: true })).toBe(systemPrompt({ cards: true, pack: true }));
  });

  it("drops the card rules and the guide when switched off", () => {
    const full = systemPrompt({ cards: true, pack: true });
    const bare = systemPrompt({ cards: false, pack: false });
    expect(full).toContain("# 3. Context cards");
    expect(full).toContain("# Northern Thai guide");
    expect(bare).not.toContain("# 3. Context cards");
    expect(bare).not.toContain("# Northern Thai guide");
  });
});

describe("turnPrompt", () => {
  it("only includes the blocks it was given", () => {
    const p = turnPrompt(base);
    expect(p).not.toContain("<owner_notes>");
    expect(p).not.toContain("<nearby_places>");
    expect(p).toContain("(this is the first Turn)");
    expect(p).toContain('"""เอาผักหวานบ่"""');
  });

  it("frames each context block with what it is", () => {
    const p = turnPrompt({
      ...base,
      context: {
        profile: { allergies: ["peanuts"], spice: null, diet: [] },
        notes: "Allergic to cashews",
        places: {
          accuracyM: 20,
          food: [{ name: "Far stall", distanceM: 60 }, { name: "Near stall", distanceM: 10 }].sort((a, b) => a.distanceM - b.distanceM),
          markets: [{ name: "Warorot Market", distanceM: 120, type: "Market" }],
        },
        time: { now: "2026-09-27T03:00:00Z", timeZone: "Asia/Bangkok" },
      },
    });
    expect(p).toMatch(/<owner_profile>\nPicked by the owner/);
    expect(p).toContain("Peanut allergy");
    expect(p).toMatch(/<owner_notes>\nFree text the owner typed/);
    expect(p).toMatch(/possibly happening at one of these places/);
    expect(p.indexOf("Near stall")).toBeLessThan(p.indexOf("Far stall"));
    expect(p).toContain("Sunday 27 September 2026, 10:00");
    expect(p).toContain("rainy season");
  });

  it("works in reverse when the owner is the Thai shopkeeper", () => {
    const p = turnPrompt({ ...base, side: "them", heard: "cow soy no peanut", languages: { me: "th", them: "en" } });
    expect(p).toContain("Speaker: the other person, speaking English");
    expect(p).toContain("Listener: the owner, reads Thai");
    expect(p).toContain('Write "original" in English and "translation" in Thai. Cards, if any, in Thai.');
    expect(p).not.toContain("does not read Thai");
  });

  it("gives the owner's particle only when the owner's words come out in Thai", () => {
    expect(turnPrompt({ ...base, side: "me", heard: "hi", particle: "f" })).toContain("ค่ะ");
    expect(turnPrompt({ ...base, side: "them" })).not.toContain("Owner's particle");
  });
});

describe("turnTool", () => {
  it("has no cards field when cards are off", () => {
    expect(turnTool(true).input_schema.properties).toHaveProperty("cards");
    expect(turnTool(false).input_schema.properties).not.toHaveProperty("cards");
  });
});

describe("completedString", () => {
  it("waits for the closing quote, then unescapes", () => {
    expect(completedString('{"original": "hi", "translation": "สวัส', "translation")).toBeUndefined();
    expect(completedString('{"original": "say \\"hi\\"", "trans', "original")).toBe('say "hi"');
  });
});

describe("localTime", () => {
  it("returns null on a bad timestamp", () => expect(localTime("nope", "Asia/Bangkok")).toBeNull());
});
