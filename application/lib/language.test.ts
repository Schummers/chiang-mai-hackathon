import { describe, expect, it } from "vitest";
import { loadLanguages, pickLanguage } from "./language";

describe("pickLanguage", () => {
  it("swaps when a side picks the other side's language", () => {
    expect(pickLanguage({ me: "en", them: "th" }, "me", "th")).toEqual({ me: "th", them: "en" });
  });

  it("just sets it otherwise", () => {
    expect(pickLanguage({ me: "en", them: "th" }, "me", "fr")).toEqual({ me: "fr", them: "th" });
  });
});

describe("loadLanguages", () => {
  const storage = (value: string | null) => ({ getItem: () => value }) as unknown as Storage;

  it("falls back to English and Thai on junk", () => {
    expect(loadLanguages(storage("{bad"))).toEqual({ me: "en", them: "th" });
    expect(loadLanguages(storage(JSON.stringify({ me: "th", them: "th" })))).toEqual({ me: "en", them: "th" });
  });

  it("allows a Thai owner", () => {
    expect(loadLanguages(storage(JSON.stringify({ me: "th", them: "en" })))).toEqual({ me: "th", them: "en" });
  });
});
