"use client";

// Browser text-to-speech. Free, Thai voice built into iOS; on Android it depends on the phone.

const LOCALES: Record<string, string> = { th: "th-TH", en: "en-US", fr: "fr-FR", de: "de-DE", es: "es-ES", it: "it-IT" };

export const toLocale = (language: string) => LOCALES[language] ?? language;

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

/** Reads the text aloud. `onEnd` fires when it finishes, is stopped, or fails. */
export function speak(text: string, language: string, onEnd: () => void) {
  const s = synth();
  if (!s) return onEnd();
  s.cancel();
  const locale = toLocale(language);
  const u = new SpeechSynthesisUtterance(text);
  u.lang = locale;
  const voice = pickVoice(locale);
  if (voice) u.voice = voice;
  u.rate = language === "th" ? 0.9 : 1;
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
