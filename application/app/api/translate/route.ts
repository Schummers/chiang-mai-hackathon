import { cardFor, momentCard, type Mention } from "@/lib/context/cards";
import { systemPrompt, TURN_SCHEMA, turnPrompt } from "@/lib/context/prompt";
import type { MyInfo, TranslateInput, TranslateResult } from "@/lib/engine/types";
import { generate, TURN_MODEL } from "@/lib/server/gemini";

export const maxDuration = 30;

type ModelTurn = {
  original?: string[];
  translation?: string[];
  mention?: Mention;
  detectedInfo?: Partial<MyInfo>;
};

/** Today in Chiang Mai (UTC+7), as YYYY-MM-DD. */
function today(): string {
  return new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
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
  };
  const history = Array.isArray(input.history) ? input.history : [];
  const date = today();

  let turn: ModelTurn;
  try {
    const text = await generate(TURN_MODEL, [{ text: turnPrompt(raw, input.speaker, input.userLanguage, myInfo, history) }], {
      system: systemPrompt(Number(date.slice(5, 7))),
      schema: TURN_SCHEMA,
    });
    turn = JSON.parse(text) as ModelTurn;
  } catch (e) {
    console.error("translate", e);
    return Response.json({ error: "translation failed" }, { status: 502 });
  }

  const original = turn.original?.filter(Boolean) ?? [];
  const translation = turn.translation?.filter(Boolean) ?? [];
  // The Moment card opens the conversation when the first Turn names nothing.
  const card = cardFor(turn.mention ?? { kind: "none" }, myInfo) ?? (history.length === 0 ? momentCard(date) : null);

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
    ...(Object.keys(detectedInfo).length && { detectedInfo }),
  };
  return Response.json(result);
}
