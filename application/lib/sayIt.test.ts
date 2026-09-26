import { describe, expect, it } from "vitest";
import type { Message } from "./engine/types";
import { sayItRows } from "./sayIt";

const msg = (translation: string[], romanised: string[] | undefined, original: string[]): Message => ({
  id: "1",
  speaker: "you",
  translation,
  original,
  romanised,
  card: null,
});

describe("sayItRows", () => {
  it("gives one row per Thai item with its phonetics and meaning", () => {
    expect(sayItRows(msg(["อร่อยมากครับ", "เท่าไหร่ครับ"], ["a-roi mak khrap", "thao-rai khrap"], ["Very tasty", "How much?"]))).toEqual([
      { thai: "อร่อยมากครับ", roman: "a-roi mak khrap", meaning: "Very tasty" },
      { thai: "เท่าไหร่ครับ", roman: "thao-rai khrap", meaning: "How much?" },
    ]);
  });

  it("keeps one row per item when the phonetics are short: the item without one gets no phonetic line", () => {
    expect(sayItRows(msg(["อร่อยมากครับ", "เท่าไหร่ครับ"], ["a-roi mak khrap"], ["Very tasty", "How much?"]))).toEqual([
      { thai: "อร่อยมากครับ", roman: "a-roi mak khrap", meaning: "Very tasty" },
      { thai: "เท่าไหร่ครับ", roman: null, meaning: "How much?" },
    ]);
  });

  it("never merges items, and drops extra phonetics that match no item", () => {
    const rows = sayItRows(msg(["อร่อยมากครับ"], ["a-roi", "mak khrap"], ["Very tasty"]));
    expect(rows).toEqual([{ thai: "อร่อยมากครับ", roman: "a-roi", meaning: "Very tasty" }]);
  });

  it("works without phonetics or with fewer meanings", () => {
    expect(sayItRows(msg(["ก", "ข"], undefined, ["only one"]))).toEqual([
      { thai: "ก", roman: null, meaning: "only one" },
      { thai: "ข", roman: null, meaning: null },
    ]);
  });
});
