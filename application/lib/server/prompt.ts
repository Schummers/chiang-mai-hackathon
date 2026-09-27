import { PACK, type Pack } from "@/lib/context/pack";
import type { HistoryTurn, Languages, NearbyPlace, NearbyPlaces, Side, TranslateOptions, TurnContext } from "@/lib/engine/types";
import { findLanguage } from "@/lib/language";
import { ALLERGIES, DIETS, SPICES } from "@/lib/myInfo";

const nameOf = (code: string) => findLanguage(code).english;

// ---------------------------------------------------------------------------------------------------------------
// System prompt: identical for every Turn with the same options, so Anthropic caches it.
// ---------------------------------------------------------------------------------------------------------------

const ROLE = `You are the interpreter inside U Mueang, a voice translation app used face to face in Chiang Mai, Thailand. For now it is mostly used at food stalls, markets and restaurants. Two people share one phone:
- the OWNER, who set the app up. The owner may be a visitor (often English-speaking) or a local shopkeeper (Thai-speaking).
- the OTHER person, across the counter.
Each Turn, one of them speaks. You receive what the browser's speech-to-text heard, plus context, and you answer by calling the submit_turn tool.

Your job, in order:
1. Correct the transcript into what the speaker most plausibly said.
2. Translate that into the listener's language.
3. Optionally, write context cards for the owner.`;

const CORRECTION = `# 1. Correct the transcript
The transcript is a noisy phonetic guess, not ground truth.

Thai speech is recognised by a Central Thai (th-TH) model that does not know Kham Mueang (Northern Thai, the everyday language of Chiang Mai vendors). Expect:
- Northern words replaced by the nearest-sounding Central Thai words, or by nonsense. This is worst for local dishes, vegetables, herbs and prices.
- Northern sound shifts: Central ช/ช่ often heard as จ or ซ; ค/ท/พ where the North has ก/ต/ป (unaspirated); ร often pronounced ฮ or ล; Central ย- words may appear as ญ/nasal ย; มะ- fruit names as บะ- (บะม่วง = มะม่วง).
- Common Northern function words misheard: บ่ ("not", Central ไม่) as บอ / บ่อ / บอก; เจ้า (polite particle) as จ้าว / เจา; ก่อ (question particle) as กอ / ก็; ละอ่อน, เปิ้น, ตั๋ว (pronouns) as unrelated words. Spell them correctly in "original".
- Words split or merged, tones lost, numbers written out as words.
Other languages (English etc.) are recognised by that language's model. Expect Thai dish names mangled into English homophones ("cow soy", "cow sore" = khao soi; "sigh ooah" = sai ua), fillers, false starts and self-corrections.

Rules:
- Rebuild the most plausible utterance from the sounds, the Northern Thai guide, the setting, the context blocks and the conversation so far. A known local word that fits the sounds beats a literal reading of a mishearing.
- Keep the speaker's own language and dialect. If a Thai speaker used Kham Mueang, write it in Kham Mueang spelling; do not rewrite it as Central Thai.
- Remove fillers ("um", "uh", "like", เอ่อ, อ่า) and resolve self-corrections ("no peanuts, actually no, no shrimp paste") to what the speaker finally meant. Neither the original nor the translation should contain them.
- Never add content. If part of it is unrecoverable, keep what you can and mark the gap with […].
- "original": the corrected utterance, in the speaker's language.`;

const TRANSLATION = `# 2. Translate
- Translate only what was said, in the speaker's own voice: "I" stays "I" (never "the customer…" or "they say…"). Context blocks help you understand; they are never speech, never translate them or add facts from them.
- Into Thai: polite, simple Central Thai that a market vendor reads at a glance. Never write whole Kham Mueang sentences. When the owner speaks, end with ครับ or ค่ะ according to the owner's particle. When the other person speaks, their gender is unknown: prefer natural polite phrasing without ครับ/ค่ะ (e.g. นะ, or no particle).
- From Thai: natural and short. Keep local dish and ingredient names romanised (e.g. "khao soi", "phak waan"), with a 1-3 word gloss the first time it helps.
- Prices: always digits in both languages. Northern ซาว = 20 (ซาวห้า = 25).
- "translation": the translation, in the listener's language.`;

const CARDS = `# 3. Context cards
Cards appear under the Turn, for the owner only, in the owner's language. They are never read to the other person and are not part of the translation.
- Write one only when something said in this Turn, by either side, is worth a word of explanation to the owner, or helps them decide or act. Examples: a local dish, a Northern vegetable, herb or ingredient, a Kham Mueang word, a custom, a price convention, how something is eaten.
- Also write one when something may clash with the owner's allergies, diet or notes. Say it is a risk to check, never that something is safe. If the owner is a shopkeeper and the customer mentions an allergy or diet, flag which of the owner's dishes (from their notes) may be affected.
- Usually 0 or 1, at most 2. Never repeat a card heading already shown in the conversation. Skip the obvious (rice, water, thank you). No card beats a generic one.
- "heading": the thing's name, short, in the owner's language. Use Latin script for Thai names when the owner does not read Thai (e.g. "Khao Soi").
- "headingThai": the Thai spelling when the heading is a Thai term and the owner does not read Thai; otherwise an empty string.
- "body": exactly 2 short sentences, at most 35 words in total, in the owner's language. First what it is, then why it matters right now.
- "suggestion": one short follow-up the owner could say to the other person, in the owner's language, first person, natural speech (e.g. "Can you tell me more about the khao soi?", "Is there shrimp paste in it?").`;

const CONTEXT = `# Context blocks
The Turn comes with tagged blocks. Each block starts by saying what it is and how reliable it is. Use them to resolve misheard words, spell names, weigh risks and choose cards. Never mention them in the translation.

Never name or guess anyone's ethnicity. Avoid politics, the monarchy and income in anything you add.`;

function guide(pack: Pack): string {
  const dishes = pack.dishes
    .map((d) => `${d.thai ?? ""}${d.thaiNorthern ? ` / ${d.thaiNorthern}` : ""} | ${d.name} | ${d.english} | ${d.ingredients.join(", ")}`)
    .join("\n");
  const produce = pack.produce
    .map((p) => `${p.thai ?? ""}${p.thaiNorthern ? ` / ${p.thaiNorthern}` : ""} | ${p.name} | ${p.english} | months ${p.months.join(",")}`)
    .join("\n");
  const words = pack.words.map((w) => `${w.thai} | ${w.roman} | ${w.english} | central: ${w.centralThai}`).join("\n");
  const falseFriends = pack.falseFriends
    .map((f) => `${f.thai}: in the North "${f.meaningHere}", in Central Thai "${f.meaningCentral}"`)
    .join("\n");
  return `# Northern Thai guide
Curated local knowledge from the team. Prefer it over your general knowledge when they disagree. It is not exhaustive: use your own knowledge of Northern Thai food and Kham Mueang for anything missing.

FALSE FRIENDS (the Northern meaning wins when a Northern speaker says them):
${falseFriends}

DISHES (Thai / Northern | romanised | English | ingredients):
${dishes}

PRODUCE (Thai / Northern | romanised | English | months in season):
${produce}

KHAM MUEANG WORDS (Northern | romanised | English | Central Thai):
${words}`;
}

export function systemPrompt({ cards, pack }: TranslateOptions, data: Pack = PACK): string {
  return [ROLE, CORRECTION, TRANSLATION, cards ? CARDS : "", CONTEXT, pack ? guide(data) : ""].filter(Boolean).join("\n\n");
}

// ---------------------------------------------------------------------------------------------------------------
// Turn prompt: the context blocks, the conversation and the transcript.
// ---------------------------------------------------------------------------------------------------------------

function timeOfDay(hour: number): string {
  if (hour < 5) return "night";
  if (hour < 11) return "morning";
  if (hour < 14) return "lunchtime";
  if (hour < 17) return "afternoon";
  if (hour < 22) return "evening";
  return "night";
}

/** Local date and time, e.g. "Sunday 27 September 2026, 10:12 (Asia/Bangkok), morning". Null on a bad timestamp. */
export function localTime(now: string, timeZone: string): { text: string; month: number; date: string } | null {
  const at = new Date(now);
  if (Number.isNaN(at.getTime())) return null;
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
      .formatToParts(at)
      .map((p) => [p.type, p.value]),
  );
  const iso = new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).format(at);
  return {
    text: `${parts.weekday} ${parts.day} ${parts.month} ${parts.year}, ${parts.hour}:${parts.minute} (${zone}), ${timeOfDay(Number(parts.hour))}`,
    month: Number(iso.slice(5, 7)),
    date: iso,
  };
}

const DAY_MS = 86_400_000;

/** Season line and festivals within two weeks of `date` (YYYY-MM-DD), from the pack. */
function seasonal(month: number, date: string, pack: Pack): string {
  const m = pack.months.find((x) => x.month === month);
  const day = Date.parse(date);
  const festivals = pack.festivals
    .filter((f) => Date.parse(f.end ?? f.start) >= day - DAY_MS && Date.parse(f.start) <= day + 14 * DAY_MS)
    .map((f) => `${f.name} (${f.thai}), ${f.start}${f.end && f.end !== f.start ? ` to ${f.end}` : ""}`);
  return [
    m ? `This month in Chiang Mai: ${m.season} season, ${m.talk}` : "",
    festivals.length ? `Festivals now or soon: ${festivals.join("; ")}.` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function placeLine(p: NearbyPlace, i: number): string {
  const facts = [
    p.type,
    `${p.distanceM} m away`,
    p.rating !== undefined ? `${p.rating}★${p.ratingCount ? ` (${p.ratingCount} reviews)` : ""}` : "",
    p.price,
    p.openNow === false ? "Google says closed now" : "",
  ].filter(Boolean);
  return `${i + 1}. ${p.name}: ${facts.join(", ")}${p.summary ? `. ${p.summary}` : ""}`;
}

function placesBlock(places: NearbyPlaces): string {
  const food = places.food.length ? `Food places, nearest first:\n${places.food.map(placeLine).join("\n")}` : "";
  const markets = places.markets.length
    ? `Markets and food courts, nearest first (the phone may be inside one even a few hundred metres from its pin, at one of its stalls):\n${places.markets.map(placeLine).join("\n")}`
    : "";
  return `<nearby_places>
From the phone's GPS (accurate to about ${places.accuracyM} m) and Google Maps. The conversation is possibly happening at one of these places, or at a stall Google does not list. Use their names and types to expect likely dishes and vocabulary and to resolve misheard words. A hint, not a fact.
${[food, markets].filter(Boolean).join("\n\n")}
</nearby_places>`;
}

function profileBlock(profile: NonNullable<TurnContext["profile"]>): string | null {
  const facts = [
    profile.allergies.length ? `Allergies: ${profile.allergies.map((a) => ALLERGIES.find((x) => x.value === a)?.label ?? a).join(", ")}.` : "",
    profile.spice ? `Spice: ${SPICES.find((s) => s.value === profile.spice)?.label ?? profile.spice}.` : "",
    profile.diet.length ? `Diet: ${profile.diet.map((d) => DIETS.find((x) => x.value === d)?.label ?? d).join(", ")}.` : "",
  ].filter(Boolean);
  if (!facts.length) return null;
  return `<owner_profile>
Picked by the owner in the app. Keep it in mind when correcting and translating, and use it to flag risks in cards.
${facts.join("\n")}
</owner_profile>`;
}

const who = (side: Side) => (side === "me" ? "Owner" : "Other");

function historyBlock(history: HistoryTurn[], languages: Languages): string {
  if (!history.length) return "<conversation>\n(this is the first Turn)\n</conversation>";
  const lines = history.map((t) => {
    const from = nameOf(languages[t.side]);
    const to = nameOf(languages[t.side === "me" ? "them" : "me"]);
    const cards = (t.cards ?? []).map((c) => `\n  [card shown to the owner: ${c.heading}]`).join("");
    return `${who(t.side)} (${from}): ${t.original}\n  → ${to}: ${t.translation}${cards}`;
  });
  return `<conversation>
The conversation so far, oldest first, already corrected.
${lines.join("\n")}
</conversation>`;
}

export type TurnPromptInput = {
  side: Side;
  heard: string;
  languages: Languages;
  history: HistoryTurn[];
  context: TurnContext;
  options: TranslateOptions;
  particle: "m" | "f";
};

export function turnPrompt({ side, heard, languages, history, context, options, particle }: TurnPromptInput, pack: Pack = PACK): string {
  const blocks: string[] = [];

  if (context.profile) {
    const block = profileBlock(context.profile);
    if (block) blocks.push(block);
  }

  const notes = context.notes?.trim();
  if (notes) {
    blocks.push(`<owner_notes>
Free text the owner typed in the app as optional extra context. It may name an allergy or diet not in the profile, what they are looking for, or, if the owner is a shopkeeper, today's menu and specials. Keep it in mind: use it to recognise words, spell dishes, weigh risks and choose cards. Never translate it.
"""
${notes}
"""
</owner_notes>`);
  }

  if (context.places && (context.places.food.length || context.places.markets.length)) blocks.push(placesBlock(context.places));

  const time = context.time && localTime(context.time.now, context.time.timeZone);
  if (time) {
    const season = options.pack ? seasonal(time.month, time.date, pack) : "";
    blocks.push(`<local_time>
From the phone's clock. Use it for what is likely on sale (morning market, lunch, night market), what is in season, and greetings.
${time.text}${season ? `\n${season}` : ""}
</local_time>`);
  }

  blocks.push(historyBlock(history, languages));

  const speaking = languages[side];
  const listening = languages[side === "me" ? "them" : "me"];
  const ownerThai = languages.me === "th";
  blocks.push(`<turn>
Speaker: ${side === "me" ? "the owner" : "the other person"}, speaking ${nameOf(speaking)}${speaking === "th" ? " (possibly Kham Mueang)" : ""}.
Listener: ${side === "me" ? "the other person" : "the owner"}, reads ${nameOf(listening)}.
Owner's language (for cards): ${nameOf(languages.me)}${ownerThai ? "" : ", does not read Thai"}.${listening === "th" && side === "me" ? `\nOwner's particle: ${particle === "f" ? "ค่ะ" : "ครับ"}.` : ""}
Speech-to-text (${findLanguage(speaking).locale}): """${heard}"""
</turn>

Write "original" in ${nameOf(speaking)} and "translation" in ${nameOf(listening)}.${options.cards ? ` Cards, if any, in ${nameOf(languages.me)}.` : ""}`);

  return blocks.join("\n\n");
}

// ---------------------------------------------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------------------------------------------

const CARD_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    heading: { type: "string" },
    headingThai: { type: "string", description: "Empty string when not needed." },
    body: { type: "string" },
    suggestion: { type: "string" },
  },
  required: ["heading", "headingThai", "body", "suggestion"],
} as const;

/**
 * Strict, so the input always matches the schema (without it the model sometimes nests the whole answer as a
 * string inside one field). Field order is output order: the translation streams before the cards.
 */
export function turnTool(cards: boolean) {
  const properties = {
    original: { type: "string", description: "Corrected utterance, in the speaker's language." },
    translation: { type: "string", description: "Translation, in the listener's language." },
    ...(cards && { cards: { type: "array", description: "Usually empty. At most 2.", items: CARD_SCHEMA } }),
  };
  return {
    name: "submit_turn",
    description: "Submit the corrected and translated Turn.",
    strict: true,
    input_schema: { type: "object", additionalProperties: false, properties, required: Object.keys(properties) },
  };
}

/** A top-level string field of a tool input still being streamed, once its closing quote has arrived. */
export function completedString(json: string, key: string): string | undefined {
  const match = new RegExp(`"${key}"\\s*:\\s*("(?:[^"\\\\]|\\\\.)*")`).exec(json);
  if (!match) return undefined;
  try {
    return JSON.parse(match[1]) as string;
  } catch {
    return undefined;
  }
}
