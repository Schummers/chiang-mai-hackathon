"use client";

// Mic capture for one turn: MediaRecorder for the audio, an AnalyserNode for the live level and auto-stop.

export const SILENCE_MS = 1500; // stop after this much quiet, once the voice was heard (TBD, spec says ~1.5 s)
export const NO_VOICE_MS = 6000; // stop if nobody speaks at all
export const MAX_MS = 30000; // hard cap (TBD)
const VOICE_LEVEL = 0.06; // normalized RMS above which we count it as voice

const MIME_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/aac", "audio/ogg;codecs=opus"];

export function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return MIME_TYPES.find((t) => MediaRecorder.isTypeSupported(t));
}

export class MicDeniedError extends Error {}

type StartOptions = { onAutoStop: () => void };

export class Recorder {
  /** Live input level, 0 to 1. Read it on animation frames. */
  level = 0;

  private stream?: MediaStream;
  private recorder?: MediaRecorder;
  private chunks: Blob[] = [];
  private ctx?: AudioContext;
  private timer?: ReturnType<typeof setInterval>;
  private starting?: Promise<void>;
  private stopping?: Promise<Blob>;

  /** Call synchronously inside the tap handler: iOS only allows audio from a user gesture. */
  unlockAudio() {
    if (!this.ctx) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (Ctx) this.ctx = new Ctx();
    }
    void this.ctx?.resume();
  }

  start(opts: StartOptions): Promise<void> {
    this.stopping = undefined;
    this.starting = this.doStart(opts);
    return this.starting;
  }

  private async doStart({ onAutoStop }: StartOptions) {
    if (!navigator.mediaDevices?.getUserMedia) throw new MicDeniedError("no mediaDevices (needs HTTPS)");
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch (e) {
      throw new MicDeniedError(String(e));
    }

    const mimeType = pickMimeType();
    this.chunks = [];
    this.recorder = new MediaRecorder(this.stream, mimeType ? { mimeType } : undefined);
    this.recorder.ondataavailable = (e) => e.data.size && this.chunks.push(e.data);
    this.recorder.start(250);

    this.watchLevel(onAutoStop);
  }

  private watchLevel(onAutoStop: () => void) {
    if (!this.ctx || !this.stream) return;
    const analyser = this.ctx.createAnalyser();
    analyser.fftSize = 1024;
    this.ctx.createMediaStreamSource(this.stream).connect(analyser);
    const buf = new Float32Array(analyser.fftSize);

    const startedAt = performance.now();
    let heardVoice = false;
    let lastVoiceAt = startedAt;
    let stopped = false;

    const tick = () => {
      analyser.getFloatTimeDomainData(buf);
      let sum = 0;
      for (const v of buf) sum += v * v;
      const rms = Math.sqrt(sum / buf.length);
      this.level = Math.min(1, rms * 6);

      const now = performance.now();
      if (this.level > VOICE_LEVEL) {
        heardVoice = true;
        lastVoiceAt = now;
      }
      const quiet = now - lastVoiceAt;
      const auto =
        (heardVoice && quiet > SILENCE_MS) || (!heardVoice && quiet > NO_VOICE_MS) || now - startedAt > MAX_MS;
      if (auto && !stopped) {
        stopped = true;
        clearInterval(this.timer);
        onAutoStop();
      }
    };
    // An interval rather than animation frames: it keeps running if the page is hidden.
    this.timer = setInterval(tick, 50);
  }

  /** Ends the recording and returns the audio. Tap and auto-stop may both call it: same result. */
  stop(): Promise<Blob> {
    this.stopping ??= this.doStop();
    return this.stopping;
  }

  private async doStop(): Promise<Blob> {
    await this.starting?.catch(() => {});
    const recorder = this.recorder;
    if (!recorder || recorder.state === "inactive") {
      this.release();
      return new Blob();
    }
    const done = new Promise<void>((resolve) => (recorder.onstop = () => resolve()));
    recorder.stop();
    await done;
    const blob = new Blob(this.chunks, { type: recorder.mimeType || "audio/webm" });
    this.release();
    return blob;
  }

  /** Drops the recording (new conversation mid-recording). */
  cancel() {
    if (this.recorder && this.recorder.state !== "inactive") this.recorder.stop();
    this.release();
  }

  private release() {
    clearInterval(this.timer);
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = undefined;
    this.recorder = undefined;
    this.level = 0;
  }
}
