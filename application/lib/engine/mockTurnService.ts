import type { MyInfo, PhotoCard, Speaker, TranslateResult, TurnService } from "./types";

type ScriptTurn = { speaker: Speaker; raw: string; result: TranslateResult };

/** The Khao Soi exchange from the wireframes, replayed in order and then looped. */
export const KHAO_SOI_SCRIPT: ScriptTurn[] = [
  {
    speaker: "you",
    raw: "uh so this one, the yellow soup in the big bowl, what is it… is it like spicy? oh and I'm allergic to peanuts so…",
    result: {
      translation: ["จานนี้คืออะไรครับ", "เผ็ดไหมครับ", "ผมแพ้ถั่วลิสง มีถั่วลิสงไหมครับ"],
      original: ["What is this dish?", "Is it spicy?", "I'm allergic to peanuts: is there any in it?"],
      romanised: ["jaan níi kuu à-rai kráp", "phèt mǎi kráp", "phǒm pháe thùa-lí-sǒng, mii thùa-lí-sǒng mǎi kráp"],
      card: null,
      detectedInfo: { allergies: ["peanuts"] },
    },
  },
  {
    speaker: "vendor",
    raw: "ข้าวซอยไก่ครับ เผ็ดนิดหน่อย ไม่มีถั่วลิสงครับ",
    result: {
      translation: ["Chicken khao soi", "A little spicy", "No peanuts"],
      original: ["ข้าวซอยไก่ครับ เผ็ดนิดหน่อย ไม่มีถั่วลิสงครับ"],
      card: {
        name: "Khao Soi",
        nameThai: "ข้าวซอย",
        description:
          "Curry noodle soup with coconut milk, a Chiang Mai signature. Crispy noodles on top, pickled mustard greens and shallots on the side.",
        meat: "Chicken",
        spice: 1,
        localDetail: "Locals squeeze in lime and stir in the chili paste to taste.",
        warning: "The vendor says no peanuts. Toppings vary between stalls: double-check the chili paste.",
      },
    },
  },
  {
    speaker: "you",
    raw: "okay great, and um… how long have you had this stall? like, is it yours?",
    result: {
      translation: ["ร้านนี้เปิดมานานแค่ไหนแล้วครับ"],
      original: ["How long have you had this stall?"],
      romanised: ["ráan níi pòet maa naan kâe nǎi láew kráp"],
      card: null,
    },
  },
  {
    speaker: "vendor",
    raw: "ยี่สิบปีแล้วครับ เป็นร้านของแม่ผม",
    result: {
      translation: ["20 years now. It was my mother's stall."],
      original: ["ยี่สิบปีแล้วครับ เป็นร้านของแม่ผม"],
      card: null,
    },
  },
];

/** The menu the mock "reads" from any photo. Warnings are added from My info by `mockMenuCard`. */
const MOCK_MENU: PhotoCard = {
  kind: "menu",
  title: "Northern noodle stall menu",
  titleThai: "ร้านข้าวซอย",
  description: "A handwritten menu of Chiang Mai classics, noodles and curries.",
  items: [
    { name: "Khao Soi Gai", nameThai: "ข้าวซอยไก่", note: "Chicken curry noodle soup, a little spicy" },
    { name: "Gaeng Hang Lay", nameThai: "แกงฮังเล", note: "Slow-cooked pork curry, sweet and mild" },
    { name: "Nam Prik Ong", nameThai: "น้ำพริกอ่อง", note: "Pork and tomato chili dip with vegetables" },
    { name: "Sai Oua", nameThai: "ไส้อั่ว", note: "Grilled herb sausage, pork" },
  ],
};

/** Gaeng Hang Lay is often finished with peanuts: flag it when My info says peanuts. */
export function mockMenuCard(myInfo: MyInfo): PhotoCard {
  const peanuts = myInfo.allergies.includes("peanuts");
  return {
    ...MOCK_MENU,
    items: MOCK_MENU.items!.map((item) =>
      peanuts && item.name === "Gaeng Hang Lay" ? { ...item, warning: "Often topped with peanuts: ask the vendor." } : item,
    ),
  };
}

export type MockOptions = { transcribeMs?: number; translateMs?: number; readPhotoMs?: number };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function turnFor(speaker: Speaker, index: number): ScriptTurn {
  const turns = KHAO_SOI_SCRIPT.filter((t) => t.speaker === speaker);
  return turns[index % turns.length];
}

/** Ignores the audio: returns the next scripted line for whoever is speaking. */
export function createMockTurnService({ transcribeMs = 800, translateMs = 1500, readPhotoMs = 2000 }: MockOptions = {}): TurnService {
  // Turns each side has completed, so a failed turn replays the same line on retry.
  const done: Record<Speaker, number> = { you: 0, vendor: 0 };
  return {
    async transcribe(_audio, language) {
      const speaker: Speaker = language === "th" ? "vendor" : "you";
      await sleep(transcribeMs);
      return turnFor(speaker, done[speaker]).raw;
    },
    async translate({ speaker, history }) {
      await sleep(translateMs);
      const index = history.filter((m) => m.speaker === speaker).length;
      done[speaker] = index + 1;
      return turnFor(speaker, index).result;
    },
    async readPhoto(_image, { myInfo }) {
      await sleep(readPhotoMs);
      return mockMenuCard(myInfo);
    },
    reset() {
      done.you = 0;
      done.vendor = 0;
    },
  };
}
