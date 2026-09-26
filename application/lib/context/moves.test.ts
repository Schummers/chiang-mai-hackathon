import { describe, expect, it } from "vitest";
import { EMPTY_MY_INFO, type Message, type MoveCard, type Stage } from "@/lib/engine/types";
import { cardFor } from "./cards";
import { MOVES, pickMove, STAGES, stageFor, type Move } from "./moves";
import { systemPrompt, TURN_SCHEMA } from "./prompt";

const msg = (move?: Partial<MoveCard>): Message => ({
  id: Math.random().toString(36),
  speaker: "you",
  translation: ["x"],
  original: ["x"],
  card: null,
  ...(move && { move: move as MoveCard }),
});
const oneTurn = [msg()];
const none = { kind: "none" as const };

describe("moves data", () => {
  it("is built from people/jonathan/moves with stage instead of moment", () => {
    expect(MOVES).toHaveLength(45);
    for (const m of MOVES) {
      expect(m).not.toHaveProperty("moment");
      expect(m.centralThai).toHaveProperty("m");
      expect(m.centralThai).toHaveProperty("f");
      expect(typeof m.reviewed).toBe("boolean");
    }
    expect(MOVES.find((m) => m.id === "echo-sao")?.trigger).toContain("ซาว");
    expect(MOVES.find((m) => m.id === "ask-farang-spicy")?.tone).toBe("playful");
  });

  it("nothing is reviewed yet", () => {
    expect(MOVES.every((m) => !m.reviewed)).toBe(true);
  });
});

describe("stageFor", () => {
  it("the first Turn is always start", () => {
    expect(stageFor("pay", [])).toBe("start");
  });
  it("keeps the model's stage afterwards, and falls back to explore on garbage", () => {
    expect(stageFor("decide", oneTurn)).toBe("decide");
    expect(stageFor("nonsense", oneTurn)).toBe("explore");
    expect(stageFor(undefined, oneTurn)).toBe("explore");
  });
});

describe("pickMove, one per Stage", () => {
  const cases: [Stage, string][] = [
    ["start", "say-hello"],
    ["explore", "ask-made-yourself"],
    ["decide", "ask-favourite"],
    ["receive", "say-delicious"],
    ["pay", "say-how-much-all"],
    ["leave", "say-thank-you-very-much"],
  ];
  it.each(cases)("%s -> %s", (stage, id) => {
    const move = pickMove(stage, none, oneTurn);
    expect(move?.id).toBe(id);
    expect(move?.stage).toBe(stage);
  });

  it("prefers Ask over Say it from explore onward", () => {
    expect(pickMove("explore", none, oneTurn)?.type).toBe("ask");
    expect(pickMove("start", none, [])?.type).toBe("say");
  });

  it("prefers Say it over Ask at leave, so thank you comes first", () => {
    const allReviewed: Move[] = MOVES.map((m) => ({ ...m, reviewed: true }));
    const move = pickMove("leave", none, oneTurn, { moves: allReviewed, useReview: true });
    expect(move?.type).toBe("say");
    expect(move?.id).toBe("say-thank-you-very-much");
  });

  it("vendor-used-northern-word without a trigger word gives nothing", () => {
    expect(pickMove("vendor-used-northern-word", none, oneTurn, { raw: "ข้าวซอยครับ", speaker: "vendor" })).toBeNull();
  });

  it("only uses high confidence Moves while no review is in", () => {
    // pay has only medium Asks: the high Say it wins.
    expect(pickMove("pay", none, oneTurn)?.type).toBe("say");
    const reviewedOnly: Move[] = MOVES.map((m) => ({ ...m, reviewed: m.id === "ask-how-long-selling" }));
    expect(pickMove("pay", none, oneTurn, { moves: reviewedOnly, useReview: true })?.id).toBe("ask-how-long-selling");
  });
});

describe("pickMove, Echo", () => {
  it("echoes the Vendor's Northern word, whatever the stage", () => {
    const move = pickMove("pay", none, oneTurn, { raw: "ซาวบาทเจ้า", speaker: "vendor" });
    expect(move).toMatchObject({ id: "echo-sao", type: "echo", heard: "ซาว", khamMueang: "ซาวบาทคับ" });
  });

  it("says what the Vendor's word meant, from the Move's own note first", () => {
    expect(pickMove("pay", none, oneTurn, { raw: "ซาวบาทเจ้า", speaker: "vendor" })?.heardMeaning).toBe("20");
    expect(pickMove("pay", none, oneTurn, { raw: "สบายดีบ๋อ", speaker: "vendor" })?.heardMeaning).toBe("how are you?");
  });

  it("falls back to the pack for the meaning when the Move has no note", () => {
    // echo-yindee's English has no "(...)": the false friend ยินดี gives "thank you".
    expect(pickMove("pay", none, oneTurn, { raw: "ยินดีเจ้า", speaker: "vendor" })?.heardMeaning).toBe("thank you");
    // The note of echo-lam is about ลำก่อ ("is it good?"); ลำ alone means delicious.
    expect(pickMove("pay", none, oneTurn, { raw: "ลำขนาดเจ้า", speaker: "vendor" })?.heardMeaning).toBe("delicious");
  });

  it("never echoes the Visitor", () => {
    expect(pickMove("pay", none, oneTurn, { raw: "ซาวบาท", speaker: "you" })?.type).not.toBe("echo");
  });

  it("does not hear a trigger inside a dish or produce name", () => {
    // ลำ in ลำไย (longan), กาด in ผักกาดดอง
    const move = pickMove("explore", none, oneTurn, { raw: "ลำไยกับผักกาดดองครับ", speaker: "vendor" });
    expect(move?.type).not.toBe("echo");
  });
});

describe("pickMove, Echo hears whole words only", () => {
  const echo = (raw: string) => pickMove("explore", none, oneTurn, { raw, speaker: "vendor" });

  it.each([
    ["ลำขนาดเจ้า", "echo-lam", "ลำ"],
    ["ลำก่อ", "echo-lam", "ลำก่อ"],
    ["ลำก่อเจ้า", "echo-lam", "ลำก่อ"],
    ["ลำแต๊ๆ", "echo-lam", "ลำ"],
    ["ลำนัก", "echo-lam", "ลำ"],
    ["ลำๆ", "echo-lam", "ลำ"],
    ["อร่อยลำ", "echo-lam", "ลำ"],
    ["ซาวบาท", "echo-sao", "ซาว"],
    ["ซาวบาทเจ้า", "echo-sao", "ซาว"],
    ["ซาวห้า", "echo-sao", "ซาว"],
    ["ซาวห้าบาทเจ้า", "echo-sao", "ซาว"],
    ["หนึ่งร้อยซาวบาท", "echo-sao", "ซาว"],
    ["ยินดีเจ้า", "echo-yindee", "ยินดีเจ้า"],
    ["ยินดีจ๊าดนักเจ้า", "echo-yindee", "ยินดีจ๊าดนัก"],
    ["กาดหลวง", "echo-kad-luang", "กาดหลวง"],
    ["ไปกาดหลวงมาก่อ", "echo-kad-luang", "กาดหลวง"],
    ["ไปกาดก่อ", "echo-kad-luang", "กาด"],
    ["กิ๋นข้าวแล้วกาเจ้า", "echo-kin-khao", "กิ๋นข้าวแล้วกา"],
    ["สบายดีบ๋อ", "echo-sabai-di-bo", "สบายดีบ๋อ"],
    ["ข้าวนึ่งสองห่อ", "echo-khao-nueng", "ข้าวนึ่ง"],
  ])("hears %s -> %s (%s)", (raw, id, heard) => {
    expect(echo(raw)).toMatchObject({ id, type: "echo", heard });
  });

  it.each([
    "อยู่ลำพูน",
    "ลำบากเนาะ",
    "แม่ลำบากนะ",
    "ลำไยหวาน",
    "ลำใยหวาน",
    "ไปลำปาง",
    "ลำตัวใหญ่",
    "ลำก่อน",
    "ซาวด์ดัง",
    "ซาวน่าร้อน",
    "ผักกาดดอง",
    "หัวผักกาด",
    "ผักกาดขาว",
    "ยินดีต้อนรับ",
    "เจ้าของร้าน",
  ])("does not hear a trigger inside %s", (raw) => {
    expect(echo(raw)?.type).not.toBe("echo");
  });

  it("shows the trigger that matched, not the surrounding word", () => {
    expect(echo("ซาวบาท")).toMatchObject({ heard: "ซาว", heardMeaning: "20" });
  });
});

describe("pickMove, no repeat", () => {
  it("never offers a Move already shown in this conversation", () => {
    const history = [msg({ id: "say-hello" })];
    expect(pickMove("start", none, history)?.id).toBe("say-how-are-you");
  });

  it("returns null when every Move of the stage was shown", () => {
    const history = [msg({ id: "say-hello" }), msg({ id: "say-how-are-you" })];
    expect(pickMove("start", none, history)).toBeNull();
  });
});

describe("pickMove, Slot", () => {
  it("fills {dish} with the pack's Thai and romanised names", () => {
    const move = pickMove("explore", { kind: "dish", id: "khao-soi" }, oneTurn);
    expect(move).toMatchObject({
      id: "ask-how-to-eat",
      centralThai: "ข้าวซอย กินยังไงครับ",
      romanised: { central: "khao soi kin yang-ngai khrap", khamMueang: null },
      english: "How do you eat khao soi?",
    });
  });

  it("fills {produce} from a produce Mention", () => {
    const move = pickMove("explore", { kind: "produce", id: "mangosteen" }, oneTurn);
    expect(move?.id).toBe("ask-northern-name");
    expect(move?.centralThai).toMatch(/^มังคุด /);
  });

  it("skips a Move with a Slot when the Mention has no pack entry", () => {
    const shown = [msg({ id: "ask-made-yourself" }), msg({ id: "ask-what-family-eats" })];
    for (const mention of [none, { kind: "dish" as const, id: "made-up" }, { kind: "offguide" as const, name: "X" }]) {
      const move = pickMove("explore", mention, shown);
      expect(move?.centralThai ?? "").not.toMatch(/\{/);
      expect(["ask-how-to-eat", "ask-northern-name", "ask-where-from"]).not.toContain(move?.id);
    }
  });
});

describe("pickMove, particle", () => {
  it("returns the variant for My info's speaker, m by default", () => {
    expect(pickMove("start", none, [])?.centralThai).toBe("สวัสดีครับ");
    const f = pickMove("start", none, [], { particle: "f" });
    expect(f).toMatchObject({ centralThai: "สวัสดีค่ะ", khamMueang: "สะหวัดดีเจ้า", romanised: { khamMueang: "sa-wat-dee jao" } });
  });
});

describe("pickMove, allergy precedence", () => {
  it("gives no Move when the Turn carries an allergy or diet flag", () => {
    const peanuts = { ...EMPTY_MY_INFO, allergies: ["peanuts" as const] };
    const card = cardFor({ kind: "dish", id: "kaeng-hang-le" }, peanuts);
    expect(card?.warning).toBeTruthy();
    expect(pickMove("explore", { kind: "dish", id: "kaeng-hang-le" }, oneTurn, { card })).toBeNull();
  });

  it("still gives a Move next to a card without a flag", () => {
    const card = cardFor({ kind: "dish", id: "khao-soi" }, EMPTY_MY_INFO);
    expect(pickMove("explore", { kind: "dish", id: "khao-soi" }, oneTurn, { card })?.id).toBe("ask-how-to-eat");
  });
});

describe("prompt asks for the Stage", () => {
  it("lists every Stage in the system prompt and the schema, and says the first Turn is start", () => {
    const prompt = systemPrompt(9);
    for (const stage of STAGES) expect(prompt).toContain(stage);
    expect(prompt).toMatch(/first Turn of a conversation is always start/);
    expect([...TURN_SCHEMA.properties.stage.enum]).toEqual(STAGES);
    expect(TURN_SCHEMA.required).toContain("stage");
  });
});
