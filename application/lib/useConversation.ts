"use client";

import { useState, useSyncExternalStore } from "react";
import { ConversationEngine, translateViaApi, type EngineOptions } from "./engine/engine";

/** One engine for the lifetime of the screen. Options are read through getters, so pass stores' values lazily. */
export function useConversation(opts: Omit<EngineOptions, "translate">) {
  const [engine] = useState(() => new ConversationEngine({ translate: translateViaApi, ...opts }));
  const state = useSyncExternalStore(engine.subscribe, engine.getState, engine.getState);
  return { engine, state };
}
