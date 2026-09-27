const API = "https://api.anthropic.com/v1/messages";

export const TURN_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";
/** Used once when the main model is overloaded (529), rate limited (429) or too slow. */
export const FALLBACK_MODEL = process.env.ANTHROPIC_FALLBACK_MODEL ?? "claude-haiku-4-5-20251001";

/** Whole request, fallback included. Under the engine's 15 s per call (lib/engine/engine.ts), so an answer can still land. */
const BUDGET_MS = 13_000;
const PRIMARY_MS = 9_000;

export class AnthropicError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export type Tool = { name: string; description: string; input_schema: object };

type Options = {
  /** Stable prompt, cached by Anthropic across Turns. */
  system: string;
  /** The one tool the model must call: its input is the structured answer. */
  tool: Tool;
  maxTokens?: number;
};

async function call(model: string, user: string, { system, tool, maxTokens = 1500 }: Options, timeoutMs: number): Promise<unknown> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new AnthropicError(500, "ANTHROPIC_API_KEY is not set");
  const res = await fetch(API, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    signal: AbortSignal.timeout(timeoutMs),
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      tools: [tool],
      tool_choice: { type: "tool", name: tool.name },
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) throw new AnthropicError(res.status, `${model} ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = (await res.json()) as { content?: { type: string; name?: string; input?: unknown }[] };
  const use = json.content?.find((c) => c.type === "tool_use" && c.name === tool.name);
  if (!use) throw new AnthropicError(502, `${model}: no ${tool.name} call`);
  return use.input;
}

const retryable = (e: unknown) =>
  (e instanceof AnthropicError && (e.status === 529 || e.status === 429 || e.status >= 500)) ||
  (e instanceof Error && e.name === "TimeoutError");

/** Calls the main model, then the fallback once if it fails or is too slow, all within one budget. */
export async function callTool(user: string, opts: Options): Promise<unknown> {
  const deadline = Date.now() + BUDGET_MS;
  try {
    return await call(TURN_MODEL, user, opts, TURN_MODEL === FALLBACK_MODEL ? BUDGET_MS : PRIMARY_MS);
  } catch (e) {
    const left = deadline - Date.now();
    if (TURN_MODEL !== FALLBACK_MODEL && retryable(e) && left > 500) return call(FALLBACK_MODEL, user, opts, left);
    throw e;
  }
}
