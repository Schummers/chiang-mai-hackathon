import type { MyInfo, PhotoCard, Speaker, TranslateResult, TurnService } from "./types";

type ScriptTurn = { speaker: Speaker; raw: string; result: TranslateResult };

/** The Khao Soi exchange from the wireframes, replayed in order and then looped. Moves match what pickMove gives (engine.test.ts). */
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
      stage: "start",
      move: {
        id: "say-hello",
        type: "say",
        stage: "start",
        english: "Hello",
        centralThai: "สวัสดีครับ",
        khamMueang: "สะหวัดดีคับ",
        romanised: { central: "sa-wat-dee khrap", khamMueang: "sa-wat-dee khap" },
      },
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
      // The Allergy Flag wins: no Move on this Turn.
      stage: "explore",
      move: null,
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
      stage: "explore",
      move: {
        id: "ask-how-to-eat",
        type: "ask",
        stage: "explore",
        english: "How do you eat khao soi?",
        centralThai: "ข้าวซอย กินยังไงครับ",
        khamMueang: null,
        romanised: { central: "khao soi kin yang-ngai khrap", khamMueang: null },
      },
    },
  },
  {
    speaker: "vendor",
    raw: "ยี่สิบปีแล้วครับ เป็นร้านของแม่ผม ได้แล้วครับ",
    result: {
      translation: ["20 years now. It was my mother's stall.", "Here you go."],
      original: ["ยี่สิบปีแล้วครับ เป็นร้านของแม่ผม ได้แล้วครับ"],
      card: null,
      stage: "receive",
      move: {
        id: "say-delicious",
        type: "say",
        stage: "receive",
        english: "Delicious!",
        centralThai: "อร่อยครับ",
        khamMueang: "ลำคับ",
        romanised: { central: "a-roi khrap", khamMueang: "lam khap" },
      },
    },
  },
  {
    speaker: "you",
    raw: "mm so good. okay how much do I owe you?",
    result: {
      translation: ["อร่อยมากครับ", "เท่าไหร่ครับ"],
      original: ["So good!", "How much is it?"],
      romanised: ["a-ròi mâak kráp", "thâo-rài kráp"],
      card: null,
      stage: "pay",
      move: {
        id: "say-how-much-all",
        type: "say",
        stage: "pay",
        english: "How much for everything?",
        centralThai: "ทั้งหมดเท่าไหร่ครับ",
        khamMueang: "ตึงหมดนี่เต่าใดคับ",
        romanised: { central: "thang mot thao-rai khrap", khamMueang: "tueng mot nee tao dai khap" },
      },
    },
  },
  {
    // ซาว is Kham Mueang for 20: the Echo card explains it and invites the Visitor to say it back.
    speaker: "vendor",
    raw: "ซาวคับ",
    result: {
      translation: ["Twenty."],
      original: ["ซาวคับ"],
      card: null,
      stage: "pay",
      move: {
        id: "echo-sao",
        type: "echo",
        stage: "vendor-used-northern-word",
        english: "Vendor says a price with 'ซาว' (= 20) -> repeat it: 'Twenty baht!'",
        centralThai: "ยี่สิบบาทครับ",
        khamMueang: "ซาวบาทคับ",
        romanised: { central: "yee-sip baat khrap", khamMueang: "sao baat khap" },
        heard: "ซาว",
        heardMeaning: "20",
      },
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
    { name: "Khao Soi Gai", nameThai: "ข้าวซอยไก่", note: "Mild ok" },
    { name: "Gaeng Hang Lay", nameThai: "แกงฮังเล", note: "Local" },
    { name: "Nam Prik Ong", nameThai: "น้ำพริกอ่อง", note: "Local" },
    { name: "Sai Oua", nameThai: "ไส้อั่ว", note: "Local" },
    { name: "Khanom Jeen Nam Ngiao", nameThai: "ขนมจีนน้ำเงี้ยว", note: "Medium" },
    { name: "Laab Mueang", nameThai: "ลาบเมือง", note: "Hot" },
    { name: "Kaeng Khae", nameThai: "แกงแค", note: "Local" },
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

/** One fixture per other kind. After the menu, the mock cycles through them so every card can be seen. */
export const MOCK_PHOTO_CARDS: PhotoCard[] = [
  {
    kind: "dish",
    title: "Khao Soi",
    titleThai: "ข้าวซอย",
    description: "Curry noodle soup with coconut milk, crispy noodles on top.",
    meat: "Chicken",
    spice: 1,
    localDetail: "Locals squeeze in lime and stir in the chili paste to taste.",
  },
  {
    kind: "produce",
    title: "Longan",
    titleThai: "ลำไย",
    description: "Sweet, juicy, peel and eat. Chiang Mai's fruit.",
    localDetail: "In season July to September.",
  },
  {
    kind: "sign",
    title: "No shoes inside",
    titleThai: "กรุณาถอดรองเท้า",
    description: "Temple rule: leave your shoes at the steps.",
  },
];

/** Scripted answers to "Ask about this photo", one per card kind. */
const MOCK_ANSWERS: Record<PhotoCard["kind"], string> = {
  menu: "Khao Soi Gai is the local favourite and only a little spicy. Gaeng Hang Lay is often topped with peanuts: ask first.",
  dish: "Mild: the heat is in the chili paste on the side, so you add as much as you like.",
  produce: "Peel it with your thumb and eat the flesh, not the seed. A bag is usually 40 to 60 baht.",
  sign: "Yes: take your shoes off at the steps and leave them with the others.",
};

export type MockOptions = { transcribeMs?: number; translateMs?: number; readPhotoMs?: number; askPhotoMs?: number };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function turnFor(speaker: Speaker, index: number): ScriptTurn {
  const turns = KHAO_SOI_SCRIPT.filter((t) => t.speaker === speaker);
  return turns[index % turns.length];
}

/** Ignores the audio: returns the next scripted line for whoever is speaking. */
export function createMockTurnService({ transcribeMs = 800, translateMs = 1500, readPhotoMs = 2000, askPhotoMs = 1500 }: MockOptions = {}): TurnService {
  // Turns each side has completed, so a failed turn replays the same line on retry.
  const done: Record<Speaker, number> = { you: 0, vendor: 0 };
  let photos = 0;
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
      const n = photos++ % (MOCK_PHOTO_CARDS.length + 1);
      return n === 0 ? mockMenuCard(myInfo) : MOCK_PHOTO_CARDS[n - 1];
    },
    async askPhoto(_image, { card }) {
      await sleep(askPhotoMs);
      return MOCK_ANSWERS[card.kind];
    },
    reset() {
      done.you = 0;
      done.vendor = 0;
      photos = 0;
    },
  };
}
