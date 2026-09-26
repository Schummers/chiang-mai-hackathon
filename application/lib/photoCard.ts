import type { Allergy, MyInfo, PhotoCard } from "./engine/types";

type Known = Exclude<Allergy, "other">;

// Same words as lib/cardFlag.ts: a pill only when the warning names something in About you.
const WORDS: Record<Known, RegExp> = {
  peanuts: /peanut/i,
  shellfish: /shellfish|shrimp|prawn|crab/i,
  gluten: /gluten|wheat/i,
};
const LABEL: Record<Known, string> = { peanuts: "Peanuts", shellfish: "Shellfish", gluten: "Gluten" };
const DIET = /diet|pork|meat|vegetarian|halal/i;

export const MENU_MAX_ROWS = 5;
export const UNREADABLE_TITLE = "Couldn't read this photo";

export type MenuRow = {
  name: string;
  nameThai?: string;
  /** Conflict with About you = solid ink pill, else the item's short note on --you-wash. */
  pill: { conflict: boolean; label: string } | null;
};

function conflict(warning: string | undefined, myInfo: MyInfo): string | null {
  if (!warning) return null;
  const allergen = myInfo.allergies.find((a): a is Known => a !== "other" && WORDS[a as Known].test(warning));
  if (allergen) return LABEL[allergen];
  if (myInfo.diet.length && DIET.test(warning)) return "Diet";
  return null;
}

/** Menu rows to show: About you conflicts first, then the menu order, 5 at most. */
export function menuRows(card: PhotoCard, myInfo: MyInfo, max = MENU_MAX_ROWS): { rows: MenuRow[]; more: number } {
  const all = (card.items ?? []).map((item): MenuRow => {
    const label = conflict(item.warning, myInfo);
    return {
      name: item.name,
      nameThai: item.nameThai,
      pill: label ? { conflict: true, label } : item.note ? { conflict: false, label: item.note } : null,
    };
  });
  const sorted = [...all.filter((r) => r.pill?.conflict), ...all.filter((r) => !r.pill?.conflict)];
  return { rows: sorted.slice(0, max), more: Math.max(0, sorted.length - max) };
}

/** A read with nothing useful becomes a Sign card saying so: never an empty card. */
export function readablePhotoCard(card: PhotoCard): PhotoCard {
  const empty = card.kind === "menu" ? !card.items?.length : !card.title.trim() && !card.description.trim();
  if (!empty) return card;
  return {
    kind: "sign",
    title: UNREADABLE_TITLE,
    description: "Try again closer, with more light, or ask the vendor.",
  };
}
