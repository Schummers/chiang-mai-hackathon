import type { Allergy, ContextCard, MyInfo } from "./engine/types";

type Known = Exclude<Allergy, "other">;

/** Words that name each known allergen in a warning. Shared with the photo menu rows (lib/photoCard.ts). */
export const ALLERGEN_WORDS: Record<Known, RegExp> = {
  peanuts: /peanut/i,
  shellfish: /shellfish|shrimp|prawn|crab/i,
  gluten: /gluten|wheat/i,
};

const NAME: Record<Known, string> = { peanuts: "peanuts", shellfish: "shellfish", gluten: "gluten" };

const known = (a: Allergy): a is Known => a !== "other";

export type CardFlags = {
  /** Flag row text when the card conflicts with About you ("May contain peanuts"), else null. */
  flag: string | null;
  /** Allergens the vendor explicitly ruled out in their reply, e.g. ["peanuts"]. */
  vendorNo: string[];
};

/** Reads the card's warning against About you and the vendor's reply. UI only: the engine stays untouched. */
export function cardFlags(card: ContextCard, myInfo: MyInfo, vendorSaid: string[]): CardFlags {
  const mine = myInfo.allergies.filter(known);
  const said = vendorSaid.join(" \n");
  const vendorNo = mine
    .filter((a) => new RegExp(`\\b(no|without)\\b[^.\\n]*(${ALLERGEN_WORDS[a].source})`, "i").test(said))
    .map((a) => NAME[a]);

  const warning = card.warning?.trim();
  if (!warning) return { flag: null, vendorNo };

  const allergen = mine.find((a) => ALLERGEN_WORDS[a].test(warning));
  if (allergen) return { flag: vendorNo.includes(NAME[allergen]) ? null : `May contain ${NAME[allergen]}`, vendorNo };
  if (/diet/i.test(warning)) return { flag: "May not fit your diet", vendorNo };
  // A model warning with no known allergen: its first sentence, still in the flag style.
  return { flag: warning.split(/(?<=\.)\s/)[0], vendorNo };
}
