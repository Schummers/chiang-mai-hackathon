import { createMockTurnService } from "./mockTurnService";
import type { PhotoCard, TranslateInput, TranslateResult, TurnService } from "./types";

export type TurnServiceKind = "mock" | "api";

/** Client for the back-end routes (#12): POST /api/transcribe, /api/translate, /api/photo and /api/photo/ask. */
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
    async readPhoto(image, { userLanguage, myInfo }) {
      const body = new FormData();
      body.append("image", image, "photo.jpg");
      body.append("language", userLanguage);
      body.append("myInfo", JSON.stringify(myInfo));
      const res = await fetch("/api/photo", { method: "POST", body });
      if (!res.ok) throw new Error(`photo ${res.status}`);
      return (await res.json()) as PhotoCard;
    },
    async askPhoto(image, { question, card, userLanguage, myInfo }) {
      const body = new FormData();
      body.append("image", image, "photo.jpg");
      body.append("question", question);
      body.append("card", JSON.stringify(card));
      body.append("language", userLanguage);
      body.append("myInfo", JSON.stringify(myInfo));
      const res = await fetch("/api/photo/ask", { method: "POST", body });
      if (!res.ok) throw new Error(`photo ask ${res.status}`);
      return ((await res.json()) as { answer: string }).answer;
    },
  };
}

/** Picks the turn service from config. Mock unless "api". */
export function createTurnService(config: string | undefined): TurnService & { kind: TurnServiceKind } {
  if (config === "api") return { kind: "api", ...createApiTurnService() };
  return { kind: "mock", ...createMockTurnService() };
}

/** The one place that reads NEXT_PUBLIC_TURN_SERVICE: the UI never looks at the environment. */
export const createTurnServiceFromEnv = () => createTurnService(process.env.NEXT_PUBLIC_TURN_SERVICE);

/** The mock replays a script from any audio, so browser speech-to-text only makes sense with the real back-end. */
export const turnServiceKind = (): TurnServiceKind => (process.env.NEXT_PUBLIC_TURN_SERVICE === "api" ? "api" : "mock");
