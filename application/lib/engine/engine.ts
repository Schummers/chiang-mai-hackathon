import {
  EMPTY_MY_INFO,
  type ErrorReason,
  type Message,
  type MyInfo,
  type Phase,
  type Speaker,
  type TranslateResult,
  type TurnService,
  type UserLanguage,
} from "./types";

export type ConversationState = {
  phase: Phase;
  messages: Message[];
  /** Bumped on every new conversation, so late answers from an old one are dropped. */
  conversationId: number;
};

export type EngineEvent =
  | { type: "MIC_TAP"; speaker: Speaker; at: number }
  | { type: "STOP"; speaker: Speaker }
  | { type: "TRANSCRIBED"; raw: string }
  | { type: "TRANSLATED"; id: string; result: TranslateResult }
  | { type: "FAILED"; speaker: Speaker; reason: ErrorReason; raw?: string }
  | { type: "RETRY" }
  | { type: "CANCEL" }
  | { type: "DISMISS_ERROR" }
  | { type: "NEW_CONVERSATION" };

export const other = (speaker: Speaker): Speaker => (speaker === "you" ? "vendor" : "you");

export const initialState = (conversationId = 0): ConversationState => ({
  phase: { kind: "idle", nextTurn: "you" },
  messages: [],
  conversationId,
});

/** Pure transition function. Events that make no sense in the current phase are ignored. */
export function reduce(state: ConversationState, event: EngineEvent): ConversationState {
  const { phase } = state;
  switch (event.type) {
    case "MIC_TAP":
      if (phase.kind === "idle" || phase.kind === "error") {
        return { ...state, phase: { kind: "listening", speaker: event.speaker, startedAt: event.at } };
      }
      return state;
    case "STOP":
      if (phase.kind === "listening" && phase.speaker === event.speaker) {
        return { ...state, phase: { kind: "processing", speaker: event.speaker } };
      }
      return state;
    case "TRANSCRIBED":
      if (phase.kind === "processing") return { ...state, phase: { ...phase, raw: event.raw } };
      return state;
    case "TRANSLATED":
      if (phase.kind !== "processing") return state;
      return {
        ...state,
        phase: { kind: "idle", nextTurn: other(phase.speaker) },
        messages: [
          ...state.messages,
          {
            id: event.id,
            speaker: phase.speaker,
            translation: event.result.translation,
            original: event.result.original,
            card: event.result.card,
          },
        ],
      };
    case "FAILED": {
      if (phase.kind === "idle") return state;
      const error = { kind: "error", speaker: event.speaker, reason: event.reason } as const;
      return { ...state, phase: event.raw ? { ...error, raw: event.raw } : error };
    }
    case "RETRY":
      if (phase.kind !== "error" || phase.reason !== "network") return state;
      return {
        ...state,
        phase: phase.raw ? { kind: "processing", speaker: phase.speaker, raw: phase.raw } : { kind: "processing", speaker: phase.speaker },
      };
    case "CANCEL":
      if (phase.kind === "listening") return { ...state, phase: { kind: "idle", nextTurn: phase.speaker } };
      return state;
    case "DISMISS_ERROR":
      if (phase.kind === "error") return { ...state, phase: { kind: "idle", nextTurn: phase.speaker } };
      return state;
    case "NEW_CONVERSATION":
      return initialState(state.conversationId + 1);
  }
}

export type EngineOptions = {
  service: TurnService;
  getMyInfo?: () => MyInfo;
  getUserLanguage?: () => UserLanguage;
  onDetectedInfo?: (info: Partial<MyInfo>) => void;
  /** A final message was added to the thread. */
  onMessage?: (message: Message) => void;
  /** Each service call fails as a network error after this long (default 15 s). */
  timeoutMs?: number;
  now?: () => number;
};

let idCounter = 0;
const newId = () => `m${Date.now().toString(36)}${(idCounter++).toString(36)}`;

/** The conversation store. The UI sends taps and audio in, and renders `getState()`. */
export class ConversationEngine {
  private state: ConversationState = initialState();
  private listeners = new Set<() => void>();

  constructor(private readonly opts: EngineOptions) {}

  getState = (): ConversationState => this.state;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  /** Starts recording for this speaker if nobody is busy. Stopping is `stop()`, once the audio is ready. */
  micTap(speaker: Speaker) {
    this.dispatch({ type: "MIC_TAP", speaker, at: (this.opts.now ?? Date.now)() });
  }

  cancel() {
    this.dispatch({ type: "CANCEL" });
  }

  fail(speaker: Speaker, reason: ErrorReason) {
    this.turn++;
    this.dispatch({ type: "FAILED", speaker, reason });
  }

  dismissError() {
    this.dispatch({ type: "DISMISS_ERROR" });
  }

  newConversation() {
    this.turn++;
    this.opts.service.reset?.();
    this.dispatch({ type: "NEW_CONVERSATION" });
  }

  /** Recording finished: transcribe, show the raw text, then translate into the final message. */
  async stop(speaker: Speaker, audio: Blob): Promise<void> {
    const { phase } = this.state;
    if (phase.kind !== "listening" || phase.speaker !== speaker) return;
    this.dispatch({ type: "STOP", speaker });
    this.lastAudio = audio;
    await this.runTurn(++this.turn, speaker, audio);
  }

  /** After a network error: same turn again, from the raw text if transcription had worked. */
  async retry(): Promise<void> {
    const { phase } = this.state;
    if (phase.kind !== "error" || phase.reason !== "network" || !this.lastAudio) return;
    this.dispatch({ type: "RETRY" });
    await this.runTurn(++this.turn, phase.speaker, this.lastAudio, phase.raw);
  }

  private lastAudio?: Blob;
  /** Bumped whenever a turn starts, fails or the conversation restarts: an answer for an older turn is dropped. */
  private turn = 0;

  private withTimeout<T>(promise: Promise<T>): Promise<T> {
    const ms = this.opts.timeoutMs ?? 15000;
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("timeout")), ms);
      promise.then(
        (v) => (clearTimeout(timer), resolve(v)),
        (e) => (clearTimeout(timer), reject(e)),
      );
    });
  }

  private async runTurn(turn: number, speaker: Speaker, audio: Blob, knownRaw?: string) {
    const conversation = this.state.conversationId;
    const stale = () => this.state.conversationId !== conversation || this.turn !== turn;
    const userLanguage = this.opts.getUserLanguage?.() ?? "en";
    let raw = knownRaw;

    try {
      if (raw === undefined) {
        raw = (await this.withTimeout(this.opts.service.transcribe(audio, speaker === "vendor" ? "th" : userLanguage))).trim();
        if (stale()) return;
        if (!raw) return this.fail(speaker, "empty");
        this.dispatch({ type: "TRANSCRIBED", raw });
      }

      const result = await this.withTimeout(
        this.opts.service.translate({
          raw,
          speaker,
          userLanguage,
          myInfo: this.opts.getMyInfo?.() ?? EMPTY_MY_INFO,
          history: this.state.messages,
        }),
      );
      if (stale()) return;
      this.dispatch({ type: "TRANSLATED", id: newId(), result });
      this.opts.onMessage?.(this.state.messages[this.state.messages.length - 1]);
      if (result.detectedInfo) this.opts.onDetectedInfo?.(result.detectedInfo);
    } catch {
      if (!stale()) this.dispatch({ type: "FAILED", speaker, reason: "network", raw });
    }
  }

  private dispatch(event: EngineEvent) {
    const next = reduce(this.state, event);
    if (next === this.state) return;
    this.state = next;
    this.listeners.forEach((l) => l());
  }
}
