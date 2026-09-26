import type { Allergy, ContextCard, Diet, MyInfo } from "@/lib/engine/types";
import { DISH_OVERLAY } from "./overlay";
import { PACK, type Pack } from "./pack";

/** What the model reports it recognised in a Turn. The card itself is filled from the pack. */
export type Mention = {
  kind: "none" | "dish" | "produce" | "word" | "offguide";
  /** Pack id for a dish or produce, Thai spelling for a word. */
  id?: string;
  /** Off-guide only, or fallbacks when the pack has no value. */
  name?: string;
  nameThai?: string;
  description?: string;
  meat?: string;
  spice?: number;
  /** The model's reading of an allergy or diet conflict with My info. */
  warning?: string;
};

const ALLERGY_LABEL: Record<Allergy, string> = {
  peanuts: "Peanuts",
  shellfish: "Shellfish or shrimp paste",
  gluten: "Gluten",
  other: "Your allergy",
};

const DIET_CONFLICT: Record<Diet, RegExp> = {
  "no-pork": /pork|blood|offal|khaep|sai ua/i,
  vegetarian: /pork|beef|chicken|fish|crab|shrimp|blood|offal|egg|meat/i,
  halal: /pork|blood|khaep/i,
};

const CHECK = "A risk to check with the vendor, never a guarantee.";

function spiceLevel(n: number | undefined): ContextCard["spice"] {
  if (n === undefined || !Number.isFinite(n)) return undefined;
  return Math.max(0, Math.min(3, Math.round(n))) as 0 | 1 | 2 | 3;
}

/** Deterministic flag from the overlay and ingredients, then the model's own reading. */
function warningFor(dishText: string, allergens: Allergy[], myInfo: MyInfo, modelWarning?: string): string | undefined {
  const hit = myInfo.allergies.find((a) => allergens.includes(a));
  if (hit) return `${ALLERGY_LABEL[hit]}: may be in this dish. ${CHECK}`;
  const diet = myInfo.diet.find((d) => DIET_CONFLICT[d].test(dishText));
  if (diet) return `May not fit your diet (${diet}). ${CHECK}`;
  if (modelWarning && (myInfo.allergies.length || myInfo.diet.length)) return `${modelWarning} ${CHECK}`;
  return undefined;
}

export function dishCard(id: string, mention: Mention, myInfo: MyInfo, pack: Pack = PACK): ContextCard | null {
  const dish = pack.dishes.find((d) => d.id === id);
  if (!dish) return null;
  const extra = DISH_OVERLAY[id] ?? {};
  const text = `${dish.description} ${dish.ingredients.join(" ")}`;
  return {
    kind: "dish",
    name: dish.name.replace(/\b\w/g, (c) => c.toUpperCase()),
    nameThai: dish.thai ?? undefined,
    description: dish.description,
    meat: extra.meat ?? mention.meat,
    spice: extra.spice ?? spiceLevel(mention.spice),
    localDetail: extra.localDetail ?? dish.occasion ?? undefined,
    warning: warningFor(text, extra.allergens ?? [], myInfo, mention.warning),
  };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function produceCard(id: string, pack: Pack = PACK): ContextCard | null {
  const p = pack.produce.find((x) => x.id === id);
  if (!p) return null;
  const months = p.months.map((m) => MONTHS[m - 1]).join(", ");
  return {
    kind: "dish",
    name: p.english.charAt(0).toUpperCase() + p.english.slice(1),
    nameThai: p.thai ?? undefined,
    description: p.eatenIn.length ? `Eaten here: ${p.eatenIn.slice(0, 2).join("; ")}.` : `A Northern ${p.category}.`,
    localDetail: [p.thaiNorthern && `Northern name: ${p.thaiNorthern}.`, months && `In season: ${months}.`]
      .filter(Boolean)
      .join(" "),
  };
}

export function wordCard(thai: string, pack: Pack = PACK): ContextCard | null {
  const key = thai.trim();
  const ff = pack.falseFriends.find((f) => key.startsWith(f.thai.split(" ")[0]));
  const w = pack.words.find((x) => x.thai === key) ?? pack.words.find((x) => key.includes(x.thai) || x.thai.includes(key));
  if (ff) {
    return {
      kind: "word",
      name: w?.roman ?? ff.thai,
      nameThai: key,
      description: `Here in the North: ${ff.meaningHere}. In Bangkok Thai: ${ff.meaningCentral}.`,
      localDetail: w?.note ?? "Say it back to the vendor: it is their language, not the textbook one.",
    };
  }
  if (!w) return null;
  return {
    kind: "word",
    name: w.roman,
    nameThai: w.thai,
    description: `Kham Mueang for "${w.english}". Central Thai: ${w.centralThai}.`,
    localDetail: w.note ?? "Say it back to the vendor: it is their language, not the textbook one.",
  };
}

/** False friends too common to card: เจ้า ends most Northern sentences, ส้ม sits in dish names. */
const TOO_COMMON = new Set(["เจ้า", "ส้ม"]);

/** Backstop when the model misses it: a false friend the Vendor said, as a Word card. */
export function falseFriendCard(raw: string, pack: Pack = PACK): ContextCard | null {
  const ff = pack.falseFriends
    .map((f) => f.thai.split(" ")[0])
    .find((base) => !TOO_COMMON.has(base) && raw.includes(base));
  if (!ff) return null;
  const at = raw.indexOf(ff);
  const heard = raw.slice(at).split(/\s/)[0];
  return wordCard(heard, pack);
}

/** Off-guide dish: only exists to carry an allergy or diet flag. */
export function offGuideCard(mention: Mention, myInfo: MyInfo): ContextCard | null {
  if (!mention.name) return null;
  const warning = warningFor(`${mention.name} ${mention.description ?? ""}`, [], myInfo, mention.warning);
  if (!warning) return null;
  return {
    kind: "dish",
    offGuide: true,
    name: mention.name,
    nameThai: mention.nameThai,
    description: mention.description ?? "Not in our local guide.",
    warning,
  };
}

export function cardFor(mention: Mention, myInfo: MyInfo, pack: Pack = PACK): ContextCard | null {
  switch (mention.kind) {
    case "dish":
      return mention.id ? (dishCard(mention.id, mention, myInfo, pack) ?? offGuideCard(mention, myInfo)) : null;
    case "produce":
      return mention.id ? produceCard(mention.id, pack) : null;
    case "word":
      return mention.id ? wordCard(mention.id, pack) : null;
    case "offguide":
      return offGuideCard(mention, myInfo);
    default:
      return null;
  }
}

const fmt = (iso: string) => {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}`;
};

/** Moment card for the first Turn: today's season, then the next festival. `today` is YYYY-MM-DD. */
export function momentCard(today: string, pack: Pack = PACK): ContextCard {
  const month = Number(today.slice(5, 7));
  const m = pack.months.find((x) => x.month === month)!;
  const next = pack.festivals.find((f) => f.end >= today && f.id !== "wan_phra");
  const season = m.season.charAt(0).toUpperCase() + m.season.slice(1);
  return {
    kind: "moment",
    name: `${season} season in Chiang Mai`,
    description: `${m.talk} Around ${m.highC}° by day, ${m.lowC}° at night.`,
    localDetail: next
      ? `${next.start <= today ? "Now" : `Next, ${fmt(next.start)}`}: ${next.name}${next.alcoholBan ? " (no alcohol sold that day)" : ""}.`
      : undefined,
  };
}
