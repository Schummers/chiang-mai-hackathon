import { describe, expect, it, vi } from "vitest";
import { ConversationEngine, initialState, reduce, stripNonSpeech, toHistory, type EngineOptions } from "./engine";
import type { TranslateResult } from "./types";

const input = () => ({
  languages: { me: "en", them: "th" },
  context: {},
  options: { cards: true, pack: true },
});

const result: TranslateResult = { original: "ขอข้าวซอยครับ", translation: "Khao soi, please", cards: [] };

describe("reduce", () => {
  it("goes listening -> processing -> idle with the next turn on the other side", () => {
    let s = reduce(initialState(), { type: "MIC_TAP", side: "them", at: 1 });
    expect(s.phase).toEqual({ kind: "listening", side: "them", startedAt: 1 });
    s = reduce(s, { type: "HEARD", side: "them", heard: "ขอข้าวซอย" });
    expect(s.phase).toEqual({ kind: "processing", side: "them", heard: "ขอข้าวซอย" });
    s = reduce(s, { type: "TRANSLATED", id: "a", result });
    expect(s.phase).toEqual({ kind: "idle", nextTurn: "me" });
    expect(s.messages[0]).toMatchObject({ id: "a", side: "them", heard: "ขอข้าวซอย", ...result });
  });

  it("ignores a mic tap while processing", () => {
    const s = reduce(initialState(), { type: "HEARD", side: "me", heard: "hi" });
    expect(reduce(s, { type: "MIC_TAP", side: "them", at: 2 })).toBe(s);
  });

  it("keeps what was heard on failure so Retry only calls the model again", () => {
    let s = reduce(initialState(), { type: "HEARD", side: "me", heard: "hi" });
    s = reduce(s, { type: "FAILED", side: "me", reason: "network", heard: "hi" });
    expect(reduce(s, { type: "RETRY" }).phase).toEqual({ kind: "processing", side: "me", heard: "hi" });
  });
});

describe("ConversationEngine", () => {
  it("sends the transcript with history and context, then adds the message", async () => {
    const translate = vi.fn<EngineOptions["translate"]>(async () => result);
    const onMessage = vi.fn();
    const engine = new ConversationEngine({ translate, getInput: input, onMessage });
    engine.micTap("them");
    await engine.heard("them", "ขอ ข้าวซอย <noise>");
    expect(translate.mock.calls[0][0]).toMatchObject({ side: "them", heard: "ขอ ข้าวซอย", history: [], languages: { me: "en", them: "th" } });
    expect(engine.getState().messages).toHaveLength(1);
    expect(onMessage).toHaveBeenCalledOnce();
  });

  it("fails as empty when nothing but noise was heard", async () => {
    const engine = new ConversationEngine({ translate: vi.fn(), getInput: input });
    engine.micTap("me");
    await engine.heard("me", "[music]");
    expect(engine.getState().phase).toMatchObject({ kind: "error", reason: "empty" });
  });

  it("drops a late answer from a previous conversation", async () => {
    let resolve!: (r: TranslateResult) => void;
    const engine = new ConversationEngine({ translate: () => new Promise((r) => (resolve = r)), getInput: input });
    const pending = engine.say("me", "hello");
    engine.newConversation();
    resolve(result);
    await pending;
    expect(engine.getState().messages).toHaveLength(0);
  });

  it("says a suggestion as the owner's turn", async () => {
    const translate = vi.fn<EngineOptions["translate"]>(async () => result);
    const engine = new ConversationEngine({ translate, getInput: input });
    await engine.say("me", "Tell me more about the khao soi");
    expect(translate.mock.calls[0][0]).toMatchObject({ side: "me", heard: "Tell me more about the khao soi" });
  });
});

describe("streaming", () => {
  const card = { heading: "Khao Soi", body: "Curry noodles. Ask about toppings." };

  it("shows the translation first, then attaches cards even after the next turn started", async () => {
    let finish!: (r: TranslateResult) => void;
    const onMessage = vi.fn();
    const engine = new ConversationEngine({
      translate: (_, onText) => {
        onText({ original: result.original, translation: result.translation });
        return new Promise((r) => (finish = r));
      },
      getInput: input,
      onMessage,
    });
    const pending = engine.say("them", "ขอข้าวซอย");
    await Promise.resolve();
    expect(engine.getState().messages[0].cards).toEqual([]);
    expect(engine.getState().phase).toEqual({ kind: "idle", nextTurn: "me" });
    expect(onMessage).toHaveBeenCalledOnce();
    engine.micTap("me");
    finish({ ...result, cards: [card] });
    await pending;
    expect(engine.getState().messages[0].cards).toEqual([card]);
    expect(engine.getState().phase.kind).toBe("listening");
  });

  it("is not an error when the stream fails after the translation was shown", async () => {
    const engine = new ConversationEngine({
      translate: async (_, onText) => {
        onText({ original: "o", translation: "t" });
        throw new Error("cut");
      },
      getInput: input,
    });
    await engine.say("me", "hello");
    expect(engine.getState().phase.kind).toBe("idle");
    expect(engine.getState().messages).toHaveLength(1);
  });
});

describe("helpers", () => {
  it("strips non-speech tags", () => expect(stripNonSpeech("(noise) hello [Music]")).toBe("hello"));

  it("keeps card headings in history", () => {
    const h = toHistory([{ id: "a", side: "them", heard: "x", original: "o", translation: "t", cards: [{ heading: "Khao Soi", body: "b" }] }]);
    expect(h).toEqual([{ side: "them", original: "o", translation: "t", cards: [{ heading: "Khao Soi" }] }]);
  });
});
