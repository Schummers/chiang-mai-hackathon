import type { UserLanguage } from "./engine/types";

export type Language = { code: UserLanguage; name: string; verb: string; stop: string };

/** The visitor's side. Thai is always the vendor's side and is not in this list. */
export const LANGUAGES: Language[] = [
  { code: "en", name: "English", verb: "Speak", stop: "Stop" },
  { code: "fr", name: "Français", verb: "Parler", stop: "Stop" },
  { code: "de", name: "Deutsch", verb: "Sprechen", stop: "Stopp" },
  { code: "es", name: "Español", verb: "Hablar", stop: "Parar" },
  { code: "it", name: "Italiano", verb: "Parla", stop: "Stop" },
  { code: "zh", name: "中文", verb: "说话", stop: "停止" },
];

const KEY = "u-mueang:language";

export const findLanguage = (code: string): Language => LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];

const browserStorage = (): Storage | undefined => {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
};

export function loadLanguage(storage = browserStorage()): UserLanguage {
  try {
    const code = storage?.getItem(KEY);
    return code && LANGUAGES.some((l) => l.code === code) ? code : "en";
  } catch {
    return "en";
  }
}

export function saveLanguage(code: UserLanguage, storage = browserStorage()) {
  try {
    storage?.setItem(KEY, code);
  } catch {
    // Blocked storage: the choice lasts for this session only.
  }
}
