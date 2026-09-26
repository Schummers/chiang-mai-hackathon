const API = "https://generativelanguage.googleapis.com/v1beta/models";

/** Fast models measured on 2026-09-27: flash-lite ~1.5 s for a short clip, 3.6-flash ~2 s for a Turn. */
export const TRANSCRIBE_MODEL = process.env.GEMINI_TRANSCRIBE_MODEL ?? "gemini-3.5-flash-lite";
export const TURN_MODEL = process.env.GEMINI_TURN_MODEL ?? "gemini-3.6-flash";
/** Used when the main model is overloaded (503), rate limited (429) or too slow. */
export const FALLBACK_MODEL = "gemini-3.5-flash-lite";

/** Whole request, fallback included. Under the engine's 15 s per call (lib/engine/engine.ts), so an answer can still land. */
const BUDGET_MS = 13_000;
/** The main model's share when a fallback exists; flash-lite (~1.5 s) gets the rest. */
const PRIMARY_MS = 8_000;

type Part = { text: string } | { inlineData: { mimeType: string; data: string } };

type Options = {
  system?: string;
  schema?: object;
  /** Total time for the request, fallback included. */
  budgetMs?: number;
  /** Time given to the main model before falling back. */
  primaryMs?: number;
};

export class GeminiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function call(model: string, parts: Part[], { system, schema }: Options, timeoutMs: number): Promise<string> {
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

const retryable = (e: unknown) =>
  (e instanceof GeminiError && (e.status === 503 || e.status === 429)) ||
  (e instanceof Error && e.name === "TimeoutError");

/** Calls `model`, then the fallback once if Gemini is overloaded, rate limited or too slow, all within one budget. */
export async function generate(model: string, parts: Part[], opts: Options = {}): Promise<string> {
  const { budgetMs = BUDGET_MS, primaryMs = PRIMARY_MS } = opts;
  if (model === FALLBACK_MODEL) return call(model, parts, opts, budgetMs);
  const deadline = Date.now() + budgetMs;
  try {
    return await call(model, parts, opts, Math.min(primaryMs, budgetMs));
  } catch (e) {
    const left = deadline - Date.now();
    if (retryable(e) && left > 0) return call(FALLBACK_MODEL, parts, opts, left);
    throw e;
  }
}
