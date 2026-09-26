"use client";

import { useSyncExternalStore } from "react";
import { EMPTY_MY_INFO, type MyInfo } from "./engine/types";
import { loadMyInfo, saveMyInfo } from "./myInfo";

// One copy for the page, read lazily from the phone on the client.
let current: MyInfo | null = null;
const listeners = new Set<() => void>();

export const myInfoStore = {
  get: (): MyInfo => (current ??= loadMyInfo()),
  set(info: MyInfo) {
    current = info;
    saveMyInfo(info);
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useMyInfo(): MyInfo {
  return useSyncExternalStore(myInfoStore.subscribe, myInfoStore.get, () => EMPTY_MY_INFO);
}
