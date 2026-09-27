# Product context (Max's brief, 2026-09-27)

The brief the app's internals were rewritten against. For how the code implements it, see [`docs/architecture.md`](docs/architecture.md).

## What it is

A web translation app for face-to-face conversations in Chiang Mai, Thailand, between English speakers and Thai speakers who may speak the Northern Thai dialect (Kham Mueang). The current focus is food: a foreigner asking questions at a local market or restaurant. The longer-term aim is to be more general.

The phone owner can be either side. It may be the visitor, or the shopkeeper. Everything below works in both directions.

## Pipeline

1. **Speech-to-text in the browser**: Chrome's (and Safari's) Web Speech API. Chrome for iOS runs on WebKit, so it gets Safari's implementation, backed by Apple's recognizer. The Thai recognizer (`th-TH`) is a Central Thai model: it does not know Kham Mueang and mishears Northern words, dishes, vegetables and prices.
2. **An LLM pass** (Anthropic API), which does two things:
   - **Corrects the transcript.** It treats the speech-to-text output as a noisy phonetic guess and rebuilds what was most plausibly said. This is the main point of the pass. For example, a niche Northern vegetable the recognizer turned into an unrelated Central Thai word should come out right.
   - **Translates** the corrected utterance.

   It uses system-injected and user-injected context to do both.

## Features

1. **Settings and user context** (About you): the owner's language and the other person's language (Thai is allowed on either side), allergens, spice, diet, and an arbitrary free-text context box. The box is for things like an allergen we don't list, or a shopkeeper's daily specials. All of it is injected when calling the LLM.
2. **Browser APIs for context**: date and time, and above all geolocation.
   - On app load, if the user hasn't granted persistent permission, request location. Handle denial gracefully.
   - With a position, call Google Maps (Places) for food places nearby, pulling whatever is relevant: name, type, distance, rating, price, open now, summary. 50 m is a guide, not a rule: the app must also recognise when the user is inside a market.
   - Inject these places as context, ranked by distance, framed as "the user is possibly at one of these places; use it to adjust the translation".
3. **Context cards**: the LLM may add cards that are not messages, but extra information at that point in the conversation.
   - Example: the shopkeeper mentions khao soi, so a card under their message explains what khao soi is.
   - Format: one heading plus two succinct sentences.
   - Each card has a suggested message. Tapping it sends a message from the owner to the other person, e.g. "Tell me more about the khao soi".
   - Allergy warnings are not hardcoded: the model decides to raise them as a context card when something may clash with the owner's profile or notes.
4. **Meta-framing of context**: every piece of context is injected with a short explanation of what it is and how to use it. For example: "this is information the user entered as optional extra context; keep it in mind when translating".
5. **Settings modal**: switches each feature on and off (About you, nearby places, date and time, the Northern Thai guide, context cards).
6. **This file.**

## Out of scope (removed 2026-09-27)

- Move cards: pre-written phrases. The suggested message on a context card replaces them.
- Photo and menu reading.
- Say it yourself: the pronunciation sheet.
- Hardcoded Allergy Flag cards, now left to the model's context cards.
- The Gemini back-end, the audio recorder fallback and the mock turn service.

## Open question

**How much of Luke's Lanna research to inject.**
- Today the system prompt carries a compact projection of `lib/context/pack.json`: 35 dishes, 51 produce items, 182 Kham Mueang words and 6 false friends. That is about 13k tokens with the rules, cached by Anthropic.
- Measured cost: roughly 0.5 s per Turn compared with no guide.
- Luke's full data (`people/luke/lanna-context/`) is far larger (~1M tokens raw) and would need retrieval rather than prompt stuffing.
