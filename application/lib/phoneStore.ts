"use client";

import { useSyncExternalStore } from "react";

/** One value kept on the phone, read lazily on the client, shared by every component through a hook. */
export function createPhoneStore<T>(load: () => T, save: (value: T) => void, serverValue: T) {
  let current: T | null = null;
  const listeners = new Set<() => void>();
  const store = {
    get: (): T => (current ??= load()),
    set(value: T) {
      current = value;
      save(value);
      listeners.forEach((l) => l());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  const useValue = (): T => useSyncExternalStore(store.subscribe, store.get, () => serverValue);
  return { store, useValue };
}
