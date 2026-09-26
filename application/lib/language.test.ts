import { describe, expect, it } from "vitest";
import { findLanguage, loadLanguage, LANGUAGES, saveLanguage } from "./language";

function fakeStorage(): Storage {
  const data = new Map<string, string>();
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) } as Storage;
}

describe("visitor language", () => {
  it("defaults to English", () => {
    expect(loadLanguage(fakeStorage())).toBe("en");
  });

  it("is remembered on the phone", () => {
    const storage = fakeStorage();
    saveLanguage("fr", storage);
    expect(loadLanguage(storage)).toBe("fr");
  });

  it("ignores an unknown stored value", () => {
    const storage = fakeStorage();
    storage.setItem("u-mueang:language", "xx");
    expect(loadLanguage(storage)).toBe("en");
  });

  it("gives the mic verb in each language", () => {
    expect(findLanguage("fr").verb).toBe("Parler");
    expect(findLanguage("de").verb).toBe("Sprechen");
    expect(LANGUAGES.every((l) => l.verb && l.stop && l.name)).toBe(true);
  });
});
