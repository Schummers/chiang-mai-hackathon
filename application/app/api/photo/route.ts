import { PHOTO_SCHEMA, photoSystemPrompt, photoUserPrompt, toPhotoCard } from "@/lib/context/photo";
import type { MyInfo } from "@/lib/engine/types";
import { generate, TURN_MODEL } from "@/lib/server/gemini";

export const maxDuration = 30;

const MAX_BYTES = 4 * 1024 * 1024;

function parseMyInfo(raw: FormDataEntryValue | null): MyInfo {
  try {
    const v = JSON.parse(String(raw ?? "{}")) as Partial<MyInfo>;
    return {
      allergies: Array.isArray(v.allergies) ? v.allergies : [],
      spice: v.spice ?? null,
      diet: Array.isArray(v.diet) ? v.diet : [],
    };
  } catch {
    return { allergies: [], spice: null, diet: [] };
  }
}

/** POST FormData { image, language, myInfo } -> PhotoCard. The image is only passed to Gemini: never stored, never logged. */
export async function POST(req: Request) {
  const form = await req.formData();
  const image = form.get("image");
  if (!(image instanceof Blob) || image.size === 0) return Response.json({ error: "no image" }, { status: 400 });
  if (image.size > MAX_BYTES) return Response.json({ error: "image too large" }, { status: 413 });

  const language = String(form.get("language") ?? "en");
  const myInfo = parseMyInfo(form.get("myInfo"));
  // Chiang Mai month (UTC+7), for the produce in season.
  const month = new Date(Date.now() + 7 * 3600_000).getUTCMonth() + 1;
  const data = Buffer.from(await image.arrayBuffer()).toString("base64");

  let text: string;
  try {
    text = await generate(
      TURN_MODEL,
      [{ inlineData: { mimeType: image.type || "image/jpeg", data } }, { text: photoUserPrompt(language, myInfo) }],
      { system: photoSystemPrompt(month), schema: PHOTO_SCHEMA },
    );
  } catch (e) {
    console.error("photo", e instanceof Error ? e.message : "failed");
    return Response.json({ error: "reading failed" }, { status: 502 });
  }

  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    // Falls through to the Sign card.
  }
  return Response.json(toPhotoCard(json, myInfo));
}
