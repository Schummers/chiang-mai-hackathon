import { STAGES, type Message, type MyInfo, type NearbyPlace, type Speaker, type Stage, type TurnContext } from "@/lib/engine/types";
import { PACK, type Pack } from "./pack";

/** Words a food conversation is likely to meet; the rest of the glossary stays out of the prompt. */
const WORD_CATEGORIES = new Set(["greeting", "particle", "market", "question", "number", "food", "dish", "ingredient"]);

/** What each Stage means, for the model. Typed on Stage so a new Stage cannot be left out. */
const STAGE_MEANING: Record<Stage, string> = {
  start: "greetings, nothing chosen yet",
  explore: "looking, asking what things are",
  decide: "choosing, ordering, spice level",
  receive: "the food is handed over or being eaten",
  pay: "price, money, change",
  leave: "thanks, goodbye",
  "vendor-used-northern-word": "the Vendor just used a Kham Mueang word from WORDS or FALSE FRIENDS, or a Northern price like ซาว",
};
const stageList = STAGES.map((s) => `${s} (${STAGE_MEANING[s]})`).join(", ");

export type PromptOptions = {
  /** Include the Northern Thai Context Pack. Default on. */
  pack?: boolean;
  /** Ask for context cards. Default on. */
  cards?: boolean;
};

function packSections(month: number, pack: Pack): string {
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
  return `# Northern Thai guide

Curated local knowledge. Prefer it over your general knowledge when they disagree.

FALSE FRIENDS (the Northern meaning wins when the Vendor says them):
${falseFriends}

DISHES (id | Thai / Northern | name | English | ingredients):
${dishes}

PRODUCE in season this month (id | Thai / Northern | English):
${produce}

WORDS (Kham Mueang Thai | romanised | English | Central Thai):
${words}`;
}

const CARD_RULES = `"cards": context cards shown under this Turn, to the Visitor only. They are never read to the Vendor and are not part of the translation.
- Safety first: when anything said in this Turn may clash with the Visitor's allergies, diet or notes, the first card is about that risk, and its suggestion asks the Vendor to confirm. Think about ambiguous Thai words: ถั่ว can be peanuts, other nuts or beans (in curries and noodle toppings it is usually peanuts); กะปิ is shrimp paste; น้ำปลา fish sauce; ปลาร้า fermented fish; เลือด blood; many Northern curries and nam phrik hide pork, shrimp paste or fish. When a word is ambiguous, say so; never guess which meaning is the safe one. Say it is a risk to check, never that something is safe.
- Otherwise, write one when something said in this Turn, by either side, would puzzle a newcomer or help them decide: a local dish, a Northern vegetable, herb or ingredient, a Kham Mueang word, a custom, how something is eaten, a price convention.
- Usually 0 or 1, at most 2. Never repeat a card already shown in the conversation. Skip the obvious (rice, chicken, water, thank you). Silence beats a generic card.
- "heading": the thing's name in the Visitor's language, Latin script for Thai names (e.g. "Khao Soi", "Pak Waan"), or the risk (e.g. "Nuts in the hang le"). "headingThai": its Thai spelling.
- "body": exactly 2 short sentences in the Visitor's language, 30 words at most in total. First what it is, then why it matters to this Visitor right now (taste, spice, how locals eat it, what to check).
- "suggestion": one short thing the Visitor could say next to the Vendor about it, in the Visitor's language, first person, natural speech (e.g. "Can you tell me more about the khao soi?", "Which nuts are in it? I'm allergic to cashews.").`;

/** Stable part of the prompt (rules + guide), identical for every Turn with the same month and options, so it is cached. */
export function systemPrompt(month: number, { pack: withPack = true, cards = true }: PromptOptions = {}, pack: Pack = PACK): string {
  const guide = withPack ? "the Northern Thai guide below" : "your knowledge of Northern Thai";
  return `You are the interpreter of U Mueang, a voice app for a conversation at a food stall, market or restaurant in Chiang Mai, Thailand, between a Visitor (a newcomer, speaking their own language) and a Vendor (Thai, often speaking Kham Mueang, the Northern Thai language). Place: ${pack.place.name} (${pack.place.thai}).

For each Turn you receive the raw transcript of what one side said, plus context the phone gathered, and you answer by calling the submit_turn tool.

# The transcript
It comes from the browser's speech recognition. The Vendor side uses a Central Thai model that does not know Kham Mueang: expect misheard or split words, near-homophones and dropped tones, especially for Northern dishes, vegetables and herbs. Recover the most plausible meaning from ${guide}, the conversation so far and the context. Never translate a mishearing literally when a local word fits the sounds.

# When the Visitor speaks
- They think out loud, hesitate and change their mind. Keep only what they finally mean. Drop fillers ("uh", "so", "like").
- Split it into short, clear questions or statements, one per item, in the order they said them. Usually 1 to 3 items.
- "original": each item cleaned up in the Visitor's language. "translation": the same items in polite, simple Central Thai that a market vendor reads at a glance (use ครับ by default). Never write full Kham Mueang sentences.
- Translate only what they said. Never add things from the context they did not say.
- If they mention an allergy, a spice preference or a diet, make sure it is in the Thai items, and report it in "detectedInfo".
- "romanised": each Thai item as simple syllables a Western tourist can read aloud, syllables joined by hyphens, words by spaces, tone marks on vowels (e.g. "a-ròi mâak kráp"). Same items, same order. Leave it empty when the Vendor speaks.

# When the Vendor speaks
- The transcript may be Central Thai, Kham Mueang or a mix, with Northern sound shifts (ค/ช/ท/พ often become ก/จ/ต/ป, ร often becomes ฮ, มะ- becomes บะ-). Read it as Northern Thai first; do not "correct" it into Central Thai.
- "original": what they said, in Thai, split into the same items. "translation": each item in the Visitor's language, natural and short. Keep local dish and ingredient names romanised (e.g. "khao soi"), with a 1 to 3 word gloss the first time if it helps.
- Prices: ซาว = 20 (ซาวห้า = 25). Always write prices in digits in both languages.

# Context
The Turn comes with context blocks: the Visitor's own notes, the food places around the phone, and the local time. Each block says what it is. Use them to understand and translate better (which dishes are likely, what a misheard word probably was, what matters to the Visitor), and to choose cards. They are background, not speech: never translate them or put them in the translation.

${cards ? `${CARD_RULES}\n\n` : ""}# Other fields
"mention": at most ONE thing named in this Turn, by either side. Precedence: a dish that may conflict with My info, then any dish, then a Kham Mueang word from the glossary, then an in-season product.
- kind "dish" with the id from DISHES when the dish is in the list (match Thai, Northern or romanised names, and close spellings).
- kind "produce" with the id from PRODUCE.
- kind "word" with the Thai spelling from WORDS or FALSE FRIENDS, only when the Vendor used a Northern word or a false friend.
- kind "offguide" for a dish that is NOT in the list: give name (romanised), nameThai, a one-line description, and a warning only if it may conflict with My info.
- kind "none" when nothing fits.
- For kind "dish", also give meat (main protein, short) and spice (0 none to 3 hot) from the ingredients.
- "warning": only when the dish may conflict with the Visitor's allergies or diet. One short sentence naming the risk. Never say a dish is safe.

"detectedInfo": only what the Visitor says about themselves in this Turn (allergies: peanuts, shellfish, gluten, other; spice: none, mild, thai-hot; diet: no-pork, vegetarian, halal). Empty otherwise.

"stage": where the conversation is after this Turn. One of: ${stageList}. The first Turn of a conversation is always start.

Never name or guess anyone's ethnicity. Avoid politics, the monarchy and income in anything you add.

${withPack ? packSections(month, pack) : "# Northern Thai guide\n(off: DISHES, PRODUCE, WORDS and FALSE FRIENDS are empty, use kind \"offguide\" or \"none\" for mentions)"}`;
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

function placeLine(p: NearbyPlace, i: number): string {
  const facts = [
    p.type,
    `${p.distanceM} m away`,
    p.rating !== undefined ? `${p.rating}★${p.ratingCount ? ` (${p.ratingCount})` : ""}` : "",
    p.price,
    p.openNow === false ? "Google says closed now" : "",
  ].filter(Boolean);
  return `${i + 1}. ${p.name}: ${facts.join(", ")}${p.summary ? `. ${p.summary}` : ""}`;
}

function timeOfDay(hour: number): string {
  if (hour < 5) return "night";
  if (hour < 11) return "morning";
  if (hour < 14) return "lunchtime";
  if (hour < 17) return "afternoon";
  if (hour < 22) return "evening";
  return "night";
}

/** Local date and time of the phone, e.g. "Sunday 27 September 2026, 10:12 (Asia/Bangkok), morning". */
export function localTime(now: string, timeZone: string): { text: string; month: number } | null {
  const date = new Date(now);
  if (Number.isNaN(date.getTime())) return null;
  let zone = timeZone;
  try {
    new Intl.DateTimeFormat("en", { timeZone: zone });
  } catch {
    zone = "Asia/Bangkok";
  }
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: zone,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  const month = Number(new Intl.DateTimeFormat("en", { timeZone: zone, month: "numeric" }).format(date));
  return {
    text: `${parts.weekday} ${parts.day} ${parts.month} ${parts.year}, ${parts.hour}:${parts.minute} (${zone}), ${timeOfDay(Number(parts.hour))}`,
    month,
  };
}

/** The context blocks of a Turn, each introduced by what it is and how to use it. Empty when there is none. */
export function contextBlocks(context: TurnContext | undefined): string {
  const blocks: string[] = [];
  const notes = context?.notes?.trim();
  if (notes) {
    blocks.push(`<visitor_notes>
The Visitor typed these notes in the app as optional extra context. They may name an allergy or diet not in My info, what they are looking for, or, if the phone belongs to a vendor, today's menu and specials. Keep them in mind: use them to recognise words, spell dishes, weigh risks and choose cards. Do not translate the notes themselves.
"""
${notes}
"""
</visitor_notes>`);
  }

  const places = context?.places;
  if (places && (places.food.length || places.markets.length)) {
    const food = places.food.length ? `Food places within about ${Math.max(75, places.accuracyM)} m, nearest first:\n${places.food.map(placeLine).join("\n")}` : "";
    const markets = places.markets.length
      ? `Markets and food courts nearby, nearest first (a phone within ~150 m of one may well be inside it, at one of its stalls):\n${places.markets.map(placeLine).join("\n")}`
      : "";
    blocks.push(`<nearby_places>
From the phone's GPS (accurate to about ${places.accuracyM} m) and Google Maps. The conversation is possibly happening at one of these places, or at a stall Google does not list. Use their names and types to expect the likely dishes and vocabulary and to resolve misheard words. It is a hint, not a fact: do not assume a place for certain and never mention it in the translation.
${[food, markets].filter(Boolean).join("\n\n")}
</nearby_places>`);
  }

  const time = context?.device && localTime(context.device.now, context.device.timeZone);
  if (time) {
    blocks.push(`<local_time>
${time.text}. Use it for what is likely on sale (morning market, lunch, night market) and for greetings.
</local_time>`);
  }
  return blocks.join("\n\n");
}

function historyLine(m: Message): string {
  const who = m.speaker === "you" ? "Visitor" : "Vendor";
  const said = m.original.join(" / ");
  const meant = m.translation.join(" / ");
  const cards = (m.cards ?? []).map((c) => `\n  [context card shown to the Visitor: ${c.heading}: ${c.body}]`).join("");
  return `${who}: ${said}${meant && meant !== said ? ` (→ ${meant})` : ""}${cards}`;
}

/** Variable part: context, who speaks, My info, the last Turns and the transcript. */
export function turnPrompt(
  raw: string,
  speaker: Speaker,
  userLanguage: string,
  myInfo: MyInfo,
  history: Message[],
  context?: TurnContext,
): string {
  const info = [
    myInfo.allergies.length ? `allergies: ${myInfo.allergies.join(", ")}` : "",
    myInfo.spice ? `spice: ${myInfo.spice}` : "",
    myInfo.diet.length ? `diet: ${myInfo.diet.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("; ");
  const past = history.slice(-8).map(historyLine).join("\n");
  const lang = languageName(userLanguage);
  const target =
    speaker === "you"
      ? `Write "original" in ${lang} and "translation" in Central Thai.`
      : `Write "original" in Thai and "translation" in ${lang}, not in English unless ${lang} is English.`;
  const blocks = contextBlocks(context);
  return `${blocks ? `${blocks}\n\n` : ""}Visitor's language: ${lang}
My info: ${info || "nothing saved"}
Conversation so far:
${past || "(this is the first Turn)"}

Now speaking: ${speaker === "you" ? "the Visitor" : "the Vendor"}
Raw transcript: ${raw}

${target} Cards, if any, in ${lang}.`;
}

/** JSON schema of the submit_turn tool input. */
export const TURN_SCHEMA = {
  type: "object",
  properties: {
    original: { type: "array", items: { type: "string" } },
    translation: { type: "array", items: { type: "string" } },
    romanised: { type: "array", items: { type: "string" } },
    cards: {
      type: "array",
      maxItems: 2,
      items: {
        type: "object",
        properties: {
          heading: { type: "string" },
          headingThai: { type: "string" },
          body: { type: "string" },
          suggestion: { type: "string" },
        },
        required: ["heading", "body", "suggestion"],
      },
    },
    mention: {
      type: "object",
      properties: {
        kind: { type: "string", enum: ["none", "dish", "produce", "word", "offguide"] },
        id: { type: "string" },
        name: { type: "string" },
        nameThai: { type: "string" },
        description: { type: "string" },
        meat: { type: "string" },
        spice: { type: "integer" },
        warning: { type: "string" },
      },
      required: ["kind"],
    },
    detectedInfo: {
      type: "object",
      properties: {
        allergies: { type: "array", items: { type: "string", enum: ["peanuts", "shellfish", "gluten", "other"] } },
        spice: { type: "string", enum: ["none", "mild", "thai-hot"] },
        diet: { type: "array", items: { type: "string", enum: ["no-pork", "vegetarian", "halal"] } },
      },
    },
    stage: { type: "string", enum: STAGES },
  },
  required: ["original", "translation", "cards", "mention", "stage"],
} as const;

/** The tool the model must call. Without cards, the field is dropped from the schema. */
export function turnTool(cards: boolean) {
  if (cards) return { name: "submit_turn", description: "Submit the translated Turn.", input_schema: TURN_SCHEMA };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { cards: _cards, ...properties } = TURN_SCHEMA.properties;
  return {
    name: "submit_turn",
    description: "Submit the translated Turn.",
    input_schema: { ...TURN_SCHEMA, properties, required: TURN_SCHEMA.required.filter((r) => r !== "cards") },
  };
}
