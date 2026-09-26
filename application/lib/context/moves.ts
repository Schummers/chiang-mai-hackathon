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

/** Pack names that contain a trigger without being it: ลำ in ลำไย, กาด in ผักกาดดอง. */
function heardTrigger(move: Move, raw: string, pack: Pack): string | null {
  const names = [...pack.dishes, ...pack.produce].flatMap((x) => [x.thai, x.thaiNorthern]).filter((n): n is string => !!n);
  const hits = (move.trigger ?? []).filter((t) => {
    const masked = names
      .filter((n) => n.length > t.length && n.includes(t) && !move.trigger?.includes(n))
      .reduce((text, n) => text.replaceAll(n, " "), raw);
    return masked.includes(t);
  });
  return hits.sort((a, b) => b.length - a.length)[0] ?? null;
}

/**
 * What the heard word means. The Move's own note ("... 'ซาว' (= 20) -> ...") when the Vendor said at least the quoted word,
 * then the pack's glossary (ลำ alone is "delicious", not the note's "is it good?" written for ลำก่อ).
 */
function meaningOf(move: Move, heard: string, pack: Pack): string | undefined {
  const quoted = move.english.match(/'([^']+)'/)?.[1].replace(/\?$/, "");
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
