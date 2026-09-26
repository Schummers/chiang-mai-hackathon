import { describe, expect, it } from "vitest";
import { fitWithin } from "./photo";

describe("fitWithin", () => {
  it("shrinks the long side to the max, keeping the ratio", () => {
    expect(fitWithin(4032, 3024, 1280)).toEqual({ width: 1280, height: 960 });
    expect(fitWithin(3024, 4032, 1280)).toEqual({ width: 960, height: 1280 });
  });

  it("never enlarges a small image", () => {
    expect(fitWithin(800, 600, 1280)).toEqual({ width: 800, height: 600 });
  });
});
