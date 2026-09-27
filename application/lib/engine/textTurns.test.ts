import { describe, expect, it } from "vitest";
import { ConversationEngine } from "./engine";
import type { TranslateInput, TranslateResult, TurnService } from "./types";

function service() {
  const transcribes: string[] = [];
  const translates: { input: TranslateInput; resolve: (r: TranslateResult) => void; reject: (e: Error) => void }[] = [];
  const svc: TurnService = {
    transcribe: async (_audio, language) => {
      transcribes.push(language);
      return "from audio";
    },
    translate: (input) => new Promise((resolve, reject) => translates.push({ input, resolve, reject })),
  };
  return { svc, transcribes, translates };
}

const flush = () => new Promise((r) => setTimeout(r, 0));
const card = { heading: "Khao Soi", body: "Curry noodle soup. Ask for mild.", suggestion: "Tell me more about the khao soi" };
const reply = (over: Partial<TranslateResult> = {}): TranslateResult => ({ translation: ["ข้าวซอย"], original: ["Khao soi"], card: null, ...over });

describe("browser transcript and text Turns", () => {
  it("translates the browser's transcript without calling transcribe", async () => {
    const fake = service();
    const engine = new ConversationEngine({ service: fake.svc });
    engine.micTap("vendor");
    const done = engine.stopWithTranscript("vendor", "  ข้าวซอยเจ้า <noise> ");
    expect(engine.getState().phase).toEqual({ kind: "processing", speaker: "vendor", raw: "ข้าวซอยเจ้า" });
    await flush();
    expect(fake.transcribes).toEqual([]);
    expect(fake.translates[0].input.raw).toBe("ข้าวซอยเจ้า");
    fake.translates[0].resolve(reply({ cards: [card] }));
    await done;
    expect(engine.getState().messages[0]).toMatchObject({ speaker: "vendor", cards: [card] });
    expect(engine.getState().phase).toEqual({ kind: "idle", nextTurn: "you" });
  });

  it("an empty transcript is 'didn't catch that'", async () => {
    const engine = new ConversationEngine({ service: service().svc });
    engine.micTap("you");
    await engine.stopWithTranscript("you", "  [music] ");
    expect(engine.getState().phase).toMatchObject({ kind: "error", reason: "empty", speaker: "you" });
  });

  it("sends a suggestion as your Turn, with the phone's context", async () => {
    const fake = service();
    const context = { context: { notes: "Allergic to cashews" }, options: { cards: true, moves: false } };
    const engine = new ConversationEngine({ service: fake.svc, getContext: () => context });
    const done = engine.say("you", card.suggestion);
    expect(engine.getState().phase).toEqual({ kind: "processing", speaker: "you", raw: card.suggestion });
    await flush();
    expect(fake.translates[0].input).toMatchObject({ raw: card.suggestion, speaker: "you", ...context });
    fake.translates[0].resolve(reply());
    await done;
    expect(engine.getState().messages).toHaveLength(1);
  });

  it("ignores a suggestion while a Turn is in progress", async () => {
    const fake = service();
    const engine = new ConversationEngine({ service: fake.svc });
    engine.micTap("vendor");
    await engine.say("you", "hello");
    expect(engine.getState().phase).toMatchObject({ kind: "listening", speaker: "vendor" });
  });

  it("retries a failed text Turn from its text", async () => {
    const fake = service();
    const engine = new ConversationEngine({ service: fake.svc });
    const first = engine.say("you", "How much?");
    await flush();
    fake.translates[0].reject(new Error("502"));
    await first;
    expect(engine.getState().phase).toMatchObject({ kind: "error", reason: "network", raw: "How much?" });
    const again = engine.retry();
    await flush();
    expect(fake.translates[1].input.raw).toBe("How much?");
    fake.translates[1].resolve(reply());
    await again;
    expect(engine.getState().messages).toHaveLength(1);
  });
});
