"use client";

// Browser text-to-speech. Free, Thai voice built into iOS; on Android it depends on the phone.

import { findLanguage } from "./language";

const toLocale = (language: string) => findLanguage(language).locale;

const synth = () => (typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : undefined);

function pickVoice(locale: string): SpeechSynthesisVoice | undefined {
  const voices = synth()?.getVoices() ?? [];
  const lang = locale.split("-")[0];
  return (
    voices.find((v) => v.lang.replace("_", "-") === locale) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(lang))
  );
}

/** iOS only lets a page speak after a tap: speak a silent utterance inside the first mic tap. */
export function unlockSpeech() {
  const s = synth();
  if (!s) return;
  s.getVoices();
  const u = new SpeechSynthesisUtterance(" ");
  u.volume = 0;
  s.speak(u);
}

/** Reads the text aloud. `onEnd` fires when it finishes, is stopped, or fails. `rate` slows it down (Say it yourself: 0.6). */
export function speak(text: string, language: string, onEnd: () => void, rate?: number) {
  const s = synth();
  if (!s) return onEnd();
  s.cancel();
  const locale = toLocale(language);
  const u = new SpeechSynthesisUtterance(text);
  u.lang = locale;
  const voice = pickVoice(locale);
  if (voice) u.voice = voice;
  u.rate = rate ?? (language === "th" ? 0.9 : 1);
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    onEnd();
  };
  u.onend = finish;
  u.onerror = finish;
  s.speak(u);
}

export function stopSpeech() {
  synth()?.cancel();
}
