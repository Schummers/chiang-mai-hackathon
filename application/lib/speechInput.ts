"use client";

// Speech-to-text in the browser (Chrome's Web Speech API; Safari has it too, through Siri). No audio leaves
// through our server: the browser sends it to its own recogniser and hands back text.

import { MAX_MS, NO_VOICE_MS, SILENCE_MS } from "./recorder";

type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: (() => void) | null;
  onresult: ((e: { results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  onsoundstart: (() => void) | null;
  onsoundend: (() => void) | null;
};

type RecognitionCtor = new () => Recognition;

const ctor = (): RecognitionCtor | undefined => {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};

export const speechInputSupported = () => ctor() !== undefined;

/** Thai is written without spaces between words; recognisers often put one there. */
const THAI_GAP = /(?<=[฀-๿]) (?=[฀-๿])/g;

export class SpeechDeniedError extends Error {}

type StartOptions = {
  /** BCP 47 locale, e.g. "th-TH". */
  lang: string;
  /** Live text while the person speaks. */
  onInterim?: (text: string) => void;
  /** The recogniser decided the person stopped (silence, no voice, cap, or it ended by itself). */
  onAutoStop: () => void;
};

export class SpeechInput {
  /** Pseudo level 0 to 1 for the wave: the recogniser gives no audio, only "sound" and results. */
  get level() {
    if (!this.rec) return 0;
    const sinceResult = performance.now() - this.lastResultAt;
    if (sinceResult < 250) return 0.45 + Math.random() * 0.4;
    if (this.sound) return 0.12 + Math.random() * 0.25;
    return 0.02;
  }

  /** The recogniser could not work at all (no service, blocked, language missing): use another input. */
  broken = false;

  private rec?: Recognition;
  private finalText = "";
  private interimText = "";
  private sound = false;
  private lastResultAt = 0;
  private timer?: ReturnType<typeof setInterval>;
  private ended?: Promise<void>;
  private stopping?: Promise<string>;
  private session = 0;

  /** Resolves once listening, rejects with SpeechDeniedError when the mic or the service is refused. */
  start({ lang, onInterim, onAutoStop }: StartOptions): Promise<void> {
    const Ctor = ctor();
    if (!Ctor) return Promise.reject(new SpeechDeniedError("no SpeechRecognition"));
    this.release();
    const session = ++this.session;
    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    this.rec = rec;
    this.finalText = "";
    this.interimText = "";
    this.stopping = undefined;
    const startedAt = performance.now();
    let heard = false;
    let auto = false;
    const autoStop = () => {
      if (auto || session !== this.session) return;
      auto = true;
      onAutoStop();
    };

    let resolveEnd!: () => void;
    this.ended = new Promise<void>((r) => (resolveEnd = r));

    return new Promise<void>((resolve, reject) => {
      let started = false;
      rec.onstart = () => {
        started = true;
        this.lastResultAt = 0;
        resolve();
      };
      rec.onsoundstart = () => (this.sound = true);
      rec.onsoundend = () => (this.sound = false);
      rec.onresult = (e) => {
        let final = "";
        let interim = "";
        for (let i = 0; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) final += r[0].transcript;
          else interim += r[0].transcript;
        }
        this.finalText = final;
        this.interimText = interim;
        heard = heard || (final + interim).trim().length > 0;
        this.lastResultAt = performance.now();
        onInterim?.(this.text());
      };
      rec.onerror = (e) => {
        if (e.error === "network" || e.error === "service-not-allowed" || e.error === "language-not-supported") this.broken = true;
        if (!started && (e.error === "not-allowed" || e.error === "service-not-allowed" || e.error === "audio-capture")) {
          reject(new SpeechDeniedError(e.error));
        }
      };
      rec.onend = () => {
        resolveEnd();
        // Ended at once without hearing anything: a recogniser with no service behind it (Electron, some Chromium forks).
        if (!heard && performance.now() - startedAt < 500) this.broken = true;
        if (!started) reject(new SpeechDeniedError("ended before start"));
        // The recogniser gave up on its own (Android ends after a pause): same as an auto-stop.
        autoStop();
      };
      this.timer = setInterval(() => {
        const now = performance.now();
        const quiet = now - (this.lastResultAt || startedAt);
        if ((heard && quiet > SILENCE_MS) || (!heard && quiet > NO_VOICE_MS) || now - startedAt > MAX_MS) autoStop();
      }, 100);
      try {
        rec.start();
      } catch (err) {
        reject(new SpeechDeniedError(String(err)));
      }
    });
  }

  /** Ends listening and returns what was said. Tap and auto-stop may both call it: same result. */
  stop(): Promise<string> {
    this.stopping ??= this.doStop();
    return this.stopping;
  }

  private async doStop(): Promise<string> {
    const rec = this.rec;
    if (!rec) return "";
    clearInterval(this.timer);
    this.session++; // the `end` this stop causes is not an auto-stop
    try {
      rec.stop();
    } catch {
      // Already stopped.
    }
    // The last final result arrives just before `end`; don't wait forever for a recogniser that hangs.
    await Promise.race([this.ended, new Promise((r) => setTimeout(r, 1500))]);
    const text = this.text();
    this.release();
    return text;
  }

  cancel() {
    this.session++;
    try {
      this.rec?.abort();
    } catch {
      // Already stopped.
    }
    this.release();
  }

  private text() {
    return `${this.finalText} ${this.interimText}`.replace(/\s+/g, " ").trim().replace(THAI_GAP, "");
  }

  private release() {
    clearInterval(this.timer);
    if (this.rec) {
      this.rec.onresult = this.rec.onerror = this.rec.onend = this.rec.onstart = null;
      this.rec.onsoundstart = this.rec.onsoundend = null;
    }
    this.rec = undefined;
    this.sound = false;
  }
}
