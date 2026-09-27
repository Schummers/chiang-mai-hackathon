# UI <-> back-end contract

Source: [`lib/engine/types.ts`](../lib/engine/types.ts). If this page and the file disagree, the file wins and this page is fixed.

## Engine

`ConversationEngine` (`lib/engine/engine.ts`), created once per screen by `useConversation`:

- `micTap(side)`, `cancel()`, `fail(side, reason)`, `dismissError()`, `newConversation()`
- `heard(side, transcript)`: listening ended. Sound tags (`<noise>`, `[Music]`) are stripped; if nothing is left, the result is the `empty` error.
- `say(side, text)`: a Turn from text (a context card's suggestion), from `idle` or `error`.
- `retry()`: after a network error, sends the same `heard` again.

`Phase`: `idle { nextTurn }` | `listening { side, startedAt }` | `processing { side, heard }` | `error { side, reason, heard? }`. The `reason` is one of `mic-denied`, `no-speech-api`, `network` or `empty`.

`Message`: `{ id, side, heard, original, translation, cards }`.

## HTTP routes

| Route | Request | Response | Errors |
|---|---|---|---|
| `POST /api/translate` | JSON `TranslateInput` | NDJSON stream of `TranslateEvent` | 400 empty `heard`; model failures arrive in-stream as `{"type":"error"}` |
| `POST /api/places` | JSON `{ lat, lng, accuracy }` | JSON `NearbyPlaces` | 400 bad position, 502 Google failed or `GOOGLE_MAPS_API_KEY` missing |

`TranslateInput`: `{ side, heard, languages: { me, them }, history: HistoryTurn[], context: TurnContext, options: { cards, pack } }`

- `context.profile?`: `{ allergies, spice, diet, particle? }`. With About you off, the client still sends the particle.
- `context.notes?`: free text, max 1000 chars.
- `context.places?`: `{ accuracyM, food, markets }`, each list nearest first.
- `context.time?`: `{ now: ISO, timeZone: IANA }`.
- `history`: the last 10 messages as `{ side, original, translation, cards?: [{ heading }] }`.

`TranslateEvent` (one JSON object per line):

- `{"type":"text","original","translation"}`: sent once, as soon as the model has finished the translation field.
- `{"type":"done","result":{ original, translation, cards }}`: the full answer.
- `{"type":"error"}`: the model failed. If `text` already arrived, the engine ignores the error (the message stays, without cards).

`ContextCard`: `{ heading, headingThai?, body, suggestion? }`, in the owner's language, at most 2 per Turn. `headingThai` is dropped when the owner reads Thai.

## Env

| Var | Where | Needed for |
|---|---|---|
| `ANTHROPIC_API_KEY` | server | `/api/translate` |
| `GOOGLE_MAPS_API_KEY` | server | `/api/places` (Places API (New) enabled) |
| `ANTHROPIC_MODEL`, `ANTHROPIC_FALLBACK_MODEL` | server, optional | defaults `claude-sonnet-5`, `claude-haiku-4-5-20251001` |
