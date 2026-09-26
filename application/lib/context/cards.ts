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

/** The dish behind a Mention, flag or not. Produce and word cards are retired: Moves replace them. */
export function cardFor(mention: Mention, myInfo: MyInfo, pack: Pack = PACK): ContextCard | null {
  switch (mention.kind) {
    case "dish":
      return mention.id ? (dishCard(mention.id, mention, myInfo, pack) ?? offGuideCard(mention, myInfo)) : null;
    case "offguide":
      return offGuideCard(mention, myInfo);
    default:
      return null;
  }
}

/** The only card left on the thread: the Allergy Flag, a dish card that carries an allergy or diet warning. */
export function flagCard(mention: Mention, myInfo: MyInfo, pack: Pack = PACK): ContextCard | null {
  const card = cardFor(mention, myInfo, pack);
  return card?.warning ? card : null;
}
