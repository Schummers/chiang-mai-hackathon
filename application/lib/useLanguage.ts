"use client";

import { useSyncExternalStore } from "react";
import type { UserLanguage } from "./engine/types";
import { loadLanguage, saveLanguage } from "./language";

let current: UserLanguage | null = null;
const listeners = new Set<() => void>();

export const languageStore = {
  get: (): UserLanguage => (current ??= loadLanguage()),
  set(code: UserLanguage) {
    current = code;
    saveLanguage(code);
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useLanguage(): UserLanguage {
  return useSyncExternalStore(languageStore.subscribe, languageStore.get, () => "en");
}
