import { ASK_SCHEMA, askPrompt, parseMyInfo, PHOTO_MAX_BYTES, photoSystemPrompt } from "@/lib/context/photo";
import type { PhotoCard } from "@/lib/engine/types";
import { generate, TURN_MODEL } from "@/lib/server/gemini";

export const maxDuration = 30;

/** POST FormData { image, question, card, language, myInfo } -> { answer }. The image is only passed to Gemini: never stored, never logged. */
export async function POST(req: Request) {
  const form = await req.formData();
  const image = form.get("image");
  const question = String(form.get("question") ?? "").trim();
  if (!(image instanceof Blob) || image.size === 0 || !question) return Response.json({ error: "no image or question" }, { status: 400 });
  if (image.size > PHOTO_MAX_BYTES) return Response.json({ error: "image too large" }, { status: 413 });

  let card: PhotoCard | null = null;
  try {
    card = JSON.parse(String(form.get("card") ?? "")) as PhotoCard | null;
  } catch {
    // Handled just below.
  }
  if (!card || typeof card !== "object" || typeof card.kind !== "string" || typeof card.title !== "string") {
    return Response.json({ error: "bad card" }, { status: 400 });
  }
  const language = String(form.get("language") ?? "en");
  const myInfo = parseMyInfo(form.get("myInfo"));
  const month = new Date(Date.now() + 7 * 3600_000).getUTCMonth() + 1;
  const data = Buffer.from(await image.arrayBuffer()).toString("base64");

  try {
    const text = await generate(
      TURN_MODEL,
      [{ inlineData: { mimeType: image.type || "image/jpeg", data } }, { text: askPrompt(question, card, language, myInfo) }],
      { system: photoSystemPrompt(month), schema: ASK_SCHEMA },
    );
    const answer = String((JSON.parse(text) as { answer?: unknown }).answer ?? "").trim();
    if (!answer) throw new Error("empty answer");
    return Response.json({ answer });
  } catch (e) {
    console.error("photo ask", e instanceof Error ? e.message : "failed");
    return Response.json({ error: "answer failed" }, { status: 502 });
  }
}
