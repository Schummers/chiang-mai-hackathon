const API = "https://api.anthropic.com/v1/messages";

export const TURN_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";
/** Used once when the main model is overloaded (529), rate limited (429) or fails before streaming anything. */
export const FALLBACK_MODEL = process.env.ANTHROPIC_FALLBACK_MODEL ?? "claude-haiku-4-5-20251001";

/** No first byte after this long: give up on this model. */
const FIRST_BYTE_MS = 6_000;
/** Whole stream, first byte included. */
const TOTAL_MS = 20_000;

export class AnthropicError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export type Tool = { name: string; description: string; strict?: boolean; input_schema: object };

type Options = {
  /** Stable prompt, cached by Anthropic across Turns. */
  system: string;
  /** The one tool the model must call: its input is the structured answer. */
  tool: Tool;
  maxTokens?: number;
  /** Called with the tool input JSON accumulated so far, on every streamed chunk. */
  onPartial?: (json: string) => void;
};

type StreamEvent =
  | { type: "message_start"; message: { usage: object } }
  | { type: "content_block_delta"; delta: { type: string; partial_json?: string } }
  | { type: "message_delta"; usage: object }
  | { type: "error"; error: { type: string; message: string } }
  | { type: string };

async function stream(model: string, user: string, { system, tool, maxTokens = 1200, onPartial }: Options): Promise<unknown> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new AnthropicError(500, "ANTHROPIC_API_KEY is not set");
  const abort = new AbortController();
  const firstByte = setTimeout(() => abort.abort(new DOMException("first byte", "TimeoutError")), FIRST_BYTE_MS);
  const total = setTimeout(() => abort.abort(new DOMException("total", "TimeoutError")), TOTAL_MS);
  let json = "";
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      signal: abort.signal,
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        stream: true,
        system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
        tools: [tool],
        tool_choice: { type: "tool", name: tool.name },
        messages: [{ role: "user", content: user }],
      }),
    });
    if (!res.ok || !res.body) throw new AnthropicError(res.status, `${model} ${res.status}: ${(await res.text()).slice(0, 300)}`);
    clearTimeout(firstByte);

    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = "";
    const usage: Record<string, unknown> = {};
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const event = JSON.parse(line.slice(6)) as StreamEvent;
        if (event.type === "error" && "error" in event) throw new AnthropicError(529, `${model}: ${event.error.message}`);
        if (event.type === "message_start" && "message" in event) Object.assign(usage, event.message.usage);
        if (event.type === "message_delta" && "usage" in event) Object.assign(usage, event.usage);
        if (event.type === "content_block_delta" && "delta" in event && event.delta.partial_json) {
          json += event.delta.partial_json;
          onPartial?.(json);
        }
      }
    }
    console.info("anthropic", model, JSON.stringify(usage));
    if (!json) throw new AnthropicError(502, `${model}: no ${tool.name} input`);
    return JSON.parse(json);
  } catch (e) {
    // Anything already streamed can't be taken back: don't let the caller retry on another model.
    if (json) throw Object.assign(e instanceof Error ? e : new Error(String(e)), { streamed: true });
    throw e;
  } finally {
    clearTimeout(firstByte);
    clearTimeout(total);
  }
}

const retryable = (e: unknown) =>
  !(e as { streamed?: boolean }).streamed &&
  ((e instanceof AnthropicError && (e.status === 529 || e.status === 429 || e.status >= 500)) ||
    (e instanceof Error && e.name === "TimeoutError"));

/** Streams the main model's forced tool call, falling back once to the other model if it fails before any output. */
export async function streamTool(user: string, opts: Options): Promise<unknown> {
  try {
    return await stream(TURN_MODEL, user, opts);
  } catch (e) {
    if (TURN_MODEL !== FALLBACK_MODEL && retryable(e)) {
      console.warn("anthropic fallback", e instanceof Error ? e.message : e);
      return await stream(FALLBACK_MODEL, user, opts);
    }
    throw e;
  }
}
