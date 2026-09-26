import type { Message, MyInfo, Speaker } from "@/lib/engine/types";
import { PACK, type Pack } from "./pack";

/** Words a food conversation is likely to meet; the rest of the glossary stays out of the prompt. */
const WORD_CATEGORIES = new Set(["greeting", "particle", "market", "question", "number", "food", "dish", "ingredient"]);

/** Stable part of the prompt (rules + catalog), identical for every Turn of a month so it can be cached. */
export function systemPrompt(month: number, pack: Pack = PACK): string {
  const dishes = pack.dishes
    .map((d) => `${d.id} | ${d.thai ?? ""}${d.thaiNorthern ? ` / ${d.thaiNorthern}` : ""} | ${d.name} | ${d.english} | ${d.ingredients.join(", ")}`)
    .join("\n");
  const produce = pack.produce
    .filter((p) => p.months.includes(month))
    .map((p) => `${p.id} | ${p.thai ?? ""}${p.thaiNorthern ? ` / ${p.thaiNorthern}` : ""} | ${p.english}`)
    .join("\n");
  const words = pack.words
    .filter((w) => WORD_CATEGORIES.has(w.category))
    .map((w) => `${w.thai} | ${w.roman} | ${w.english} | central: ${w.centralThai}`)
    .join("\n");
  const falseFriends = pack.falseFriends
    .map((f) => `${f.thai}: in the North means "${f.meaningHere}", in Central Thai "${f.meaningCentral}"`)
    .join("\n");

  return `You are the interpreter of U Mueang, a voice app for a conversation at a food stall or restaurant in Chiang Mai, Thailand, between a Visitor (a newcomer, speaking their own language) and a Vendor (Thai, often speaking Kham Mueang, the Northern Thai language). Place: ${pack.place.name} (${pack.place.thai}).

For each Turn you receive the raw transcript of what one side said, and you return JSON only.

When the Visitor speaks:
- They think out loud, hesitate and change their mind. Keep only what they finally mean. Drop fillers ("uh", "so", "like").
- Split it into short, clear questions or statements, one per item, in the order they said them. Usually 1 to 3 items.
- "original": each item cleaned up in the Visitor's language. "translation": the same items in polite, simple Central Thai that a market vendor reads at a glance (use ครับ by default). Never write full Kham Mueang sentences.
- If they mention an allergy, a spice preference or a diet, make sure it is in the Thai items, and report it in "detectedInfo".
- "romanised": each Thai item as simple syllables a Western tourist can read aloud, syllables joined by hyphens, words by spaces, tone marks on vowels (e.g. "a-ròi mâak kráp"). Same items, same order. Leave it empty when the Vendor speaks.

When the Vendor speaks:
- The transcript may be Central Thai, Kham Mueang or a mix, with Northern sound shifts (ค/ช/ท/พ often become ก/จ/ต/ป, ร often becomes ฮ, มะ- becomes บะ-). Read it with the glossary below; do not "correct" it.
- "original": what they said, in Thai, split into the same items. "translation": each item in the Visitor's language, natural and short.
- Prices: ซาว = 20 (ซาวห้า = 25). Always write prices in digits in both languages.

False friends (Northern meaning wins when the Vendor says them):
${falseFriends}

"mention": at most ONE thing named in this Turn, by either side, that the Visitor would want explained. Precedence: a dish that may conflict with My info, then any dish, then a Kham Mueang word from the glossary, then an in-season product.
- kind "dish" with the id from DISHES when the dish is in the list (match Thai, Northern or romanised names, and close spellings).
- kind "produce" with the id from PRODUCE.
- kind "word" with the Thai spelling from WORDS or FALSE FRIENDS, only when the Vendor used a Northern word or a false friend.
- kind "offguide" for a dish that is NOT in the list: give name (romanised), nameThai, a one-line description, and a warning only if it may conflict with My info.
- kind "none" when nothing fits. Silence is better than a generic card.
- For kind "dish", also give meat (main protein, short) and spice (0 none to 3 hot) from the ingredients.
- "warning": only when the dish may conflict with the Visitor's allergies or diet. One short sentence naming the risk. Never say a dish is safe.

"detectedInfo": only what the Visitor says about themselves in this Turn (allergies: peanuts, shellfish, gluten, other; spice: none, mild, thai-hot; diet: no-pork, vegetarian, halal). Empty otherwise.

"stage": where the conversation is after this Turn. One of: start (greetings, nothing chosen yet), explore (looking, asking what things are), decide (choosing, ordering, spice level), receive (the food is handed over or being eaten), pay (price, money, change), leave (thanks, goodbye), vendor-used-northern-word (the Vendor just used a Kham Mueang word from WORDS or FALSE FRIENDS, or a Northern price like ซาว). The first Turn of a conversation is always start.

Never name or guess anyone's ethnicity. Avoid politics, the monarchy and income in anything you add.

DISHES (id | Thai / Northern | name | English | ingredients):
${dishes}

PRODUCE in season this month (id | Thai / Northern | English):
${produce}

WORDS (Kham Mueang Thai | romanised | English | Central Thai):
${words}`;
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  fr: "French",
  de: "German",
  es: "Spanish",
  it: "Italian",
  zh: "Chinese",
};

export function languageName(code: string): string {
  return LANGUAGE_NAMES[code.split("-")[0]] ?? code;
}

/** Variable part: who speaks, My info, the last Turns and the transcript. */
export function turnPrompt(raw: string, speaker: Speaker, userLanguage: string, myInfo: MyInfo, history: Message[]): string {
  const info = [
    myInfo.allergies.length ? `allergies: ${myInfo.allergies.join(", ")}` : "",
    myInfo.spice ? `spice: ${myInfo.spice}` : "",
    myInfo.diet.length ? `diet: ${myInfo.diet.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("; ");
  const past = history
    .slice(-6)
    .map((m) => `${m.speaker === "you" ? "Visitor" : "Vendor"}: ${m.original.join(" / ")}`)
    .join("\n");
  const lang = languageName(userLanguage);
  const target =
    speaker === "you"
      ? `Write "original" in ${lang} and "translation" in Central Thai.`
      : `Write "original" in Thai and "translation" in ${lang}, not in English unless ${lang} is English.`;
  return `Visitor's language: ${lang}
My info: ${info || "nothing saved"}
Conversation so far:
${past || "(this is the first Turn)"}

Now speaking: ${speaker === "you" ? "the Visitor" : "the Vendor"}
Raw transcript: ${raw}

${target}`;
}

/** Gemini response schema (OpenAPI subset). */
export const TURN_SCHEMA = {
  type: "OBJECT",
  properties: {
    original: { type: "ARRAY", items: { type: "STRING" } },
    translation: { type: "ARRAY", items: { type: "STRING" } },
    romanised: { type: "ARRAY", items: { type: "STRING" } },
    mention: {
      type: "OBJECT",
      properties: {
        kind: { type: "STRING", enum: ["none", "dish", "produce", "word", "offguide"] },
        id: { type: "STRING" },
        name: { type: "STRING" },
        nameThai: { type: "STRING" },
        description: { type: "STRING" },
        meat: { type: "STRING" },
        spice: { type: "INTEGER" },
        warning: { type: "STRING" },
      },
      required: ["kind"],
    },
    detectedInfo: {
      type: "OBJECT",
      properties: {
        allergies: { type: "ARRAY", items: { type: "STRING", enum: ["peanuts", "shellfish", "gluten", "other"] } },
        spice: { type: "STRING", enum: ["none", "mild", "thai-hot"] },
        diet: { type: "ARRAY", items: { type: "STRING", enum: ["no-pork", "vegetarian", "halal"] } },
      },
    },
    stage: { type: "STRING", enum: ["start", "explore", "decide", "receive", "pay", "leave", "vendor-used-northern-word"] },
  },
  required: ["original", "translation", "mention", "stage"],
} as const;
