import type { ContextCard, HistoryTurn, Languages, TranslateEvent, TranslateInput, TranslateResult, TurnContext } from "@/lib/engine/types";
import { LANGUAGES } from "@/lib/language";
import { NOTES_MAX, particleOf, sanitizeMyInfo } from "@/lib/myInfo";
import { streamTool } from "@/lib/server/anthropic";
import { completedString, systemPrompt, turnPrompt, turnTool } from "@/lib/server/prompt";

export const maxDuration = 30;

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const lang = (v: unknown, fallback: string) => (LANGUAGES.some((l) => l.code === v) ? (v as string) : fallback);

/** The model's cards, kept only when they have a heading and a body; at most 2. */
function cardsOf(value: unknown, ownerReadsThai: boolean): ContextCard[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((c: Record<string, unknown> | null) => ({
      heading: str(c?.heading, 60),
      headingThai: str(c?.headingThai, 60),
      body: str(c?.body, 320),
      suggestion: str(c?.suggestion, 140),
    }))
    .filter((c) => c.heading && c.body)
    .slice(0, 2)
    .map(({ heading, headingThai, body, suggestion }) => ({
      heading,
      body,
      ...(headingThai && !ownerReadsThai && headingThai !== heading && { headingThai }),
      ...(suggestion && { suggestion }),
    }));
}

function historyOf(value: unknown): HistoryTurn[] {
  if (!Array.isArray(value)) return [];
  return value.slice(-10).map((t: Record<string, unknown>) => ({
    side: t?.side === "them" ? "them" : "me",
    original: str(t?.original, 500),
    translation: str(t?.translation, 500),
    cards: Array.isArray(t?.cards) ? t.cards.map((c: { heading?: unknown }) => ({ heading: str(c?.heading, 60) })) : [],
  }));
}

/** POST TranslateInput -> TranslateResult */
export async function POST(req: Request) {
  const input = (await req.json().catch(() => ({}))) as Partial<TranslateInput>;
  const heard = str(input.heard, 2000);
  if (!heard) return Response.json({ error: "empty" }, { status: 400 });

  const side = input.side === "them" ? "them" : "me";
  const me = lang(input.languages?.me, "en");
  const languages: Languages = { me, them: lang(input.languages?.them, me === "th" ? "en" : "th") };
  const options = { cards: input.options?.cards !== false, pack: input.options?.pack !== false };

  const raw = input.context ?? {};
  const profile = raw.profile ? sanitizeMyInfo(raw.profile) : undefined;
  const context: TurnContext = {
    ...(profile && { profile }),
    ...(raw.notes && { notes: str(raw.notes, NOTES_MAX) }),
    ...(raw.places && { places: raw.places }),
    ...(raw.time && { time: raw.time }),
  };

  const user = turnPrompt({ side, heard, languages, history: historyOf(input.history), context, options, particle: particleOf(profile) });
  const ownerReadsThai = languages.me === "th";

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: TranslateEvent) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      let sentText = false;
      try {
        const out = (await streamTool(user, {
          system: systemPrompt(options),
          tool: turnTool(options.cards),
          onPartial: (json) => {
            if (sentText) return;
            const translation = completedString(json, "translation");
            if (!translation?.trim()) return;
            sentText = true;
            send({ type: "text", original: completedString(json, "original")?.trim() || heard, translation: translation.trim() });
          },
        })) as { original?: unknown; translation?: unknown; cards?: unknown };
        const result: TranslateResult = {
          original: str(out.original, 2000) || heard,
          translation: str(out.translation, 2000),
          cards: options.cards ? cardsOf(out.cards, ownerReadsThai) : [],
        };
        send(result.translation ? { type: "done", result } : { type: "error" });
      } catch (e) {
        console.error("translate", e instanceof Error ? e.message : e);
        send({ type: "error" });
      }
      controller.close();
    },
  });
  return new Response(body, { headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" } });
}
