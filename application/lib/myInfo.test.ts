import { beforeEach, describe, expect, it } from "vitest";
import { chipLabels, loadMyInfo, mergeMyInfo, particleOf, saveMyInfo } from "./myInfo";
import { EMPTY_MY_INFO, type MyInfo } from "./engine/types";

function fakeStorage(): Storage {
  const data = new Map<string, string>();
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
    clear: () => data.clear(),
    key: () => null,
    get length() {
      return data.size;
    },
  };
}

const broken = {
  getItem: () => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("blocked");
  },
} as unknown as Storage;

describe("my info", () => {
  let storage: Storage;
  beforeEach(() => (storage = fakeStorage()));

  it("is empty the first time", () => {
    expect(loadMyInfo(storage)).toEqual(EMPTY_MY_INFO);
  });

  it("comes back after being saved on the phone", () => {
    const info: MyInfo = { allergies: ["peanuts"], spice: "mild", diet: ["halal"] };
    saveMyInfo(info, storage);
    expect(loadMyInfo(storage)).toEqual(info);
  });

  it("falls back to empty when storage is blocked or corrupted", () => {
    expect(loadMyInfo(broken)).toEqual(EMPTY_MY_INFO);
    expect(() => saveMyInfo(EMPTY_MY_INFO, broken)).not.toThrow();
    storage.setItem("u-mueang:my-info", "{not json");
    expect(loadMyInfo(storage)).toEqual(EMPTY_MY_INFO);
  });

  it("adds what was said aloud without dropping what was there", () => {
    const current: MyInfo = { allergies: ["gluten"], spice: null, diet: ["no-pork"] };
    const { info, changed } = mergeMyInfo(current, { allergies: ["peanuts"], spice: "mild" });
    expect(info).toEqual({ allergies: ["gluten", "peanuts"], spice: "mild", diet: ["no-pork"] });
    expect(changed).toBe(true);
  });

  it("reports no change when the info was already known", () => {
    const current: MyInfo = { allergies: ["peanuts"], spice: null, diet: [] };
    expect(mergeMyInfo(current, { allergies: ["peanuts"] }).changed).toBe(false);
  });

  it("keeps the particle through save, load and merge; m by default", () => {
    expect(particleOf(EMPTY_MY_INFO)).toBe("m");
    const info: MyInfo = { ...EMPTY_MY_INFO, particle: "f" };
    saveMyInfo(info, storage);
    expect(loadMyInfo(storage).particle).toBe("f");
    expect(mergeMyInfo(info, { allergies: ["peanuts"] }).info.particle).toBe("f");
    storage.setItem("u-mueang:my-info", JSON.stringify({ particle: "x" }));
    expect(particleOf(loadMyInfo(storage))).toBe("m");
  });

  it("still reads the particle saved under its old key, speaker", () => {
    storage.setItem("u-mueang:my-info", JSON.stringify({ allergies: [], speaker: "f" }));
    expect(loadMyInfo(storage)).toMatchObject({ particle: "f" });
    expect(loadMyInfo(storage)).not.toHaveProperty("speaker");
    expect(particleOf({ speaker: "f" })).toBe("f");
    expect(particleOf(undefined)).toBe("m");
  });

  it("lists only the selected chips", () => {
    expect(chipLabels({ allergies: ["peanuts"], spice: "mild", diet: [] })).toEqual(["Peanut allergy", "Mild spice"]);
    expect(chipLabels(EMPTY_MY_INFO)).toEqual([]);
  });
});
