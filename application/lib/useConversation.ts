"use client";

import { useState, useSyncExternalStore } from "react";
import { ConversationEngine, type EngineOptions } from "./engine/engine";
import { createTurnService } from "./engine/turnService";

/** One engine for the lifetime of the screen. Options are read through getters, so pass refs' values lazily. */
export function useConversation(opts: Omit<EngineOptions, "service">) {
  const [engine] = useState(
    () => new ConversationEngine({ service: createTurnService(process.env.NEXT_PUBLIC_TURN_SERVICE), ...opts }),
  );
  const state = useSyncExternalStore(engine.subscribe, engine.getState, engine.getState);
  return { engine, state };
}
