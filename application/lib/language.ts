import type { LanguageCode, Languages } from "./engine/types";
import { browserStorage } from "./storage";

/** Short UI strings shown to whoever speaks that language (mic labels, hand-off, status). */
export type Language = {
  code: LanguageCode;
  name: string;
  /** English name, for the prompt. */
  english: string;
  /** Speech-to-text and text-to-speech locale. */
  locale: string;
  verb: string;
  stop: string;
  listening: string;
  turn: string;
  translating: string;
};

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", english: "English", locale: "en-US", verb: "Speak", stop: "Stop", listening: "Listening", turn: "Your turn", translating: "Translating…" },
  { code: "th", name: "ไทย", english: "Thai", locale: "th-TH", verb: "พูด", stop: "หยุด", listening: "กำลังฟัง", turn: "ตาคุณ", translating: "กำลังแปล…" },
  { code: "fr", name: "Français", english: "French", locale: "fr-FR", verb: "Parler", stop: "Stop", listening: "J'écoute", turn: "À vous", translating: "Traduction…" },
  { code: "de", name: "Deutsch", english: "German", locale: "de-DE", verb: "Sprechen", stop: "Stopp", listening: "Ich höre zu", turn: "Du bist dran", translating: "Übersetze…" },
  { code: "es", name: "Español", english: "Spanish", locale: "es-ES", verb: "Hablar", stop: "Parar", listening: "Escuchando", turn: "Te toca", translating: "Traduciendo…" },
  { code: "it", name: "Italiano", english: "Italian", locale: "it-IT", verb: "Parla", stop: "Stop", listening: "Ascolto", turn: "Tocca a te", translating: "Traduco…" },
  { code: "zh", name: "中文", english: "Chinese", locale: "zh-CN", verb: "说话", stop: "停止", listening: "正在听", turn: "轮到你了", translating: "翻译中…" },
];

export const findLanguage = (code: string): Language => LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];

export const DEFAULT_LANGUAGES: Languages = { me: "en", them: "th" };

/** Both sides can't speak the same language: picking the other side's language swaps them. */
export function pickLanguage(current: Languages, side: keyof Languages, code: LanguageCode): Languages {
  const otherSide = side === "me" ? "them" : "me";
  if (current[otherSide] === code) return { [side]: code, [otherSide]: current[side] } as Languages;
  return { ...current, [side]: code };
}

const KEY = "u-mueang:languages";
const known = (code: unknown): code is string => typeof code === "string" && LANGUAGES.some((l) => l.code === code);

export function loadLanguages(storage = browserStorage()): Languages {
  try {
    const parsed = JSON.parse(storage?.getItem(KEY) ?? "null") as Partial<Languages> | null;
    if (parsed && known(parsed.me) && known(parsed.them) && parsed.me !== parsed.them) return { me: parsed.me, them: parsed.them };
  } catch {
    // Corrupt or blocked storage: defaults.
  }
  return DEFAULT_LANGUAGES;
}

export function saveLanguages(languages: Languages, storage = browserStorage()) {
  try {
    storage?.setItem(KEY, JSON.stringify(languages));
  } catch {
    // Blocked storage: the choice lasts for this session only.
  }
}
