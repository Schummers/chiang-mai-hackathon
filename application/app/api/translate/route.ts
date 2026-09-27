import { flagCard, type Mention } from "@/lib/context/cards";
import { infoCards } from "@/lib/context/infoCards";
import { pickMove, stageFor } from "@/lib/context/moves";
import { localTime, systemPrompt, turnPrompt, turnTool } from "@/lib/context/prompt";
import { romanisedItems } from "@/lib/context/romanised";
import type { MyInfo, TranslateInput, TranslateResult } from "@/lib/engine/types";
import { NOTES_MAX, particleOf } from "@/lib/myInfo";
import { callTool } from "@/lib/server/anthropic";

export const maxDuration = 30;

type ModelTurn = {
  original?: string[];
  translation?: string[];
  romanised?: unknown;
  cards?: unknown;
  mention?: Mention;
  stage?: string;
  detectedInfo?: Partial<MyInfo>;
};

/** Month in Chiang Mai (UTC+7), when the phone did not send its time. */
function chiangMaiMonth(): number {
  return new Date(Date.now() + 7 * 3600_000).getUTCMonth() + 1;
}

/** POST TranslateInput -> TranslateResult */
export async function POST(req: Request) {
  const input = (await req.json()) as TranslateInput;
  const raw = String(input.raw ?? "").slice(0, 2000);
  if (!raw.trim()) return Response.json({ error: "empty" }, { status: 400 });
  const myInfo: MyInfo = {
    allergies: input.myInfo?.allergies ?? [],
    spice: input.myInfo?.spice ?? null,
    diet: input.myInfo?.diet ?? [],
    particle: particleOf(input.myInfo),
  };
  const history = Array.isArray(input.history) ? input.history : [];
  const options = { cards: input.options?.cards !== false, moves: input.options?.moves !== false, pack: input.options?.pack !== false };
  const context = input.context ?? {};
  if (context.notes) context.notes = String(context.notes).slice(0, NOTES_MAX);
  const device = context.device && localTime(context.device.now, context.device.timeZone);
  const month = device?.month ?? chiangMaiMonth();

  let turn: ModelTurn;
  try {
    turn = (await callTool(turnPrompt(raw, input.speaker, input.userLanguage, myInfo, history, context), {
      system: systemPrompt(month, options),
      tool: turnTool(options.cards),
    })) as ModelTurn;
  } catch (e) {
    console.error("translate", e);
    return Response.json({ error: "translation failed" }, { status: 502 });
  }

  const original = turn.original?.filter(Boolean) ?? [];
  const translation = turn.translation?.filter(Boolean) ?? [];
  const mention: Mention = turn.mention ?? { kind: "none" };
  const card = flagCard(mention, myInfo);
  const cards = options.cards ? infoCards(turn.cards) : [];

  // The model gives the Stage, code picks the Move. An allergy or diet flag on the card wins over any Move.
  const stage = stageFor(turn.stage, history);
  const move = options.moves ? pickMove(stage, mention, history, { raw, speaker: input.speaker, particle: myInfo.particle, card }) : null;

  const detected = turn.detectedInfo ?? {};
  const detectedInfo: Partial<MyInfo> = {
    ...(detected.allergies?.length && { allergies: detected.allergies }),
    ...(detected.spice && { spice: detected.spice }),
    ...(detected.diet?.length && { diet: detected.diet }),
  };

  const result: TranslateResult = {
    original: original.length ? original : [raw],
    translation: translation.length ? translation : [raw],
    card,
    // Undefined for the Vendor, dropped by JSON.
    romanised: translation.length ? romanisedItems(turn.romanised, input.speaker) : undefined,
    stage,
    move,
    ...(cards.length && { cards }),
    ...(Object.keys(detectedInfo).length && { detectedInfo }),
  };
  return Response.json(result);
}
