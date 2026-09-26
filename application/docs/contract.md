# UI <-> back-end contract

Source: [`lib/engine/types.ts`](../lib/engine/types.ts). If this page and the file disagree, the file wins and this page is fixed.

## TurnService

```ts
interface TurnService {
  transcribe(audio: Blob, language: string): Promise<string>; // "th" for the Vendor, the Visitor's language otherwise
  translate(input: TranslateInput): Promise<TranslateResult>;
  readPhoto?(image: Blob, input: ReadPhotoInput): Promise<PhotoCard>; // photo Turn; missing = the read fails as a network error
  reset?(): void;                                              // new conversation
}
```

`readPhoto`: in api mode it posts to `POST /api/photo`. The mock returns a menu card first, then a dish, a fruit and a sign in turn (`MOCK_PHOTO_CARDS`), so every card can be seen.

Picked once by `NEXT_PUBLIC_TURN_SERVICE` in [`turnService.ts`](../lib/engine/turnService.ts): `mock` (default) or `api`. It is the only place that reads it.

## HTTP routes (api mode)

| Route | Request | Response | Errors |
|---|---|---|---|
| `POST /api/transcribe` | FormData: `audio` (webm or mp4 blob, max 4 MB), `language` | `{ raw: string }`. Missing or empty audio returns `{ raw: "" }` with 200, same as no speech. The engine also drops sound tags (`<noise>`, `[Music]`, `(silence)`…) and treats what is left empty as no speech | 413 too large, 502 provider failed **or `GEMINI_API_KEY` missing** |
| `POST /api/photo` | FormData: `image` (JPEG, the UI downscales to 1280px, max 4 MB), `language`, `myInfo` (JSON) | JSON `PhotoCard`. A malformed or empty model answer still returns 200 with a Sign card "Couldn't read this photo" | 400 no image, 413 too large, 502 provider failed **or `GEMINI_API_KEY` missing** |
| `POST /api/translate` | JSON `TranslateInput` (`raw` cut to 2000 chars) | JSON `TranslateResult` | 400 empty raw, 502 provider failed or key missing, 500 on a malformed JSON body |

`TranslateInput`: `{ raw, speaker: "you" | "vendor", userLanguage, myInfo, history: Message[] }`. The route keeps the last 6 Turns of history for the prompt.

`TranslateResult`:
- `translation: string[]`: what the reader of the bubble reads. Thai for the Visitor's Turns, the Visitor's language for the Vendor's.
- `original: string[]`: what was said, cleaned up, same items.
- `card: ContextCard | null`: at most one per Turn.
- `romanised?: string[]`: Visitor's Turns only, syllable phonetics of each Thai item (e.g. "a-ròi mâak kráp"), same Gemini call. Feeds the Say it yourself sheet; the mock returns it too. Carried onto `Message.romanised`.
- `detectedInfo?: Partial<MyInfo>`: allergies, spice or diet the Visitor said aloud, to pre-tick My info.
- `stage?: Stage`: where the conversation is (`start`, `explore`, `decide`, `receive`, `pay`, `leave`, `vendor-used-northern-word`). Given by the model; the first Turn is always `start`.
- `card` is only sent when it carries an allergy or diet warning (the Allergy Flag); informative cards are retired.
- `move?: MoveCard | null`: at most one Move, picked by `pickMove` in [`lib/context/moves.ts`](../lib/context/moves.ts) and filled from the Context Pack, never written by the model. Null when the card carries an allergy or diet flag. The engine keeps it on the `Message`, so a Move is never offered twice in a conversation.

`MoveCard`: `id`, `type` (`say` | `ask` | `echo`), `stage`, `english`, `centralThai`, `khamMueang` (null when the Move has none), `romanised: { central, khamMueang }`, `tone?: "playful"`, `heard?` (Echo: the Northern word the Vendor said), `heardMeaning?` (Echo: what it means, e.g. "20"). The particle variant is already picked.

`ContextCard`: `kind` (`dish` | `word` | `moment`, missing = dish), `offGuide`, `name`, `nameThai`, `description`, `meat`, `spice` (0 to 3), `localDetail`, `warning`. A warning is a risk to check, never a guarantee.

## Photo Turn

`engine.photo(image)` works from `idle` or `error`. The engine makes a local object URL, goes to `{ kind: "reading", startedAt, photo: { id, url } }` (show `photo.url` full width meanwhile), calls `readPhoto(image, { userLanguage, myInfo })`, then goes back to `idle` (next Turn: `you`) and adds a message.

- Photo message: `speaker: "you"`, `translation: []`, `original: [card.title]` (what the history shows the model), `card: null`, `photo: { url, card: PhotoCard }`.
- Failed or timed-out read: `{ kind: "error", speaker: "you", reason: "network", photo }`. `retry()` reads the same image again. Dismissing it, tapping a mic or taking another photo drops that photo and revokes its URL.
- New conversation revokes every photo URL. A late read from an old conversation is ignored.
- `onMessage` is not called for a photo (nothing to read aloud).

Menu `items[].note` is a short pill label ("Mild ok", "Local"), not a sentence. A pill turns into a conflict only when `warning` names something in My info (the UI checks, see `lib/photoCard.ts`). A card with no title and no description, or a menu with no items, is shown as a Sign card "Couldn't read this photo".

`PhotoCard`: `kind` (`menu` | `dish` | `produce` | `sign`), `title`, `titleThai?`, `description`, `items?` (menu only: `name`, `nameThai?`, `note?`, `warning?` from My info), and the `ContextCard` fields that fit: `meat?`, `spice?`, `localDetail?`, `warning?`.

`MyInfo`: `allergies` (peanuts, shellfish, gluten, other), `spice` (none, mild, thai-hot), `diet` (no-pork, vegetarian, halal), `particle?` (`m` | `f`, the particle used in Moves, missing = `m`; `particleOf` normalises it and still reads the old key `speaker`).

## Timeouts and limits

| Where | Value |
|---|---|
| Engine, per service call (photo read included) | 15 s, then an error bubble with Retry (the Turn is kept) (`lib/engine/engine.ts`) |
| Gemini request | 13 s total budget, fallback included. Main model gets 8 s, then one fallback to flash-lite on 429, 503 or timeout, with the time left (`lib/server/gemini.ts`) |
| Vercel function | `maxDuration = 30` (all three routes) |
| Photo read | same Gemini budget (13 s, main model 8 s then flash-lite). Measured locally on a menu image: ~2.3 s on `gemini-3.6-flash`, with rare stalls over 10 s on both models |
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
