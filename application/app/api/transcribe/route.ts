import { generate, TRANSCRIBE_MODEL } from "@/lib/server/gemini";
import { languageName } from "@/lib/context/prompt";

export const maxDuration = 30;

const MAX_BYTES = 4 * 1024 * 1024;
const THAI_GAP = /(?<=[฀-๿]) (?=[฀-๿])/g;

/** POST FormData { audio, language } -> { raw } */
export async function POST(req: Request) {
  const form = await req.formData();
  const audio = form.get("audio");
  const language = String(form.get("language") ?? "en");
  if (!(audio instanceof Blob) || audio.size === 0) return Response.json({ raw: "" });
  if (audio.size > MAX_BYTES) return Response.json({ error: "audio too large" }, { status: 413 });

  const lang = language === "th" ? "Thai (possibly Northern Thai / Kham Mueang)" : languageName(language);
  const data = Buffer.from(await audio.arrayBuffer()).toString("base64");
  const mimeType = (audio.type || "audio/webm").split(";")[0];
  try {
    const text = await generate(TRANSCRIBE_MODEL, [
      { inlineData: { mimeType, data } },
      {
        text: `Transcribe this speech verbatim. Expected language: ${lang}. Write numbers as digits. Output only the transcript, nothing else. If there is no speech, output nothing.`,
      },
    ]);
    // Flash-lite puts a space between every Thai word; Thai is written without them.
    return Response.json({ raw: text.replace(THAI_GAP, "") });
  } catch (e) {
    console.error("transcribe", e);
    return Response.json({ error: "transcription failed" }, { status: 502 });
  }
}
