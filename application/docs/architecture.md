# Architecture

Next.js 16 (App Router) + React 19 + TypeScript, deployed on Vercel (project `u-mueang`, root directory `application`). No database: everything the Visitor saves lives on the phone (localStorage).

## One Turn, end to end

```
App load
  -> lib/location.ts: asks for location if never granted (quiet when denied), watches the position
     -> POST /api/places -> Google Places (New): food places ~75 m + markets ~400 m, nearest first (lib/server/places.ts)

Dock (mic tap)
  -> ConversationEngine (lib/engine/engine.ts)      state machine: idle -> listening -> processing -> idle | error
     api mode + browser has SpeechRecognition:
       -> lib/speechInput.ts                         Chrome Web Speech API (th-TH for the Vendor), live interim text,
                                                     same auto-stop timings -> engine.stopWithTranscript(speaker, text)
     otherwise (mock, Firefox, recogniser with no service):
       -> recorder.ts + TurnService.transcribe       api: POST /api/transcribe -> Gemini (lib/server/gemini.ts)
     -> TurnService.translate(TranslateInput + context + options from Settings)
          api: POST /api/translate
               -> systemPrompt (rules + Context Pack, cached) + turnPrompt (lib/context/prompt.ts)
                  turnPrompt starts with context blocks, each saying what it is and how to use it:
                  <visitor_notes>, <nearby_places> (ranked by distance), <local_time>
               -> Claude (lib/server/anthropic.ts), forced tool call `submit_turn`, schema TURN_SCHEMA
               -> model returns items, "romanised" (phonetics of the Visitor's Thai), "cards", a "mention" and a "stage"
               -> infoCards() keeps at most 2 context cards (heading, 2 sentences, suggestion) (lib/context/infoCards.ts)
               -> romanisedItems() keeps the phonetics for the Visitor only (lib/context/romanised.ts), for Say it yourself
               -> flagCard(mention) builds the Allergy Flag card from the pack, only when it flags (lib/context/cards.ts)
               -> stageFor(stage) fixes the Stage (first Turn = start, unknown = explore)
               -> pickMove(stage, mention) picks at most one Move, none when the Allergy Flag shows (lib/context/moves.ts):
                  Echo when the Vendor said a trigger as a whole word, else a Move of that Stage
  <- Message added to the thread, Thai played aloud (lib/speech.ts), the other mic pulses
  <- Context cards under it (components/InfoCard.tsx). "Ask …" on a card -> engine.say("you", suggestion):
     a normal Visitor Turn from text, translated and read aloud in Thai
```

Settings (`components/Settings.tsx`, `lib/settings.ts`) switch each context source (notes, nearby places, date and time, Northern Thai guide) and each thread feature (context cards, Moves) on or off. The client leaves a switched-off source out of the request; `options` tells the route which prompt parts and outputs to use.

### Photo Turn

```
Dock photo button (<input capture>, phone camera)
  -> downscale to 1280px JPEG 0.8 (lib/photo.ts)
  -> ConversationEngine.photo(image)                 idle | error -> reading -> idle | error
     -> URL.createObjectURL(image)                   local only, revoked on new conversation
     -> TurnService.readPhoto(image, { userLanguage, myInfo })
          mock: menu card (peanut flag from My info), then dish, fruit, sign in turn
          api: POST /api/photo -> Gemini vision, JSON schema PHOTO_SCHEMA (lib/context/photo.ts)
               -> toPhotoCard: validated, dishes anchored in the Context Pack (allergen flags from the overlay)
  <- photo message (image + PhotoCard) added to the thread

"Ask about this photo" (on the photo card)
  -> ConversationEngine.askAboutPhoto(id)            same states as Speak, with `about`
     -> TurnService.transcribe(audio, visitor language)
     -> TurnService.askPhoto(image, { question, card, userLanguage, myInfo })
          api: POST /api/photo/ask -> Gemini with the image, the card and the question
  <- question card (your side, "About this photo") + woven answer card. Nothing for the vendor, nothing read aloud.
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
| `app/api/photo/route.ts` | Image -> `PhotoCard` via Gemini. The image is sent to Gemini only: never stored, never logged. |
| `app/api/photo/ask/route.ts` | Question about a photo -> `{ answer }` via Gemini, same limits as `/api/photo`. |
| `app/api/translate/route.ts` | Raw text + context -> `TranslateResult` on Claude: context cards, the Allergy Flag card when there is one, else a Move. Month from the phone's time, else Chiang Mai time (UTC+7). |
| `app/api/places/route.ts` | Lat/lng -> `NearbyPlaces` via Google Places (New). The position is never stored or logged. |
| `app/globals.css` | Design tokens (Kratip). |
| `components/Conversation.tsx` | The one screen: wires engine, My info, language, thread and dock. |
| `components/ChatThread.tsx`, `Bubble.tsx` | Messages: translation big, original small, bullets when several items, tap the card to play. |
| `components/ContextCard.tsx` | Allergy Flag card (dish card with spice meter and flag row). |
| `components/SayItYourself.tsx` | "Say it yourself" on a Visitor bubble: one row per Thai item (`lib/sayIt.ts`), listen, slowly; the voice is off while a mic is listening. |
| `components/MoveCard.tsx` | Move card (Say it / Ask / Echo): tap to hear the Thai, "Show the vendor" full screen, collapses after the next Turn. Lines from `lib/moveCard.ts`. |
| `components/Overlay.tsx` | Full-screen layer in a portal (Show the vendor, Say it yourself sheet): tap or Escape closes, events never reach the card underneath. |
| `components/Dock.tsx` | Bottom bar with the two mics (Vendor left, Visitor right); the middle narrates the state, or shows the Photo button at rest. |
| `components/ListeningCard.tsx`, `Wave.tsx` | Live recording card and wave. |
| `components/MyInfo.tsx` | Compact My info card and page (allergies, spice, diet, free-text notes). |
| `components/InfoCard.tsx` | Context card written by the model: heading, two sentences, "Ask …" suggestion button. |
| `components/Settings.tsx` | Feature switches and the location status (what was found, or why not). |
| `components/ErrorState.tsx` | Retry, mic denied, too short, offline. Vendor-side texts in Thai. |
| `components/PhotoCard.tsx` | Woven card that answers a photo: menu, dish (reuses `ContextCard`), fruit / ingredient, sign. "Ask about this photo" at the bottom. |
| `components/PhotoAsk.tsx` | "About this photo" line, your question card, the woven answer card, "Looking at the photo…". |
| `components/PhotoShot.tsx` | Your photo in the thread: full while reading, 70px strip once read. |
| `components/PlayTool.tsx` | Play icon at the bottom of a message. |
| `components/Logo.tsx` | Header logo (placeholder mark). |
| `lib/engine/` | `types.ts` (contract, photo types included), `engine.ts` (state machine, voice and photo Turns), `turnService.ts` (mock or api picker), `mockTurnService.ts`. |
| `lib/server/anthropic.ts` | Claude REST client: forced tool call, cached system prompt, one fallback model on 429/5xx/timeout. Server only. |
| `lib/server/places.ts` | Google Places nearby search, distance ranking, market detection by name. Server only. |
| `lib/server/gemini.ts` | Gemini REST client (photos, transcription fallback), model names, fallback on 429/503. Server only. |
| `lib/speechInput.ts` | Browser speech-to-text (Web Speech API) with interim text and auto-stop. |
| `lib/location.ts` | Geolocation permission, position watch, nearby places store. |
| `lib/settings.ts`, `useSettings.ts` | Feature switches, saved on the phone. |
| `lib/context/` | Context Pack (`pack.json`, `pack.ts`), hand-written `overlay.ts`, `cards.ts`, `prompt.ts`, `photo.ts` (photo prompt, schema, validation). |
| `lib/context/moves.ts`, `moves.json` | Moves data (copied from `people/jonathan/moves/moves.json`), `stageFor`, `pickMove` (Echo on whole-word triggers via `Intl.Segmenter`). See [moves.md](moves.md). |
| `lib/context/romanised.ts` | Cleans the model's phonetics for Say it yourself (Visitor only). |
| `lib/moveCard.ts` | `moveLines()`: the lines a Move card shows (big, small, romanised, English, Echo "ซาว = 20"). |
| `lib/recorder.ts` | Mic capture, silence detection. |
| `lib/cardFlag.ts` | Deterministic allergy keyword check on a card ("May contain peanuts"), and allergens the Vendor ruled out. |
| `lib/pitch.ts` | The home screen's title and subtitle, also the page description and shared-link text. |
| `lib/photo.ts` | Downscale a camera photo before the read. |
| `lib/photoCard.ts` | Menu rows (About you conflicts first, 5 max) and the "Couldn't read this photo" fallback. |
| `lib/useOnline.ts` | Online/offline status for the offline banner. |
| `lib/speech.ts` | Browser text-to-speech (free, Thai voice built into iOS). |
| `lib/sayIt.ts` | `sayItRows()`: Thai, phonetics and meaning per item, aligned by index; a missing phonetic gives no line, never a merge. |
| `lib/usePlayToggle.ts` | Play / stop toggle on the browser voice, shared by the Move card and Say it yourself. |
| `lib/language.ts`, `useLanguage.ts` | Visitor language list and saved choice. |
| `lib/myInfo.ts`, `useMyInfo.ts` | My info model and saved value. |
| `lib/storage.ts`, `phoneStore.ts` | Safe localStorage and a tiny shared store. |
| `lib/useConversation.ts` | One engine per screen, exposed to React. |
| `scripts/build-pack.mjs` | Regenerates `lib/context/pack.json` from Luke's data. |
| `scripts/build-moves.mjs` | Regenerates `lib/context/moves.json` from `people/jonathan/moves/moves.json`. |

## Commands

```bash
npm run dev      # http://localhost:3000 (mic on a phone needs HTTPS: use the Vercel URL)
npm test         # Vitest: engine, cards, card flags, My info, language
npm run build    # must pass before any push
node scripts/build-pack.mjs   # after Luke changes his data
node scripts/build-moves.mjs  # after people/jonathan/moves/moves.json changes
```
