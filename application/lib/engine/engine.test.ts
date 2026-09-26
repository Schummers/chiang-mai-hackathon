import { afterEach, describe, expect, it, vi } from "vitest";
import { ConversationEngine } from "./engine";
import { createMockTurnService, KHAO_SOI_SCRIPT } from "./mockTurnService";
import { createTurnService } from "./turnService";
import type { MoveCard, MyInfo, PhotoCard, ReadPhotoInput, TranslateInput, TranslateResult, TurnService } from "./types";

// A turn service whose calls resolve only when the test says so.
function controllableService() {
  const transcribes: { language: string; resolve: (raw: string) => void; reject: (e: Error) => void }[] = [];
  const translates: { input: TranslateInput; resolve: (r: TranslateResult) => void; reject: (e: Error) => void }[] = [];
  const service: TurnService = {
    transcribe: (_audio, language) =>
      new Promise((resolve, reject) => transcribes.push({ language, resolve, reject })),
    translate: (input) => new Promise((resolve, reject) => translates.push({ input, resolve, reject })),
  };
  return { service, transcribes, translates };
}

const audio = new Blob(["fake"], { type: "audio/webm" });
const flush = () => new Promise((r) => setTimeout(r, 0));

const reply = (over: Partial<TranslateResult> = {}): TranslateResult => ({
  translation: ["จานนี้คืออะไรครับ"],
  original: ["What is this dish?"],
  card: null,
  ...over,
});

async function fullTurn(engine: ConversationEngine, fake: ReturnType<typeof controllableService>, speaker: "you" | "vendor", result: TranslateResult) {
  engine.micTap(speaker);
  const done = engine.stop(speaker, audio);
  await flush();
  fake.transcribes.at(-1)!.resolve("some raw words");
  await flush();
  fake.translates.at(-1)!.resolve(result);
  await done;
}

afterEach(() => {
  vi.useRealTimers();
});

describe("conversation engine", () => {
  it("opens on an empty conversation where it's your turn", () => {
    const engine = new ConversationEngine({ service: controllableService().service });
    expect(engine.getState().messages).toEqual([]);
    expect(engine.getState().phase).toEqual({ kind: "idle", nextTurn: "you" });
  });

  it("lets only one speaker record at a time", () => {
    const engine = new ConversationEngine({ service: controllableService().service, now: () => 1000 });
    engine.micTap("you");
    expect(engine.getState().phase).toEqual({ kind: "listening", speaker: "you", startedAt: 1000 });
    engine.micTap("vendor");
    expect(engine.getState().phase).toMatchObject({ kind: "listening", speaker: "you" });
  });

  it("either side may start when idle, the pulse is only a hint", () => {
    const engine = new ConversationEngine({ service: controllableService().service });
    engine.micTap("vendor");
    expect(engine.getState().phase).toMatchObject({ kind: "listening", speaker: "vendor" });
  });

  it("shows the raw transcript before the final message", async () => {
    const fake = controllableService();
    const engine = new ConversationEngine({ service: fake.service });
    engine.micTap("you");
    const done = engine.stop("you", audio);
    expect(engine.getState().phase).toEqual({ kind: "processing", speaker: "you" });

    await flush();
    fake.transcribes[0].resolve("uh so what is this, is it spicy");
    await flush();
    expect(engine.getState().phase).toEqual({ kind: "processing", speaker: "you", raw: "uh so what is this, is it spicy" });
    expect(engine.getState().messages).toHaveLength(0);

    fake.translates[0].resolve(reply());
    await done;
    expect(engine.getState().messages).toMatchObject([
      { speaker: "you", translation: ["จานนี้คืออะไรครับ"], original: ["What is this dish?"], card: null },
    ]);
  });

  it("keeps the Move on the message, so the next Turn's history knows it was shown", async () => {
    const fake = controllableService();
    const engine = new ConversationEngine({ service: fake.service });
    const move: MoveCard = {
      id: "say-hello",
      type: "say",
      stage: "start",
      english: "Hello",
      centralThai: "สวัสดีครับ",
      khamMueang: "สะหวัดดีคับ",
      romanised: { central: "sa-wat-dee khrap", khamMueang: "sa-wat-dee khap" },
    };
    await fullTurn(engine, fake, "you", reply({ move }));
    expect(engine.getState().messages[0].move).toEqual(move);
    await fullTurn(engine, fake, "vendor", reply());
    expect(fake.translates[1].input.history[0].move?.id).toBe("say-hello");
  });

  it("hands the turn to the other side after each message", async () => {
    const fake = controllableService();
    const engine = new ConversationEngine({ service: fake.service });
    await fullTurn(engine, fake, "you", reply());
    expect(engine.getState().phase).toEqual({ kind: "idle", nextTurn: "vendor" });
    await fullTurn(engine, fake, "vendor", reply());
    expect(engine.getState().phase).toEqual({ kind: "idle", nextTurn: "you" });
  });

  it("transcribes the vendor in Thai and you in your language", async () => {
    const fake = controllableService();
    const engine = new ConversationEngine({ service: fake.service, getUserLanguage: () => "fr" });
    await fullTurn(engine, fake, "you", reply());
    await fullTurn(engine, fake, "vendor", reply());
    expect(fake.transcribes.map((t) => t.language)).toEqual(["fr", "th"]);
  });

  it("keeps several questions as separate bullets", async () => {
    const fake = controllableService();
    const engine = new ConversationEngine({ service: fake.service });
    const items = { translation: ["a", "b", "c"], original: ["A", "B", "C"] };
    await fullTurn(engine, fake, "you", reply(items));
    expect(engine.getState().messages[0]).toMatchObject(items);
  });

  it("attaches a context card only when the service returns one", async () => {
    const fake = controllableService();
    const engine = new ConversationEngine({ service: fake.service });
    const card = { name: "Khao Soi", description: "Curry noodle soup" };
    await fullTurn(engine, fake, "you", reply());
    await fullTurn(engine, fake, "vendor", reply({ card }));
    expect(engine.getState().messages.map((m) => m.card)).toEqual([null, card]);
  });

  it("sends my info, my language and the history with every translation", async () => {
    const fake = controllableService();
    const myInfo: MyInfo = { allergies: ["peanuts"], spice: "mild", diet: [] };
    const engine = new ConversationEngine({ service: fake.service, getMyInfo: () => myInfo, getUserLanguage: () => "en" });
    await fullTurn(engine, fake, "you", reply());
    await fullTurn(engine, fake, "vendor", reply());
    expect(fake.translates[1].input).toMatchObject({
      raw: "some raw words",
      speaker: "vendor",
      userLanguage: "en",
      myInfo,
      history: [{ speaker: "you" }],
    });
  });

  it("reports info detected in what you said", async () => {
    const fake = controllableService();
    const onDetectedInfo = vi.fn();
    const engine = new ConversationEngine({ service: fake.service, onDetectedInfo });
    await fullTurn(engine, fake, "you", reply({ detectedInfo: { allergies: ["peanuts"] } }));
    expect(onDetectedInfo).toHaveBeenCalledWith({ allergies: ["peanuts"] });
  });

  it("announces each new message, e.g. to read it aloud", async () => {
    const fake = controllableService();
    const onMessage = vi.fn();
    const engine = new ConversationEngine({ service: fake.service, onMessage });
    await fullTurn(engine, fake, "you", reply());
    expect(onMessage).toHaveBeenCalledWith(expect.objectContaining({ speaker: "you", translation: ["จานนี้คืออะไรครับ"] }));
  });

  it("shows a network error when transcription fails, and the same speaker can retry", async () => {
    const fake = controllableService();
    const engine = new ConversationEngine({ service: fake.service });
    engine.micTap("you");
    const done = engine.stop("you", audio);
    await flush();
    fake.transcribes[0].reject(new Error("offline"));
    await done;
    expect(engine.getState().phase).toEqual({ kind: "error", speaker: "you", reason: "network" });
    expect(engine.getState().messages).toHaveLength(0);

    engine.micTap("you");
    expect(engine.getState().phase).toMatchObject({ kind: "listening", speaker: "you" });
  });

  it("shows a network error when translation fails", async () => {
    const fake = controllableService();
    const engine = new ConversationEngine({ service: fake.service });
    engine.micTap("vendor");
    const done = engine.stop("vendor", audio);
    await flush();
    fake.transcribes[0].resolve("ข้าวซอย");
    await flush();
    fake.translates[0].reject(new Error("500"));
    await done;
    expect(engine.getState().phase).toMatchObject({ kind: "error", speaker: "vendor", reason: "network" });
  });

  it("keeps the turn after a failed transcription: retry sends the same audio again", async () => {
    const fake = controllableService();
    const engine = new ConversationEngine({ service: fake.service });
    engine.micTap("you");
    const first = engine.stop("you", audio);
    await flush();
    fake.transcribes[0].reject(new Error("offline"));
    await first;

    const retried = engine.retry();
    expect(engine.getState().phase).toEqual({ kind: "processing", speaker: "you" });
    await flush();
    expect(fake.transcribes).toHaveLength(2);
    fake.transcribes[1].resolve("what is this");
    await flush();
    fake.translates[0].resolve(reply());
    await retried;
    expect(engine.getState().messages).toHaveLength(1);
  });

  it("keeps the raw transcript after a failed translation: retry only translates again", async () => {
    const fake = controllableService();
    const engine = new ConversationEngine({ service: fake.service });
    engine.micTap("vendor");
    const first = engine.stop("vendor", audio);
    await flush();
    fake.transcribes[0].resolve("ข้าวซอย");
    await flush();
    fake.translates[0].reject(new Error("500"));
    await first;
    expect(engine.getState().phase).toEqual({ kind: "error", speaker: "vendor", reason: "network", raw: "ข้าวซอย" });

    const retried = engine.retry();
    expect(engine.getState().phase).toEqual({ kind: "processing", speaker: "vendor", raw: "ข้าวซอย" });
    await flush();
    expect(fake.transcribes).toHaveLength(1);
    fake.translates[1].resolve(reply());
    await retried;
    expect(engine.getState().messages.map((m) => m.speaker)).toEqual(["vendor"]);
  });

  it("gives up on a service that takes too long", async () => {
    vi.useFakeTimers();
    const fake = controllableService();
    const engine = new ConversationEngine({ service: fake.service, timeoutMs: 1000 });
    engine.micTap("you");
    const done = engine.stop("you", audio);
    await vi.advanceTimersByTimeAsync(1001);
    await done;
    expect(engine.getState().phase).toEqual({ kind: "error", speaker: "you", reason: "network" });
    vi.useRealTimers();
  });

  it("shows an empty-recording error when nothing was heard", async () => {
    const fake = controllableService();
    const engine = new ConversationEngine({ service: fake.service });
    engine.micTap("you");
    const done = engine.stop("you", audio);
    await flush();
    fake.transcribes[0].resolve("   ");
    await done;
    expect(engine.getState().phase).toEqual({ kind: "error", speaker: "you", reason: "empty" });
    expect(fake.translates).toHaveLength(0);
  });

  it.each(["<noise>", "[noise] <noise>", "(silence)", "[Music]"])("treats a non-speech tag like %s as nothing heard", async (tag) => {
    const fake = controllableService();
    const engine = new ConversationEngine({ service: fake.service });
    engine.micTap("you");
    const done = engine.stop("you", audio);
    await flush();
    fake.transcribes[0].resolve(tag);
    await done;
    expect(engine.getState().phase).toEqual({ kind: "error", speaker: "you", reason: "empty" });
    expect(fake.translates).toHaveLength(0);
  });

  it("shows a mic-denied error, and dismissing it gives the turn back to that speaker", () => {
    const engine = new ConversationEngine({ service: controllableService().service });
    engine.micTap("you");
    engine.fail("you", "mic-denied");
    expect(engine.getState().phase).toEqual({ kind: "error", speaker: "you", reason: "mic-denied" });
    engine.dismissError();
    expect(engine.getState().phase).toEqual({ kind: "idle", nextTurn: "you" });
  });

  it("cancels a recording without sending anything", () => {
    const fake = controllableService();
    const engine = new ConversationEngine({ service: fake.service });
    engine.micTap("vendor");
    engine.cancel();
    expect(engine.getState().phase).toEqual({ kind: "idle", nextTurn: "vendor" });
  });

  it("starts a new conversation from scratch and ignores late answers from the old one", async () => {
    const fake = controllableService();
    const engine = new ConversationEngine({ service: fake.service });
    await fullTurn(engine, fake, "you", reply());
    engine.micTap("vendor");
    const late = engine.stop("vendor", audio);
    await flush();

    engine.newConversation();
    expect(engine.getState().messages).toEqual([]);
    expect(engine.getState().phase).toEqual({ kind: "idle", nextTurn: "you" });

    fake.transcribes[1].resolve("late words");
    await late;
    expect(fake.translates).toHaveLength(1);
    expect(engine.getState().phase).toEqual({ kind: "idle", nextTurn: "you" });
    expect(engine.getState().messages).toEqual([]);
  });

  it("ignores a late answer from a turn that failed meanwhile, even in the same conversation", async () => {
    const fake = controllableService();
    const engine = new ConversationEngine({ service: fake.service });
    engine.micTap("you");
    const first = engine.stop("you", audio);
    await flush();

    // The mic prompt was refused after the stop: the UI reports it while the first turn is still in flight.
    engine.fail("you", "mic-denied");
    engine.dismissError();
    engine.micTap("you");
    const second = engine.stop("you", audio);
    await flush();

    fake.transcribes[0].resolve("old words");
    await first;
    expect(engine.getState().phase).toEqual({ kind: "processing", speaker: "you" });
    expect(fake.translates).toHaveLength(0);

    fake.transcribes[1].resolve("new words");
    await flush();
    fake.translates[0].resolve(reply());
    await second;
    expect(engine.getState().messages).toHaveLength(1);
    expect(fake.translates[0].input.raw).toBe("new words");
  });

  it("notifies subscribers on every change", () => {
    const engine = new ConversationEngine({ service: controllableService().service });
    const listener = vi.fn();
    const unsubscribe = engine.subscribe(listener);
    engine.micTap("you");
    engine.cancel();
    unsubscribe();
    engine.micTap("you");
    expect(listener).toHaveBeenCalledTimes(2);
  });
});

describe("mock turn service (Khao Soi scenario)", () => {
  it("replays the 4-turn exchange, with the card on the vendor's first answer", async () => {
    const onDetectedInfo = vi.fn();
    const engine = new ConversationEngine({
      service: createMockTurnService({ transcribeMs: 0, translateMs: 0 }),
      onDetectedInfo,
    });
    for (const speaker of ["you", "vendor", "you", "vendor"] as const) {
      engine.micTap(speaker);
      await engine.stop(speaker, audio);
    }
    const messages = engine.getState().messages;
    expect(messages.map((m) => m.speaker)).toEqual(["you", "vendor", "you", "vendor"]);
    expect(messages[0].translation).toHaveLength(3);
    // Say it yourself works without the API: the mock carries phonetics for the Visitor's Thai.
    expect(messages[0].romanised).toHaveLength(3);
    expect(messages[1].romanised).toBeUndefined();
    expect(messages[1].translation).toEqual(["Chicken khao soi", "A little spicy", "No peanuts"]);
    expect(messages[1].card).toMatchObject({ name: "Khao Soi", nameThai: "ข้าวซอย" });
    expect(messages.filter((m) => m.card)).toHaveLength(1);
    expect(onDetectedInfo).toHaveBeenCalledWith({ allergies: ["peanuts"] });
    expect(engine.getState().phase).toEqual({ kind: "idle", nextTurn: "you" });
  });

  it("replays the scenario from the start after a new conversation", async () => {
    const engine = new ConversationEngine({ service: createMockTurnService({ transcribeMs: 0, translateMs: 0 }) });
    engine.micTap("you");
    await engine.stop("you", audio);
    engine.newConversation();
    engine.micTap("you");
    const done = engine.stop("you", audio);
    await new Promise((r) => setTimeout(r, 1));
    expect(engine.getState().phase).toMatchObject({ raw: KHAO_SOI_SCRIPT[0].raw });
    await done;
  });

  it("waits roughly the configured delays", async () => {
    vi.useFakeTimers();
    const service = createMockTurnService({ transcribeMs: 800, translateMs: 1500 });
    let raw: string | undefined;
    service.transcribe(audio, "en").then((r) => (raw = r));
    await vi.advanceTimersByTimeAsync(799);
    expect(raw).toBeUndefined();
    await vi.advanceTimersByTimeAsync(1);
    expect(raw).toBe(KHAO_SOI_SCRIPT[0].raw);
    vi.useRealTimers();
  });

  it("is the default turn service", () => {
    expect(createTurnService(undefined).kind).toBe("mock");
    expect(createTurnService("api").kind).toBe("api");
  });
});

// A turn service that reads photos only when the test says so, with fake object URLs.
function photoService() {
  const reads: { image: Blob; input: ReadPhotoInput; resolve: (c: PhotoCard) => void; reject: (e: Error) => void }[] = [];
  const service: TurnService = {
    ...controllableService().service,
    readPhoto: (image, input) => new Promise((resolve, reject) => reads.push({ image, input, resolve, reject })),
  };
  let n = 0;
  const revoked: string[] = [];
  const objectUrls = { create: () => `blob:photo-${++n}`, revoke: (url: string) => void revoked.push(url) };
  return { service, reads, objectUrls, revoked };
}

const image = new Blob(["jpeg"], { type: "image/jpeg" });
const menuCard: PhotoCard = {
  kind: "menu",
  title: "Noodle stall menu",
  description: "Four northern dishes.",
  items: [{ name: "Gaeng Hang Lay", warning: "Often cooked with peanuts: ask." }],
};

describe("photo turn", () => {
  it("goes idle -> reading -> idle and adds the photo with its card", async () => {
    const fake = photoService();
    const peanuts: MyInfo = { allergies: ["peanuts"], spice: null, diet: [] };
    const engine = new ConversationEngine({
      service: fake.service,
      objectUrls: fake.objectUrls,
      now: () => 500,
      getMyInfo: () => peanuts,
      getUserLanguage: () => "fr",
    });
    const done = engine.photo(image);
    expect(engine.getState().phase).toMatchObject({ kind: "reading", startedAt: 500, photo: { url: "blob:photo-1" } });
    expect(fake.reads[0].image).toBe(image);
    expect(fake.reads[0].input).toEqual({ userLanguage: "fr", myInfo: peanuts });

    fake.reads[0].resolve(menuCard);
    await done;
    expect(engine.getState().phase).toEqual({ kind: "idle", nextTurn: "you" });
    expect(engine.getState().messages).toMatchObject([{ speaker: "you", card: null, photo: { url: "blob:photo-1", card: menuCard } }]);
  });

  it("ignores a photo while someone is recording or translating", () => {
    const fake = photoService();
    const engine = new ConversationEngine({ service: fake.service, objectUrls: fake.objectUrls });
    engine.micTap("you");
    engine.photo(image);
    expect(engine.getState().phase).toMatchObject({ kind: "listening" });
    expect(fake.reads).toHaveLength(0);
  });

  it("a failed read keeps the photo, and retry reads the same image again", async () => {
    const fake = photoService();
    const engine = new ConversationEngine({ service: fake.service, objectUrls: fake.objectUrls });
    const first = engine.photo(image);
    fake.reads[0].reject(new Error("502"));
    await first;
    expect(engine.getState().phase).toMatchObject({ kind: "error", speaker: "you", reason: "network", photo: { url: "blob:photo-1" } });

    const again = engine.retry();
    expect(engine.getState().phase).toMatchObject({ kind: "reading", photo: { url: "blob:photo-1" } });
    expect(fake.reads[1].image).toBe(image);
    fake.reads[1].resolve(menuCard);
    await again;
    expect(engine.getState().messages).toHaveLength(1);
    expect(fake.revoked).toEqual([]);
  });

  it("gives up on a read that takes too long", async () => {
    vi.useFakeTimers();
    const fake = photoService();
    const engine = new ConversationEngine({ service: fake.service, objectUrls: fake.objectUrls, timeoutMs: 1000 });
    const done = engine.photo(image);
    await vi.advanceTimersByTimeAsync(1000);
    await done;
    expect(engine.getState().phase).toMatchObject({ kind: "error", reason: "network", photo: { url: "blob:photo-1" } });
  });

  it("fails as a network error when the service cannot read photos", async () => {
    const engine = new ConversationEngine({ service: controllableService().service, objectUrls: photoService().objectUrls });
    await engine.photo(image);
    expect(engine.getState().phase).toMatchObject({ kind: "error", reason: "network" });
  });

  it("dismissing a failed read drops the photo and frees its URL", async () => {
    const fake = photoService();
    const engine = new ConversationEngine({ service: fake.service, objectUrls: fake.objectUrls });
    const done = engine.photo(image);
    fake.reads[0].reject(new Error("502"));
    await done;
    engine.dismissError();
    expect(engine.getState().phase).toEqual({ kind: "idle", nextTurn: "you" });
    expect(engine.getState().messages).toEqual([]);
    expect(fake.revoked).toEqual(["blob:photo-1"]);
  });

  it("a new conversation drops photos, frees their URLs and ignores a late read", async () => {
    const fake = photoService();
    const engine = new ConversationEngine({ service: fake.service, objectUrls: fake.objectUrls });
    const first = engine.photo(image);
    fake.reads[0].resolve(menuCard);
    await first;
    const late = engine.photo(image);

    engine.newConversation();
    expect(engine.getState().messages).toEqual([]);
    expect(fake.revoked.sort()).toEqual(["blob:photo-1", "blob:photo-2"]);

    fake.reads[1].resolve(menuCard);
    await late;
    expect(engine.getState().messages).toEqual([]);
    expect(engine.getState().phase).toEqual({ kind: "idle", nextTurn: "you" });
  });
});

describe("mock photo reading", () => {
  it("returns a menu card with an item flagged for a peanut allergy", async () => {
    vi.useFakeTimers();
    const service = createMockTurnService({ readPhotoMs: 10 });
    const read = service.readPhoto!(image, { userLanguage: "en", myInfo: { allergies: ["peanuts"], spice: null, diet: [] } });
    await vi.advanceTimersByTimeAsync(10);
    const card = await read;
    expect(card.kind).toBe("menu");
    expect(card.items!.some((i) => /peanut/i.test(i.warning ?? ""))).toBe(true);
  });

  it("then cycles through a dish, a fruit and a sign, and back to the menu", async () => {
    const service = createMockTurnService({ readPhotoMs: 0 });
    const input = { userLanguage: "en", myInfo: { allergies: [], spice: null, diet: [] } };
    const kinds = [];
    for (let i = 0; i < 5; i++) kinds.push((await service.readPhoto!(image, input)).kind);
    expect(kinds).toEqual(["menu", "dish", "produce", "sign", "menu"]);
    service.reset!();
    expect((await service.readPhoto!(image, input)).kind).toBe("menu");
  });

  it("flags nothing when About you is empty", async () => {
    vi.useFakeTimers();
    const service = createMockTurnService({ readPhotoMs: 10 });
    const read = service.readPhoto!(image, { userLanguage: "en", myInfo: { allergies: [], spice: null, diet: [] } });
    await vi.advanceTimersByTimeAsync(10);
    expect((await read).items!.every((i) => !i.warning)).toBe(true);
  });
});
