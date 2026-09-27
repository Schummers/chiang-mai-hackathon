"use client";

import type { Languages } from "./engine/types";
import { DEFAULT_LANGUAGES, loadLanguages, saveLanguages } from "./language";
import { createPhoneStore } from "./phoneStore";

const { store, useValue } = createPhoneStore<Languages>(loadLanguages, saveLanguages, DEFAULT_LANGUAGES);

export const languagesStore = store;
export const useLanguages = useValue;
