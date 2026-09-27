"use client";

import { createPhoneStore } from "./phoneStore";
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type Settings } from "./settings";

const { store, useValue } = createPhoneStore<Settings>(loadSettings, saveSettings, DEFAULT_SETTINGS);

export const settingsStore = store;
export const useSettings = useValue;
