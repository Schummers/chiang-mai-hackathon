# UI <-> back-end contract

Source: [`lib/engine/types.ts`](../lib/engine/types.ts). If this page and the file disagree, the file wins and this page is fixed.

## TurnService

```ts
interface TurnService {
  transcribe(audio: Blob, language: string): Promise<string>; // "th" for the Vendor, the Visitor's language otherwise
  translate(input: TranslateInput): Promise<TranslateResult>;
  reset?(): void;                                              // new conversation
}
```

Picked once by `NEXT_PUBLIC_TURN_SERVICE` in [`turnService.ts`](../lib/engine/turnService.ts): `mock` (default) or `api`. It is the only place that reads it.

## HTTP routes (api mode)

| Route | Request | Response | Errors |
|---|---|---|---|
| `POST /api/transcribe` | FormData: `audio` (webm or mp4 blob, max 4 MB), `language` | `{ raw: string }`. Missing or empty audio returns `{ raw: "" }` with 200, same as no speech | 413 too large, 502 provider failed **or `GEMINI_API_KEY` missing** |
| `POST /api/translate` | JSON `TranslateInput` (`raw` cut to 2000 chars) | JSON `TranslateResult` | 400 empty raw, 502 provider failed or key missing, 500 on a malformed JSON body |

`TranslateInput`: `{ raw, speaker: "you" | "vendor", userLanguage, myInfo, history: Message[] }`. The route keeps the last 6 Turns of history for the prompt.

`TranslateResult`:
- `translation: string[]`: what the reader of the bubble reads. Thai for the Visitor's Turns, the Visitor's language for the Vendor's.
- `original: string[]`: what was said, cleaned up, same items.
- `card: ContextCard | null`: at most one per Turn.
- `detectedInfo?: Partial<MyInfo>`: allergies, spice or diet the Visitor said aloud, to pre-tick My info.

`ContextCard`: `kind` (`dish` | `word` | `moment`, missing = dish), `offGuide`, `name`, `nameThai`, `description`, `meat`, `spice` (0 to 3), `localDetail`, `warning`. A warning is a risk to check, never a guarantee.

`MyInfo`: `allergies` (peanuts, shellfish, gluten, other), `spice` (none, mild, thai-hot), `diet` (no-pork, vegetarian, halal).

## Timeouts and limits

| Where | Value |
|---|---|
| Engine, per service call | 15 s, then an error bubble with Retry (the Turn is kept) (`lib/engine/engine.ts`) |
| Gemini request | 13 s total budget, fallback included. Main model gets 8 s, then one fallback to flash-lite on 429, 503 or timeout, with the time left (`lib/server/gemini.ts`) |
| Vercel function | `maxDuration = 30` |
| Recording | stop 1.5 s after the voice ends, 6 s if nobody speaks, 30 s cap (`lib/recorder.ts`); under 0.6 s dropped (`MIN_RECORDING_MS` in `components/Conversation.tsx`) |

## Env vars

| Var | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_TURN_SERVICE` | client | `mock` or `api` |
| `GEMINI_API_KEY` | server only | Gemini key. `.env.local` and Vercel, never committed |
| `GEMINI_TRANSCRIBE_MODEL` | server, optional | default `gemini-3.5-flash-lite` |
| `GEMINI_TURN_MODEL` | server, optional | default `gemini-3.6-flash` |

## Run and test the real back-end

Locally: in `application/.env.local`, set `NEXT_PUBLIC_TURN_SERVICE=api` and `GEMINI_API_KEY=...`, then `npm run dev`. Without the key both routes answer 502.

```bash
curl -s localhost:3000/api/translate -H 'content-type: application/json' -d '{"raw":"uh which curry is not spicy, I am allergic to peanuts","speaker":"you","userLanguage":"en","myInfo":{"allergies":[],"spice":null,"diet":[]},"history":[]}'
```

```bash
curl -s localhost:3000/api/transcribe -F audio=@clip.webm -F language=th
```

## Back to the mock in production (demo backup)

Production reads `NEXT_PUBLIC_TURN_SERVICE` at build time. To fall back: Vercel project `u-mueang` > Settings > Environment Variables, set it to `mock`, then redeploy (about 1 to 2 min). There is no URL flag yet (#13).
