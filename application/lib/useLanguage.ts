"use client";

import type { UserLanguage } from "./engine/types";
import { loadLanguage, saveLanguage } from "./language";
import { createPhoneStore } from "./phoneStore";

const { store, useValue } = createPhoneStore<UserLanguage>(loadLanguage, saveLanguage, "en");

export const languageStore = store;
export const useLanguage = useValue;
