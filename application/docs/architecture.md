# Architecture

Next.js 16 (App Router) + React 19 + TypeScript, deployed on Vercel (project `u-mueang`, root directory `application`). No database: everything the owner saves lives on the phone (localStorage). Product brief: [`../context.md`](../context.md).

## People

- **me / the owner**: set the app up. Their mic is on the right, their language is "Your language". They can be a visitor or a shopkeeper.
- **them / the other person**: across the counter. Their mic is on the left.

Any language pair from `lib/language.ts` works. Thai can be on either side.

## One Turn, end to end

```
Dock (mic tap, side = me | them)
  -> SpeechInput (lib/speechInput.ts)            Web Speech API, locale of that side's language, live interim text,
                                                 auto-stop after 1.8 s of quiet
  -> ConversationEngine.heard(side, text)        idle -> listening -> processing (lib/engine/engine.ts)
  -> POST /api/translate (NDJSON stream)
       systemPrompt(options)                     static rules + the Northern Thai guide, cached by Anthropic
       turnPrompt(...)                           tagged context blocks + conversation + transcript (lib/server/prompt.ts)
       streamTool -> Claude, strict submit_turn  { original, translation, cards } (lib/server/anthropic.ts)
       -> {"type":"text"} as soon as "translation" is complete
       -> {"type":"done"} with the cards
  <- "text": message added, turn passes, the owner's message is read aloud in the other person's language
  <- "done": cards attach under that message (even if the next Turn already started)
```

A context card's suggestion goes through `engine.say("me", text)`: it follows the same path without the mic.

### The model's job

1. **Correct** the transcript into what was most plausibly said. Thai goes through a Central Thai recognizer that does not know Kham Mueang. The prompt lists Northern sound shifts and common mishearings, and the guide gives local vocabulary.
2. **Translate** the corrected utterance into the listener's language, in the speaker's voice.
3. Optionally write up to 2 **context cards** for the owner, in the owner's language: a heading, 2 sentences and a suggested follow-up. Allergy or diet risks are also raised as cards.

The bubble shows the translation (big), the corrected original (small) and, when correction changed it, what the mic heard (tiny, with an ear icon).

### Context blocks (user message, each introduced by what it is)

| Block | Source | Switch |
|---|---|---|
| `<owner_profile>` | About you chips (allergies, spice, diet) | About you |
| `<owner_notes>` | About you free text | About you |
| `<nearby_places>` | `lib/location.ts` -> `POST /api/places` -> Google Places searchNearby: food within 75-250 m (grows with GPS accuracy), markets within 400 m filtered by name; nearest first | Nearby places |
| `<local_time>` | Browser clock and time zone, plus season and festivals from the pack | Date and time |
| `<conversation>` | Last 10 Turns (corrected original, translation, card headings) | always |
| `<turn>` | Who speaks, which languages, the owner's particle, the raw transcript | always |

The owner's particle (ครับ or ค่ะ) is sent even with About you off. It controls how the owner's Thai sounds; it isn't context.

## Latency (measured 2026-09-27, Sonnet 5, cached system prompt)

- Translation on screen after about 2.1–3.3 s; cards after about 4.2–5.7 s.
- Output tokens are the bottleneck (~300 per Turn).
- The Northern Thai guide costs about 0.5 s even when cached.
- Haiku 4.5 isn't faster here, and its first strict call is slow (~15 s).

## Rules that keep it working

- The UI talks only to the engine. Never call `fetch` or a provider from a component.
- The engine is a pure reducer (`reduce`) plus a class that runs side effects. Late answers from an old conversation are dropped via `conversationId`; an old Turn's cards still land in the current conversation.
- Provider keys are read only in `lib/server/` and `app/api/`, never in client code.
- The tool is `strict`. Without it, the model sometimes nested the whole answer as a string inside `cards`.

## Folder map

| Path | Role |
|---|---|
| `app/api/translate/route.ts` | Validates input, builds prompts, streams Claude's answer as NDJSON (`text`, then `done` or `error`). |
| `app/api/places/route.ts` | `{ lat, lng, accuracy }` -> `NearbyPlaces` via `lib/server/places.ts`. The position goes to Google only. |
| `components/Conversation.tsx` | The one screen: wires engine, speech input, location, languages, settings, thread and dock. |
| `components/ChatThread.tsx`, `Bubble.tsx` | Messages: translation big, corrected original small, "heard" line, play on tap, cards under. |
| `components/ContextCard.tsx` | Model-written card with the "Suggested: …" button. |
| `components/Dock.tsx` | The other person's mic left, the owner's right; the middle narrates the state in the speaker's language. |
| `components/MyInfo.tsx` | About you card and page: both languages, particle, allergies, spice, diet, notes. |
| `components/Settings.tsx` | Feature switches and location status. |
| `components/ListeningCard.tsx`, `Wave.tsx`, `ErrorState.tsx`, `PlayTool.tsx`, `Logo.tsx` | Recording card, wave, errors (mic blocked, no speech recognition, network, empty), play tool, logo. |
| `lib/engine/` | `types.ts` (contract), `engine.ts` (state machine, streaming client). |
| `lib/server/prompt.ts` | System prompt, turn prompt, strict tool schema, partial-JSON field reader. |
| `lib/server/anthropic.ts` | Streaming Messages API client; falls back to Haiku once if Sonnet fails before streaming anything. |
| `lib/server/places.ts` | Google Places (New) searchNearby, ranking, market detection. |
| `lib/context/pack.json`, `pack.ts` | Luke's Context Pack (generated by `scripts/build-pack.mjs`). |
| `lib/language.ts`, `useLanguage.ts` | Languages (with per-language UI strings and locales), `{ me, them }` store. |
| `lib/myInfo.ts`, `useMyInfo.ts` | Owner profile model, sanitizer, store. |
| `lib/settings.ts`, `useSettings.ts` | Feature switches. |
| `lib/location.ts` | Permission check, watchPosition, places refresh after moving 40 m (at most every 30 s). |
| `lib/speechInput.ts`, `speech.ts` | Speech-to-text and text-to-speech in the browser. |

## Commands

```bash
npm run dev      # http://localhost:3000 (mic and location on a phone need HTTPS: use the Vercel URL)
npm test         # Vitest: engine, prompt, languages
npm run build    # must pass before any push
node scripts/build-pack.mjs   # after Luke changes his data
```

Vitest 5 needs Node 22 or later.
