# Architecture

Next.js 16 (App Router) + React 19 + TypeScript, deployed on Vercel (project `u-mueang`, root directory `application`). No database: everything the Visitor saves lives on the phone (localStorage).

## One Turn, end to end

```
Dock (mic tap)
  -> ConversationEngine (lib/engine/engine.ts)      state machine: idle -> listening -> processing -> idle | error
     -> recorder.ts                                  MediaRecorder + auto-stop on silence
     -> TurnService.transcribe(audio, language)      mock or api (lib/engine/turnService.ts)
          api: POST /api/transcribe -> Gemini (lib/server/gemini.ts)
     -> TurnService.translate(TranslateInput)
          api: POST /api/translate
               -> systemPrompt + turnPrompt (lib/context/prompt.ts)
               -> Gemini, JSON schema TURN_SCHEMA
               -> model returns items + a "mention"
               -> cardFor(mention) builds the card from the pack (lib/context/cards.ts)
  <- Message added to the thread, Thai played aloud (lib/speech.ts), the other mic pulses
```

Key idea: **the model only says what it recognised** (`mention`: a dish id, a word, a produce id). The card content itself (meat, spice, allergy flag, local detail) is built deterministically from the Context Pack and the overlay, so it cannot be hallucinated. See [context-pack.md](context-pack.md).

## Rules that keep it working

- The UI talks only to the engine. Never call `fetch` or a provider from a component.
- The engine is a pure reducer (`reduce`) plus a class that runs side effects. Late answers from an old conversation are dropped via `conversationId`.
- The mock (`mockTurnService.ts`, a scripted Khao Soi exchange) stays: it runs the demo backup and the tests.
- Provider keys are read only in `lib/server/` and `app/api/`, never in client code.

## Folder map

| Path | Role |
|---|---|
| `app/page.tsx` | Renders `<Conversation />`, nothing else. Touch it as little as possible. |
| `app/api/transcribe/route.ts` | Audio -> raw text via Gemini flash-lite. Removes the spaces flash-lite puts between Thai words. |
| `app/api/translate/route.ts` | Raw text + context -> `TranslateResult`. Adds the Moment card on the first Turn when nothing is mentioned. Date is Chiang Mai time (UTC+7). |
| `app/globals.css` | Design tokens (Kratip). |
| `components/Conversation.tsx` | The one screen: wires engine, My info, language, thread and dock. |
| `components/ChatThread.tsx`, `Bubble.tsx` | Messages: translation big, original small, bullets when several items, tap the card to play. |
| `components/ContextCard.tsx` | Dish / word / moment card, spice meter, allergy flag. |
| `components/Dock.tsx` | Bottom bar with the two mics (Vendor left, Visitor right) and the language picker. |
| `components/ListeningCard.tsx`, `Wave.tsx` | Live recording card and wave. |
| `components/MyInfo.tsx` | Compact My info card and page (allergies, spice, diet). |
| `components/ErrorState.tsx` | Retry, mic denied, too short, offline. Vendor-side texts in Thai. |
| `components/PlayTool.tsx` | Play icon at the bottom of a message. |
| `components/Logo.tsx` | Header logo (placeholder mark). |
| `lib/engine/` | `types.ts` (contract), `engine.ts` (state machine), `turnService.ts` (mock or api picker), `mockTurnService.ts`. |
| `lib/server/gemini.ts` | Gemini REST client, model names, fallback on 429/503. Server only. |
| `lib/context/` | Context Pack (`pack.json`, `pack.ts`), hand-written `overlay.ts`, `cards.ts`, `prompt.ts`. |
| `lib/recorder.ts` | Mic capture, silence detection. |
| `lib/cardFlag.ts` | Deterministic allergy keyword check on a card ("May contain peanuts"), and allergens the Vendor ruled out. |
| `lib/useOnline.ts` | Online/offline status for the offline banner. |
| `lib/speech.ts` | Browser text-to-speech (free, Thai voice built into iOS). |
| `lib/language.ts`, `useLanguage.ts` | Visitor language list and saved choice. |
| `lib/myInfo.ts`, `useMyInfo.ts` | My info model and saved value. |
| `lib/storage.ts`, `phoneStore.ts` | Safe localStorage and a tiny shared store. |
| `lib/useConversation.ts` | One engine per screen, exposed to React. |
| `scripts/build-pack.mjs` | Regenerates `lib/context/pack.json` from Luke's data. |

## Commands

```bash
npm run dev      # http://localhost:3000 (mic on a phone needs HTTPS: use the Vercel URL)
npm test         # Vitest: engine, cards, card flags, My info, language
npm run build    # must pass before any push
node scripts/build-pack.mjs   # after Luke changes his data
```
