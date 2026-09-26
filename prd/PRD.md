# PRD

**Owner**: jonathan. **Status**: draft v0.2, 2026-09-26 (design decided, wireframes v4). **Challenge**: 02, Navigate Chiang Mai's cultural layers ([brief](hackathon-brief.md)).
**Working name**: TBD (branding workstream).

> A translator that explains, and that is designed for both people in the conversation.
> You ramble in your own language about what you want at the market or the restaurant, the app turns it into a clear Thai message, explains what the answer actually means, and helps the Thai person reply.

## Problem

A newcomer in Chiang Mai stands at a market stall full of curries and wants to know which ones are spicy, which meat is in them, and what the vendor would recommend. Today:

1. **You have to phrase it perfectly first.** Google Translate needs a clean, thought-through sentence. In real life you think out loud, hesitate, change your mind ("1 cm... no, 2 cm").
2. **Translation gives you the word, not what it is.** The vendor answers with a dish name, the app translates it into a name you still don't understand.
3. **The other person is left out.** The vendor is handed a stranger's phone, with an app they don't use, and doesn't know where to tap, what they can say, or whether the translation is right. Often they just don't answer.
4. **Generic assistants lack local context.** Claude or ChatGPT in voice mode can do a translation loop, but they don't know Northern Thai dishes, Kham Mueang words, the season, or that you are allergic to peanuts, and the loop often breaks.

The result: the exchange stops at the first question, when it could have become a real conversation.

## Evidence so far

- The Thai members of the team flagged Kham Mueang vocabulary as important for accuracy in the North.
- Several newcomers told us they would have liked to ask questions at markets and restaurants and gave up.
- The owner's own experience: an improvised voice-translation loop with a general assistant worked "more or less" and broke often.

**Gap**: no structured interviews yet, and none with Thai vendors. Before freezing the design: 5 short interviews at the event, at least 2 with Thai people, asking about the last real episode ("the last time you couldn't make yourself understood about food, what did you do?"), never "would you use an app that...". Verbatims open the demo.

## Target user

- **Primary (V1)**: a Western newcomer in Chiang Mai who wants to ask about food at a market or a restaurant, and to understand the answer.
- **Secondary, inside the same exchange**: the Thai vendor or waiter who receives the question and needs to answer without learning an app.
- **Later**: a Thai person who speaks some English but not enough to express a complex idea. They brain-dump in Thai, get a structured English version, and show it (close to Challenge 01).

## Use cases (V1: food only)

| Scene | Example |
|---|---|
| Market | "Which of these curries are spicy? Which meat is this one? What do you recommend if I've never had Northern food?" |
| Market | Photo of the stall: "What are these vegetables, and how do you cook them?" |
| Restaurant | Order with preferences: not too spicy, no peanuts (allergy), no pork. |
| Restaurant | Photo of a Thai-only menu: "What is each dish, and which would you pick?" |

## Why not just Claude or ChatGPT in voice mode?

The first question the jury will ask. Our answer has to be **visible in the demo**, not only in the prompt:

1. **Designed for the other side.** The vendor has their own mic button, labelled in Thai, which pulses when it's their turn. Your message is played aloud in Thai and shown big, in bullets, one per question. Nobody else designs for the person who receives the phone.
2. **Explains, not only translates.** When a dish or ingredient comes up, a card says what it is, which meat, how spicy, and flags your allergies.
3. **Local context.** Northern Thai dishes, a Kham Mueang dictionary, date and season, your saved info (allergies, spice, diet).
4. **Cheap enough to be free.** Small models and browser text-to-speech, not a premium voice agent.

## Core flow

One stable screen: a chat on top, an action bar at the bottom with only two buttons (vendor mic left in grey, your mic right in black). 👤 top left opens My info, ＋ top right starts a new conversation. Wireframes: `people/jonathan/wireframes/v5.html`.

1. **New session**: opening the app starts a conversation. a compact "My info" card (selected allergies, spice, diet) sits under "Say what's on your mind"; ✕ closes it, 👤 top left reopens it.
2. **You speak**: tap your mic ("Speak", language underneath, e.g. "English ▾"). It turns into "Stop" and a Listening card with a live wave appears on your side of the chat.
3. **Working on it**: your raw transcript appears at once, with a light running around it, while the model cleans, structures, enriches (dishes, dictionary, My info) and translates to Central Thai.
4. **Ready**: the bubble turns into the final message: Thai big and bold, your language small underneath, bullets when there are several questions. The Thai plays aloud. The vendor's mic starts pulsing.
5. **The vendor speaks**: same pattern on the left, in grey and in Thai.
6. **Reply**: your language big, Thai original small. A full-width context card (third style) explains any dish or ingredient named, and flags allergy risks. Your mic pulses, the conversation goes on.

Every message has a 🔊 button outside the bubble, on its inner side. Rule: **big = translation, small = original**.

## Language decisions

- All translation targets **Central Thai**, which vendors in Chiang Mai read and understand.
- **Kham Mueang** is used as a dictionary to improve understanding and accuracy, and as an optional icebreaker layer (a Northern greeting or thank-you). To confirm with the Thai teammates: written Kham Mueang (Lanna script) is rarely read, and cheap text-to-speech engines likely don't speak it.

## Scope

**In (demo MVP)**
- Mobile web app, no install, no account, opened from a QR code.
- Dictation only, both sides, Thai fixed as the other language.
- Chat thread with bilingual bubbles, bullets, 🔊 on every message.
- Context card for dishes and ingredients, allergy flagged as a risk, never guaranteed.
- My info stored on the phone, sent with every request.

**Out (later)**
- Gamification, levels, social features.
- **Memories (delight, V2 first)**: at the end of a good exchange, the app offers to save a memory, a short verbatim of the conversation (e.g. "20 years, it was my mother's stall"). The list of your memories opens from 👤 at the top left. It is the end goal made visible: a real cultural exchange, not a transaction.
- Restaurants uploading their own menu (two-sided market, impossible to prove in a weekend).
- **Nearby places as context (V2 candidate)**: at opening, the My info card gains a "Near you" row with 3 place chips (browser geolocation + Google Places API (New) Nearby Search, called from a Next.js route, key server-side). Tap one and it feeds the engine (place type, dishes mentioned in reviews, rating), or ignore it and just talk (no new screen, keeps D2). Findings: no menu in the Google API, only up to 5 reviews, so an LLM extracts the dishes mentioned and the UI says "Often mentioned", never "Menu". Cost: zero LLM tokens for the list, about 1.5k tokens to read the reviews; the data itself is paid per call (roughly 30 to 40 USD per 1,000 after a monthly free quota), about 1 to 2 USD per daily active user per month at scale, and Google's terms limit caching. Free alternative: OpenStreetMap, without reviews. For a demo: dedicated capped key, and a `?at=<place>` override because stage GPS points at the venue.
- On-device models, offline mode, native iOS/Android apps.
- Thai-initiated flow (the "Later" user above).
- Non-food scenes (barber, pharmacy, transport).
- Typing, photo input, scene chip, suggested replies for the vendor, suggested follow-up questions (dropped during the design session, V2 candidates).
- **One mic with automatic language detection**: a single button for both people, the app detects French/English vs Thai and places the bubble on the right side. Fewer taps, but detection is unreliable on very short replies ("ครับ").
- **Karaoke highlight**: the Thai text is highlighted word by word while it plays, so the vendor can follow along.
- **Live transcription**: show the words while you speak, instead of transcribing after Stop. Needs a streaming speech-to-text provider.

## Design decisions (session 2026-09-26)

| # | Decision | Why |
|---|---|---|
| D1 | The vendor replies by voice with their own mic, no suggested replies | Tap-to-choose felt artificial; a pulsing Thai-labelled mic tells them where to tap. |
| D2 | One stable chat screen, no full-screen "show" mode, no split screen | Screens changed too much between states; split screen fails at a stall. |
| D3 | Big = translation, small = original, in every bubble | The reader of each bubble reads the big text. |
| D4 | No blocking confirmation; raw transcript shown first, then the final version | Shows you were heard and makes the wait visible (R3). |
| D5 | Action bar with only two buttons: vendor mic left, your mic right; verb inside the mic, language underneath | You on the right, under the right thumb; the phone is handed to the left. |
| D6 | My info shown as a compact card at the start of each session, closable; always reachable from 👤 top left | Makes the personalization visible from the first second. |
| D7 | No chat history: opening the app always starts a new conversation, ＋ replaces the current one. Memories (later) will live next to My info behind 👤 | Keeps navigation minimal; what's worth keeping is a memory, not a log. |
| D8 | Context cards full width, in a third style | They belong to neither side. |
| D9 | Allergy: flagged as a risk with a check, never a guarantee | Addresses R4. |

## Constraints

- Web app for the hackathon, mobile first (`prototype/`, Vite + React + TypeScript).
- API models for the demo, chosen to be cheap enough for a free app: Gemini, our key server-side (decided 2026-09-27, see `application/docs/decisions.md`).
- Speech-to-text: Gemini flash-lite (~1.6 s, Thai supported), a separate call before the Turn so the raw transcript shows first. The browser's own speech recognition is unreliable on iPhone.
- Turn: Gemini flash with the Context Pack catalog in the prompt; the model names what it recognised, the card is filled from the pack (`application/docs/context-pack.md`).
- Text-to-speech: browser speech synthesis (iOS has a Thai voice; Android depends on the phone). iOS blocks sound without a tap: auto-play relies on unlocking audio on the mic tap, to test on an iPhone.
- One structured model response per message: translation items, original items, optional context card.
- Public repo: API keys only in `application/.env.local` and Vercel env vars, never committed.

## Major risks

| # | Risk | Why it matters | Owner | De-risk before design? |
|---|---|---|---|---|
| R1 | "Why not just Claude in voice mode?" | First jury question; context alone is invisible on stage. | Design | Yes |
| R2 | The Thai person doesn't reply | The failure we observed. If their half of the exchange isn't designed, the product misses its goal. | Design | Yes |
| R3 | Latency (speech-to-text, model, text-to-speech) | Beyond ~5 s at a stall the exchange dies. Latency shapes the UI (progressive display, waiting states). | Tech | Yes, an order of magnitude |
| R4 | Wrong allergy information | A dish misdescribed to an allergic person is a danger, not a bug. | Design + models | Yes, the principle |
| R5 | Thai speech recognition in noise | Noisy markets, Northern accents. | Tech | No |
| R6 | Free Thai text-to-speech in the browser | Likely available, must be checked on real phones. | Tech | No |
| R7 | Context data quality (dictionary, dishes) | Comes late, from another workstream. | Context workstream | No |
| R8 | Live demo failure (wifi, room noise) | Record a backup video. | Everyone, morning of 27/09 | No |
| R9 | API key leaked in the public repo | Repo must be public before presenting. | Tech | No, but from the first commit |

## Judging map

| Criterion | How we score |
|---|---|
| Day-one impact (x2) | The jury opens it from a QR code and uses it in the room, no install, no account. |
| Product | One button to start, one button to show. The Thai person replies by tapping. |
| Idea | A translator that explains, and designs for both people. |
| Demo | Open on a real verbatim, then a live market scene, then the QR code. |

## Demo script (4 to 6 min)

Draft, to refine once the flow works.

1. **Problem (45 s)**: a real verbatim from our interviews, the curry stall situation.
2. **Live scene (2 min 30)**: brain dump at a "stall", Thai played aloud, the vendor answers on their mic, context card with the allergy flag, one more exchange.
3. **Why it's different (45 s)**: designed for both sides, explains, local context.
4. **Try it now (30 s)**: QR code on screen.
5. **Next (30 s)**: Thai-initiated flow, more scenes, on-device models.
