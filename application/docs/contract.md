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
| `POST /api/transcribe` | FormData: `audio` (webm or mp4 blob, max 4 MB), `language` | `{ raw: string }` (empty string if no speech) | 413 too large, 502 provider failed |
| `POST /api/translate` | JSON `TranslateInput` | JSON `TranslateResult` | 400 empty raw, 502 provider failed |

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
| Engine, per service call | 15 s, then an error bubble with Retry (the Turn is kept) |
| Gemini call | 12 s, one fallback to flash-lite on 429 or 503 |
| Vercel function | `maxDuration = 30` |
| Recording | stop 1.5 s after the voice ends, 6 s if nobody speaks, 30 s cap, under 0.6 s dropped |

## Env vars

| Var | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_TURN_SERVICE` | client | `mock` or `api` |
| `GEMINI_API_KEY` | server only | Gemini key. `.env.local` and Vercel, never committed |
| `GEMINI_TRANSCRIBE_MODEL` | server, optional | default `gemini-3.5-flash-lite` |
| `GEMINI_TURN_MODEL` | server, optional | default `gemini-3.6-flash` |
