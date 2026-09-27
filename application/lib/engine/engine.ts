import type { ErrorReason, HistoryTurn, Message, Phase, Side, TranslateEvent, TranslateInput, TranslateResult } from "./types";

export type ConversationState = {
  phase: Phase;
  messages: Message[];
  /** Bumped on every new conversation, so late answers from an old one are dropped. */
  conversationId: number;
};

export type EngineEvent =
  | { type: "MIC_TAP"; side: Side; at: number }
  /** Speech-to-text finished, or a suggestion was tapped: `heard` goes to the model. */
  | { type: "HEARD"; side: Side; heard: string }
  /** The translation is ready: the message joins the thread and the turn passes, cards may follow. */
  | { type: "TRANSLATED"; id: string; result: TranslateResult }
  /** The full answer for a message already in the thread (its cards). */
  | { type: "COMPLETED"; id: string; result: TranslateResult }
  | { type: "FAILED"; side: Side; reason: ErrorReason; heard?: string }
  | { type: "RETRY" }
  | { type: "CANCEL" }
  | { type: "DISMISS_ERROR" }
  | { type: "NEW_CONVERSATION" };

export const other = (side: Side): Side => (side === "me" ? "them" : "me");

export const initialState = (conversationId = 0): ConversationState => ({
  phase: { kind: "idle", nextTurn: "me" },
  messages: [],
  conversationId,
});

const canStart = (phase: Phase) => phase.kind === "idle" || phase.kind === "error";

/** Pure transition function. Events that make no sense in the current phase are ignored. */
export function reduce(state: ConversationState, event: EngineEvent): ConversationState {
  const { phase } = state;
  switch (event.type) {
    case "MIC_TAP":
      return canStart(phase) ? { ...state, phase: { kind: "listening", side: event.side, startedAt: event.at } } : state;
    case "HEARD":
      if ((phase.kind === "listening" && phase.side === event.side) || canStart(phase)) {
        return { ...state, phase: { kind: "processing", side: event.side, heard: event.heard } };
      }
      return state;
    case "TRANSLATED":
      if (phase.kind !== "processing") return state;
      return {
        ...state,
        phase: { kind: "idle", nextTurn: other(phase.side) },
        messages: [...state.messages, { id: event.id, side: phase.side, heard: phase.heard, ...event.result }],
      };
    case "COMPLETED":
      if (!state.messages.some((m) => m.id === event.id)) return state;
      return { ...state, messages: state.messages.map((m) => (m.id === event.id ? { ...m, ...event.result } : m)) };
    case "FAILED":
      if (phase.kind === "idle") return state;
      return { ...state, phase: { kind: "error", side: event.side, reason: event.reason, ...(event.heard && { heard: event.heard }) } };
    case "RETRY":
      if (phase.kind !== "error" || !phase.heard) return state;
      return { ...state, phase: { kind: "processing", side: phase.side, heard: phase.heard } };
    case "CANCEL":
      return phase.kind === "listening" ? { ...state, phase: { kind: "idle", nextTurn: phase.side } } : state;
    case "DISMISS_ERROR":
      return phase.kind === "error" ? { ...state, phase: { kind: "idle", nextTurn: phase.side } } : state;
    case "NEW_CONVERSATION":
      return initialState(state.conversationId + 1);
  }
}

export type TranslatedText = Pick<TranslateResult, "original" | "translation">;

export type EngineOptions = {
  /** Resolves with the full answer; calls `onText` as soon as the translation is ready, if it streams. */
  translate: (input: TranslateInput, onText: (text: TranslatedText) => void) => Promise<TranslateResult>;
  /** Languages, context and switches, read at the start of each translation. */
  getInput: () => Omit<TranslateInput, "side" | "heard" | "history">;
  /** A message was added to the thread. */
  onMessage?: (message: Message) => void;
  /** A translation fails as a network error after this long. */
  timeoutMs?: number;
  now?: () => number;
};

/** The model sees the last few Turns; older ones rarely help and cost latency. */
const HISTORY_TURNS = 10;

let idCounter = 0;
const newId = () => `m${Date.now().toString(36)}${(idCounter++).toString(36)}`;

/** Speech-to-text tags for sounds, not words (`<noise>`, `[Music]`): never translate them. */
const NON_SPEECH = /[<[(]\s*(noise|music|silence|inaudible|blank_audio|laughter|applause|sound)[^>\])]*[>\])]/gi;
export const stripNonSpeech = (raw: string) => raw.replace(NON_SPEECH, "").trim();

export function toHistory(messages: Message[]): HistoryTurn[] {
  return messages.slice(-HISTORY_TURNS).map((m) => ({
    side: m.side,
    original: m.original,
    translation: m.translation,
    ...(m.cards.length && { cards: m.cards.map((c) => ({ heading: c.heading })) }),
  }));
}

/** The conversation store. The UI sends taps and transcripts in, and renders `getState()`. */
export class ConversationEngine {
  private state: ConversationState = initialState();
  private listeners = new Set<() => void>();
  /** Bumped whenever a turn starts, fails or the conversation restarts: an answer for an older turn is dropped. */
  private turn = 0;

  constructor(private readonly opts: EngineOptions) {}

  getState = (): ConversationState => this.state;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  micTap(side: Side) {
    this.dispatch({ type: "MIC_TAP", side, at: (this.opts.now ?? Date.now)() });
  }

  cancel() {
    this.dispatch({ type: "CANCEL" });
  }

  fail(side: Side, reason: ErrorReason) {
    this.turn++;
    this.dispatch({ type: "FAILED", side, reason });
  }

  dismissError() {
    this.dispatch({ type: "DISMISS_ERROR" });
  }

  newConversation() {
    this.turn++;
    this.dispatch({ type: "NEW_CONVERSATION" });
  }

  /** Listening ended with this transcript. */
  async heard(side: Side, transcript: string): Promise<void> {
    const { phase } = this.state;
    if (phase.kind !== "listening" || phase.side !== side) return;
    const heard = stripNonSpeech(transcript);
    if (!heard) return this.fail(side, "empty");
    this.dispatch({ type: "HEARD", side, heard });
    await this.run(++this.turn);
  }

  /** A Turn from text (a context card's suggestion): corrected and translated like a spoken one. */
  async say(side: Side, text: string): Promise<void> {
    const heard = text.trim();
    if (!heard || !canStart(this.state.phase)) return;
    this.dispatch({ type: "HEARD", side, heard });
    await this.run(++this.turn);
  }

  async retry(): Promise<void> {
    const { phase } = this.state;
    if (phase.kind !== "error" || !phase.heard) return;
    this.dispatch({ type: "RETRY" });
    await this.run(++this.turn);
  }

  private async run(turn: number) {
    const { phase, conversationId, messages } = this.state;
    if (phase.kind !== "processing") return;
    const stale = () => this.state.conversationId !== conversationId || this.turn !== turn;
    const id = newId();
    let shown = false;
    const show = (result: TranslateResult) => {
      if (shown || stale()) return;
      shown = true;
      this.dispatch({ type: "TRANSLATED", id, result });
      this.opts.onMessage?.(this.state.messages[this.state.messages.length - 1]);
    };
    try {
      const input = { side: phase.side, heard: phase.heard, history: toHistory(messages), ...this.opts.getInput() };
      const result = await this.withTimeout(this.opts.translate(input, (text) => show({ ...text, cards: [] })));
      // Once shown, the message belongs to the thread: its cards still land after the next turn has started.
      if (shown) {
        if (this.state.conversationId === conversationId) this.dispatch({ type: "COMPLETED", id, result });
      } else show(result);
    } catch {
      // Cards that never arrive are not an error: the translation is already there.
      if (!shown && !stale()) this.dispatch({ type: "FAILED", side: phase.side, reason: "network", heard: phase.heard });
    }
  }

  private withTimeout<T>(promise: Promise<T>): Promise<T> {
    const ms = this.opts.timeoutMs ?? 20_000;
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("timeout")), ms);
      promise.then(
        (v) => (clearTimeout(timer), resolve(v)),
        (e) => (clearTimeout(timer), reject(e)),
      );
    });
  }

  private dispatch(event: EngineEvent) {
    const next = reduce(this.state, event);
    if (next === this.state) return;
    this.state = next;
    this.listeners.forEach((l) => l());
  }
}

/** Client for POST /api/translate, which streams newline-delimited TranslateEvents. */
export async function translateViaApi(input: TranslateInput, onText: (text: TranslatedText) => void): Promise<TranslateResult> {
  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok || !res.body) throw new Error(`translate ${res.status}`);
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      const event = JSON.parse(line) as TranslateEvent;
      if (event.type === "text") onText(event);
      else if (event.type === "done") return event.result;
      else throw new Error("translate failed");
    }
  }
  throw new Error("translate ended early");
}
