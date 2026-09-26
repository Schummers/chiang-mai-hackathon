const API = "https://generativelanguage.googleapis.com/v1beta/models";

/** Fast models measured on 2026-09-27: flash-lite ~1.5 s for a short clip, 3.6-flash ~2 s for a Turn. */
export const TRANSCRIBE_MODEL = process.env.GEMINI_TRANSCRIBE_MODEL ?? "gemini-3.5-flash-lite";
export const TURN_MODEL = process.env.GEMINI_TURN_MODEL ?? "gemini-3.6-flash";
/** Used when the main model is overloaded (503) or rate limited (429). */
export const FALLBACK_MODEL = "gemini-3.5-flash-lite";

type Part = { text: string } | { inlineData: { mimeType: string; data: string } };

type Options = {
  system?: string;
  schema?: object;
  timeoutMs?: number;
};

export class GeminiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function call(model: string, parts: Part[], { system, schema, timeoutMs = 12_000 }: Options): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new GeminiError(500, "GEMINI_API_KEY is not set");
  const res = await fetch(`${API}/${model}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": key },
    signal: AbortSignal.timeout(timeoutMs),
    body: JSON.stringify({
      ...(system && { systemInstruction: { parts: [{ text: system }] } }),
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0,
        thinkingConfig: { thinkingLevel: "minimal" },
        ...(schema && { responseMimeType: "application/json", responseSchema: schema }),
      },
    }),
  });
  if (!res.ok) throw new GeminiError(res.status, `${model} ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  return (json.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("").trim();
}

/** Calls `model`, then the fallback once if Gemini is overloaded or rate limited. */
export async function generate(model: string, parts: Part[], opts: Options = {}): Promise<string> {
  try {
    return await call(model, parts, opts);
  } catch (e) {
    if (e instanceof GeminiError && (e.status === 503 || e.status === 429) && model !== FALLBACK_MODEL) {
      return call(FALLBACK_MODEL, parts, opts);
    }
    throw e;
  }
}
