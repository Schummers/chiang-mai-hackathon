import { createMockTurnService } from "./mockTurnService";
import type { TranslateInput, TranslateResult, TurnService } from "./types";

export type TurnServiceKind = "mock" | "api";

/** Client for the back-end routes (#12): POST /api/transcribe and POST /api/translate. */
export function createApiTurnService(): TurnService {
  return {
    async transcribe(audio, language) {
      const body = new FormData();
      body.append("audio", audio);
      body.append("language", language);
      const res = await fetch("/api/transcribe", { method: "POST", body });
      if (!res.ok) throw new Error(`transcribe ${res.status}`);
      const { raw } = (await res.json()) as { raw: string };
      return raw;
    },
    async translate(input: TranslateInput) {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error(`translate ${res.status}`);
      return (await res.json()) as TranslateResult;
    },
  };
}

/** Picks the turn service from config (NEXT_PUBLIC_TURN_SERVICE). Mock unless "api". */
export function createTurnService(config: string | undefined): TurnService & { kind: TurnServiceKind } {
  if (config === "api") return { kind: "api", ...createApiTurnService() };
  return { kind: "mock", ...createMockTurnService() };
}
