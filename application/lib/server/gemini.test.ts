import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FALLBACK_MODEL, generate } from "./gemini";

type Reply = { status?: number; text?: string; delayMs?: number } | "hang";

/** Fake Gemini: one reply per call, in order. Honours the abort signal like fetch does. */
function fakeGemini(...replies: Reply[]) {
  const models: string[] = [];
  const fetchMock = vi.fn((url: string, init: RequestInit) => {
    models.push(url.split("/models/")[1].split(":")[0]);
    const reply = replies.shift() ?? "hang";
    return new Promise<Response>((resolve, reject) => {
      init.signal?.addEventListener("abort", () => reject(init.signal!.reason));
      if (reply === "hang") return;
      setTimeout(() => {
        const status = reply.status ?? 200;
        const body = status === 200 ? { candidates: [{ content: { parts: [{ text: reply.text ?? "ok" }] } }] } : {};
        resolve(new Response(JSON.stringify(body), { status }));
      }, reply.delayMs ?? 0);
    });
  });
  vi.stubGlobal("fetch", fetchMock);
  return models;
}

const PARTS = [{ text: "hi" }];
const FAST = { budgetMs: 300, primaryMs: 150 };

beforeEach(() => vi.stubEnv("GEMINI_API_KEY", "test"));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("generate", () => {
  it("falls back when the main model is overloaded", async () => {
    const models = fakeGemini({ status: 503 }, { text: "from fallback" });
    await expect(generate("main-model", PARTS, FAST)).resolves.toBe("from fallback");
    expect(models).toEqual(["main-model", FALLBACK_MODEL]);
  });

  it("falls back when the main model is too slow", async () => {
    const models = fakeGemini("hang", { text: "from fallback" });
    await expect(generate("main-model", PARTS, FAST)).resolves.toBe("from fallback");
    expect(models).toEqual(["main-model", FALLBACK_MODEL]);
  });

  it("never runs past the total budget, fallback included", async () => {
    fakeGemini({ status: 429, delayMs: 100 }, "hang");
    const start = Date.now();
    await expect(generate("main-model", PARTS, FAST)).rejects.toThrow();
    expect(Date.now() - start).toBeLessThan(FAST.budgetMs + 100);
  });

  it("gives the whole budget to a single call when the model is the fallback", async () => {
    const models = fakeGemini({ text: "slow but fine", delayMs: 200 });
    await expect(generate(FALLBACK_MODEL, PARTS, FAST)).resolves.toBe("slow but fine");
    expect(models).toEqual([FALLBACK_MODEL]);
  });

  it("does not fall back on a request error", async () => {
    const models = fakeGemini({ status: 400 });
    await expect(generate("main-model", PARTS, FAST)).rejects.toThrow(/400/);
    expect(models).toEqual(["main-model"]);
  });
});
