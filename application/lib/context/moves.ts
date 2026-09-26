import type { ContextCard, Message, MoveCard, MoveType, Particle, Speaker, Stage } from "@/lib/engine/types";
import type { Mention } from "./cards";
import movesJson from "./moves.json";
import { PACK, type Pack } from "./pack";

/**
 * Moves: short phrases the Visitor says themselves (people/jonathan/moves/moves.json,
 * copied by scripts/build-moves.mjs). The model only reports the Stage; code picks the Move and fills its Slot.
 */
type Variant = { m: string; f: string };
export type Move = {
  id: string;
  type: MoveType;
  stage: Stage;
  slot: "none" | "dish" | "produce" | "word";
  english: string;
  centralThai: Variant;
  khamMueang: Variant | null;
  romanised: { central: Variant; khamMueang: Variant | null };
  trigger?: string[];
  tone?: string;
  confidence: "high" | "medium" | "low";
  reviewed: boolean;
};

export const MOVES = movesJson as Move[];

/**
 * Switch: false while the native review is out, so only `confidence: "high"` Moves go on stage.
 * Set to true once REVIEW.md is back and `reviewed` flags are set in moves.json.
 */
export const USE_REVIEW = false;

export const STAGES: Stage[] = ["start", "explore", "decide", "receive", "pay", "leave", "vendor-used-northern-word"];

/** The first Turn of a conversation is always start; an unknown Stage reads as explore. */
export function stageFor(modelStage: string | undefined, history: Message[]): Stage {
  if (history.length === 0) return "start";
  return STAGES.includes(modelStage as Stage) ? (modelStage as Stage) : "explore";
}

type SlotValue = { thai: string; roman: string };

function slotValue(slot: Move["slot"], mention: Mention, pack: Pack): SlotValue | null {
  if (!mention.id || mention.kind !== slot) return null;
  const entry = slot === "dish" ? pack.dishes.find((d) => d.id === mention.id) : pack.produce.find((p) => p.id === mention.id);
  const thai = entry?.thai ?? entry?.thaiNorthern;
  return entry && thai ? { thai, roman: entry.name } : null;
}

const fill = (text: string, slot: Move["slot"], value: SlotValue | null, key: "thai" | "roman") =>
  value ? text.replaceAll(`{${slot}}`, value[key]) : text;

/**
 * Echo hears whole words only. Thai has no spaces, so the transcript is cut with Intl.Segmenter("th").
 * Findings (Node 22 ICU): Kham Mueang words are cut oddly and context changes the cut (ลำบาก is ลำ|บาก at the start
 * of a sentence, one word after แม่; ลำนัก, ลำๆ and จ้าวๆ come out as one word). So a trigger is heard when:
 * - it starts on a segment boundary,
 * - it is not part of an ordinary word (pack dish or produce name, or ORDINARY: ลำไย, ผักกาด, ลำบาก...),
 * - and what follows is nothing, a non-Thai character, a known particle / number / intensifier (FOLLOWERS),
 *   itself ending a word (ก่อ yes, ก่อน no), or, for a trigger of several segments (กาดหลวง, ลำก่อ), a segment boundary.
 * A one-segment trigger (ลำ, ซาว, กาด, เจ้า) is never accepted on a bare boundary: the segmenter splits ลำ|ตัว, ซาว|น่า.
 */
const FOLLOWERS = [
  // particles
  "ก่อ", "เจ้า", "จ้าว", "คับ", "ครับ", "ค่ะ", "คะ", "นะ", "เนาะ", "เน้อ", "แล้ว", "กา", "ก๋า", "บ๋อ", "ละ", "ๆ",
  // intensifiers
  "ขนาด", "แต๊", "นัก", "จ๊าด", "หลาย", "ใจ", "ซื่น",
  // numbers and money
  "เอ็ด", "เอ๋ด", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า", "สิบ", "ร้อย", "พัน", "บาท",
  // markets
  "หลวง", "ก้อม", "วโรรส",
];
const ORDINARY = ["ลำบาก", "ลำพูน", "ลำปาง", "ลำไย", "ลำใย", "ลำตัว", "ลำคอ", "ผักกาด", "ยินดีต้อนรับ", "เจ้าของ"];

const segmenter = new Intl.Segmenter("th", { granularity: "word" });
const boundaries = (text: string) => {
  const cuts = new Set<number>([text.length]);
  for (const s of segmenter.segment(text)) cuts.add(s.index);
  return cuts;
};
const segmentCount = (text: string) => [...segmenter.segment(text)].length;
const isThai = (ch: string) => /[\u0E00-\u0E7F]/.test(ch);
/** A word ends at k: end of text, a segment boundary, a non-Thai character or the repeat mark ๆ (แต๊ๆ is one segment). */
const endsWord = (raw: string, k: number, cuts: Set<number>) => cuts.has(k) || !isThai(raw[k]) || raw[k] === "ๆ";

/** Index ranges of ordinary words that contain a trigger without being it. */
function coveredRanges(raw: string, trigger: string, triggers: string[], pack: Pack): [number, number][] {
  const names = [...pack.dishes, ...pack.produce].flatMap((x) => [x.thai, x.thaiNorthern]).filter((n): n is string => !!n);
  const words = [...names, ...ORDINARY].filter((w) => w.length > trigger.length && w.includes(trigger) && !triggers.includes(w));
  const ranges: [number, number][] = [];
  for (const w of words) for (let i = raw.indexOf(w); i >= 0; i = raw.indexOf(w, i + 1)) ranges.push([i, i + w.length]);
  return ranges;
}

export function hearsWord(raw: string, trigger: string, triggers: string[] = [trigger], pack: Pack = PACK): boolean {
  const cuts = boundaries(raw);
  const covered = coveredRanges(raw, trigger, triggers, pack);
  const multi = segmentCount(trigger) > 1;
  for (let i = raw.indexOf(trigger); i >= 0; i = raw.indexOf(trigger, i + 1)) {
    const j = i + trigger.length;
    if (!cuts.has(i) || covered.some(([a, b]) => a <= i && j <= b)) continue;
    const rest = raw.slice(j);
    // A follower counts only as a whole word itself: ก่อ yes, ก่อน (before) no.
    const followed = FOLLOWERS.some((f) => rest.startsWith(f) && endsWord(raw, j + f.length, cuts));
    if (!rest || !isThai(rest[0]) || followed || (multi && cuts.has(j))) return true;
  }
  return false;
}

/** The word the Move's note is about: 'ซาว' in "Vendor says a price with 'ซาว' (= 20)". */
const quotedWord = (move: Move) => move.english.match(/'([^']+)'/)?.[1].replace(/\?$/, "");

/**
 * The longest trigger heard as a whole word. Shown as the trigger itself, and as the Move's quoted word when the
 * trigger only adds to it (ซาวบาท -> ซาว, so the card reads "ซาว = 20").
 */
function heardTrigger(move: Move, raw: string, pack: Pack): string | null {
  const triggers = move.trigger ?? [];
  const hit = triggers.filter((t) => hearsWord(raw, t, triggers, pack)).sort((a, b) => b.length - a.length)[0];
  if (!hit) return null;
  const quoted = quotedWord(move);
  return quoted && hit !== quoted && hit.startsWith(quoted) ? quoted : hit;
}

/**
 * What the heard word means. The Move's own note ("... 'ซาว' (= 20) -> ...") when the Vendor said at least the quoted word,
 * then the pack's glossary (ลำ alone is "delicious", not the note's "is it good?" written for ลำก่อ).
 */
function meaningOf(move: Move, heard: string, pack: Pack): string | undefined {
  const quoted = quotedWord(move);
  const note = move.english.match(/\(([^)]+)\)/)?.[1].replace(/^=\s*/, "").trim();
  if (note && quoted && heard.includes(quoted)) return note;
  const word = pack.words.find((w) => w.thai === heard);
  if (word) return word.english;
  return pack.falseFriends.find((f) => heard.startsWith(f.thai.split(" ")[0]))?.meaningHere;
}

function toCard(move: Move, particle: Particle, value: SlotValue | null, heard?: string, pack: Pack = PACK): MoveCard {
  const km = move.khamMueang?.[particle] ?? null;
  const kmRoman = move.romanised.khamMueang?.[particle] ?? null;
  const heardMeaning = heard ? meaningOf(move, heard, pack) : undefined;
  return {
    id: move.id,
    type: move.type,
    stage: move.stage,
    english: fill(move.english, move.slot, value, "roman"),
    centralThai: fill(move.centralThai[particle], move.slot, value, "thai"),
    khamMueang: km && fill(km, move.slot, value, "thai"),
    romanised: {
      central: fill(move.romanised.central[particle], move.slot, value, "roman"),
      khamMueang: kmRoman && fill(kmRoman, move.slot, value, "roman"),
    },
    ...(move.tone === "playful" && { tone: "playful" as const }),
    ...(heard && { heard }),
    ...(heardMeaning && { heardMeaning }),
  };
}

export type PickOptions = {
  /** The raw transcript of this Turn: Echo only listens to the Vendor. */
  raw?: string;
  speaker?: Speaker;
  particle?: Particle;
  /** The card this Turn already carries: an allergy or diet flag wins over any Move. */
  card?: ContextCard | null;
  moves?: Move[];
  useReview?: boolean;
  pack?: Pack;
};

/** At most one Move for this Turn, or null when nothing fits. */
export function pickMove(stage: Stage, mention: Mention, history: Message[], opts: PickOptions = {}): MoveCard | null {
  if (opts.card?.warning) return null;
  const { moves = MOVES, useReview = USE_REVIEW, pack = PACK, particle = "m" } = opts;
  const shown = new Set(history.map((m) => m.move?.id).filter(Boolean));
  const onStage = moves.filter((m) => (useReview ? m.reviewed : m.confidence === "high") && !shown.has(m.id));

  if (opts.speaker === "vendor" && opts.raw) {
    const echoes = onStage
      .filter((m) => m.type === "echo")
      .map((m) => ({ m, heard: heardTrigger(m, opts.raw!, pack) }))
      .filter((x): x is { m: Move; heard: string } => x.heard !== null)
      .sort((a, b) => b.heard.length - a.heard.length);
    if (echoes.length) return toCard(echoes[0].m, particle, null, echoes[0].heard, pack);
  }

  // Say it first at start, and at leave: the thank you comes before any question (the Postcard hangs on it).
  const askFirst = stage !== "start" && stage !== "leave";
  const candidates = onStage
    .filter((m) => m.stage === stage && m.type !== "echo")
    .map((m) => ({ m, value: m.slot === "dish" || m.slot === "produce" ? slotValue(m.slot, mention, pack) : null }))
    // A Move with a Slot is skipped when the Mention has no matching pack entry.
    .filter(({ m, value }) => !(m.slot === "dish" || m.slot === "produce") || value)
    .map((x, i) => ({ ...x, rank: (askFirst && x.m.type === "ask" ? 0 : 2) + (x.value ? 0 : 1) + i / 1000 }))
    .sort((a, b) => a.rank - b.rank);
  const best = candidates[0];
  return best ? toCard(best.m, particle, best.value) : null;
}
