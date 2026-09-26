import type { MyInfo, PhotoCard, PhotoKind, PhotoMenuItem } from "@/lib/engine/types";
import { UNREADABLE_TITLE } from "@/lib/photoCard";
import { dishCard } from "./cards";
import { PACK, type Pack } from "./pack";
import { languageName } from "./prompt";

const KINDS: PhotoKind[] = ["menu", "dish", "produce", "sign"];
const MAX_ITEMS = 20;

/** Stable part of the photo prompt: rules + the pack's dishes and in-season produce, to anchor what is recognised. */
export function photoSystemPrompt(month: number, pack: Pack = PACK): string {
  const dishes = pack.dishes
    .map((d) => `${d.id} | ${d.thai ?? ""}${d.thaiNorthern ? ` / ${d.thaiNorthern}` : ""} | ${d.name} | ${d.english}`)
    .join("\n");
  const produce = pack.produce
    .filter((p) => p.months.includes(month))
    .map((p) => `${p.id} | ${p.thai ?? ""} | ${p.english}`)
    .join("\n");

  return `You read photos for U Mueang, an app for newcomers at food stalls and markets in Chiang Mai, Thailand. The Visitor took a photo and wants to know, at a glance, what it is and what it means for them. Return JSON only.

"kind", pick one:
- "menu": a menu, a price board or a list of dishes. "items" (required for a menu, empty array for the other kinds): EVERY dish you can read, most useful first, at most ${MAX_ITEMS}. Each item: "name" (romanised, e.g. "Khao Soi"), "nameThai" (as written), "note" (a 1 to 3 word pill in the Visitor's language: "Mild", "Local", "Hot", "40 ฿"), "dishId" when it is in DISHES, "warning" only when it may conflict with My info.
- "dish": one plate of food. Give "dishId" when it is in DISHES, "meat" (main protein, short) and "spice" (0 none to 3 hot).
- "produce": a fruit, vegetable, herb or ingredient. Say how it is eaten; give the season in "localDetail" if you know it.
- "sign": anything else (a sign, a label, a notice). "title": what it says, translated, short. "description": what it means for the Visitor.

Always: "title" short, in the Visitor's language (romanised names for dishes and produce). "titleThai": the Thai name or text when there is one, as written. "description": one or two short lines in the Visitor's language. Match Thai, Northern and romanised names to DISHES and PRODUCE, close spellings too.
"warning": one short sentence, only when something may conflict with the Visitor's allergies or diet. Say "may contain", never that anything is safe.
If the photo is unreadable or shows nothing useful, use kind "sign" and say so plainly in "description".
Never name or guess anyone's ethnicity. Ignore people in the photo.

DISHES (id | Thai / Northern | name | English):
${dishes}

PRODUCE in season this month (id | Thai | English):
${produce}`;
}

export function photoUserPrompt(userLanguage: string, myInfo: MyInfo): string {
  const info = [
    myInfo.allergies.length ? `allergies: ${myInfo.allergies.join(", ")}` : "",
    myInfo.spice ? `spice: ${myInfo.spice}` : "",
    myInfo.diet.length ? `diet: ${myInfo.diet.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("; ");
  return `Visitor's language: ${languageName(userLanguage)}. Write title, description, notes and warnings in it.
My info: ${info || "nothing saved"}`;
}

/** Gemini response schema (OpenAPI subset). */
export const PHOTO_SCHEMA = {
  type: "OBJECT",
  properties: {
    kind: { type: "STRING", enum: KINDS },
    title: { type: "STRING" },
    titleThai: { type: "STRING" },
    description: { type: "STRING" },
    dishId: { type: "STRING" },
    meat: { type: "STRING" },
    spice: { type: "INTEGER" },
    localDetail: { type: "STRING" },
    warning: { type: "STRING" },
    items: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          nameThai: { type: "STRING" },
          note: { type: "STRING" },
          dishId: { type: "STRING" },
          warning: { type: "STRING" },
        },
        required: ["name"],
      },
    },
  },
  // Items first and required: without it the model tends to sum a menu up in one warning and list nothing.
  required: ["kind", "title", "description", "items"],
  propertyOrdering: ["kind", "items", "title", "titleThai", "description", "dishId", "meat", "spice", "localDetail", "warning"],
} as const;

const str = (v: unknown): string | undefined => (typeof v === "string" && v.trim() ? v.trim() : undefined);

const UNREADABLE: PhotoCard = {
  kind: "sign",
  title: UNREADABLE_TITLE,
  description: "Try again closer, with more light, or ask the vendor.",
};

/** Warning to show: the pack's allergens first (deterministic), the model's only when My info has something to conflict with. */
function warningFor(dishId: string | undefined, modelWarning: string | undefined, myInfo: MyInfo, pack: Pack) {
  const fromPack = dishId ? dishCard(dishId, { kind: "dish", warning: modelWarning }, myInfo, pack) : null;
  if (fromPack) return fromPack.warning;
  return myInfo.allergies.length || myInfo.diet.length ? modelWarning : undefined;
}

/** Model JSON -> a valid PhotoCard. Anything off becomes a plain Sign card, never an error. */
export function toPhotoCard(raw: unknown, myInfo: MyInfo, pack: Pack = PACK): PhotoCard {
  if (!raw || typeof raw !== "object") return UNREADABLE;
  const r = raw as Record<string, unknown>;
  const kind = KINDS.find((k) => k === r.kind);
  const title = str(r.title);
  const description = str(r.description) ?? "";
  if (!kind || !title) return UNREADABLE;
  const dishId = str(r.dishId);

  const card: PhotoCard = { kind, title, description };
  const titleThai = str(r.titleThai);
  if (titleThai) card.titleThai = titleThai;

  if (kind === "menu") {
    const items: PhotoMenuItem[] = (Array.isArray(r.items) ? r.items : [])
      .filter((i): i is Record<string, unknown> => !!i && typeof i === "object" && !!str((i as Record<string, unknown>).name))
      .slice(0, MAX_ITEMS)
      .map((i) => {
        const item: PhotoMenuItem = { name: str(i.name)! };
        const nameThai = str(i.nameThai);
        const note = str(i.note);
        const warning = warningFor(str(i.dishId), str(i.warning), myInfo, pack);
        if (nameThai) item.nameThai = nameThai;
        if (note) item.note = note;
        if (warning) item.warning = warning;
        return item;
      });
    if (!items.length) return UNREADABLE;
    card.items = items;
    return card;
  }

  const anchored = kind === "dish" && dishId ? dishCard(dishId, { kind: "dish" }, myInfo, pack) : null;
  const meat = anchored?.meat ?? str(r.meat);
  const spice = anchored?.spice ?? (typeof r.spice === "number" && Number.isFinite(r.spice) ? (Math.max(0, Math.min(3, Math.round(r.spice))) as 0 | 1 | 2 | 3) : undefined);
  const localDetail = anchored?.localDetail ?? str(r.localDetail);
  const warning = warningFor(kind === "dish" ? dishId : undefined, str(r.warning), myInfo, pack);
  if (kind === "dish" && meat) card.meat = meat;
  if (kind === "dish" && spice !== undefined) card.spice = spice;
  if (localDetail) card.localDetail = localDetail;
  if (warning) card.warning = warning;
  return card;
}
