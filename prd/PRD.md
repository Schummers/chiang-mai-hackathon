# PRD

**Owner**: jonathan. **Status**: draft v0.1, 2026-09-26. **Challenge**: 02, Navigate Chiang Mai's cultural layers ([brief](hackathon-brief.md)).
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

1. **Designed for the other side.** A full-screen "show" mode in Thai, audio played automatically, and suggested replies the vendor can tap. Nobody else designs for the person who receives the phone.
2. **Explains, not only translates.** When a dish or ingredient comes up, a card says what it is, which meat, how spicy, and flags your allergies.
3. **Local context.** Northern Thai dishes, a Kham Mueang dictionary, date and season, the scene (market or restaurant), your photo, your saved preferences.
4. **Cheap enough to be free.** Small models and browser text-to-speech, not a premium voice agent.

## Core flow

1. **Input**: press one big mic button and brain-dump in your own language: context, hesitations, corrections included. Optionally add a photo (menu, stall).
2. **Process**: speech-to-text, then a model that cleans, structures and enriches the request with context (scene, dishes, dictionary, preferences, season), and translates to Central Thai.
3. **Output**: on top, the cleaned request in your language (so you can check it); below, the Thai version; a play button reads the Thai aloud (some people prefer listening to reading).
4. **Show**: one tap switches to a full-screen Thai view for the vendor, with suggested replies as large buttons and a mic as fallback.
5. **Answer back**: the vendor's reply is translated into your language, with a dish card whenever a dish or ingredient is mentioned.
6. **Keep talking**: the app suggests one friendly follow-up question in Thai ("How long have you run this stall?"), which turns a transaction into an exchange.

## Language decisions

- All translation targets **Central Thai**, which vendors in Chiang Mai read and understand.
- **Kham Mueang** is used as a dictionary to improve understanding and accuracy, and as an optional icebreaker layer (a Northern greeting or thank-you). To confirm with the Thai teammates: written Kham Mueang (Lanna script) is rarely read, and cheap text-to-speech engines likely don't speak it.

## Scope

**In (demo MVP)**
- Mobile web app, no install, no account, opened from a QR code.
- Voice brain dump, photo input, scene chip (market / restaurant).
- Output in the user's language + Thai + audio.
- Show mode with suggested replies and mic.
- Answer translated back, with dish cards.
- Preferences and allergies set once, injected into every request.
- One suggested follow-up question.

**Out (later)**
- Gamification, levels, saved "memory" of deep exchanges, social features.
- Restaurants uploading their own menu (two-sided market, impossible to prove in a weekend; the user's photo gives the same context).
- On-device models, offline mode, native iOS/Android apps.
- Thai-initiated flow (the "Later" user above).
- Non-food scenes (barber, pharmacy, transport).

## Open design questions (round 2)

Current recommendations, to be decided in the design session.

| # | Question | Recommendation |
|---|---|---|
| D1 | How does the Thai person reply? | Model-generated suggested replies as big Thai buttons ("very spicy / a little / not spicy"), mic as fallback. |
| D2 | How does the screen pass from one person to the other? | Full-screen "show" mode rather than a split screen: at a stall you hold the phone, it isn't lying on a table. |
| D3 | What does the Western user see when the answer comes back? | Translation plus a dish card (what it is, meat, spice level, allergy flag). |
| D4 | Confirm the brain dump before showing it? | No blocking step. Cleaned version on top, Thai below, re-record if wrong. |
| D5 | Home screen? | One giant mic, photo secondary, keyboard hidden. Scene chip preselected and editable; geolocation is optional (permission prompt, invisible in a demo). |
| D6 | Where do preferences live? | Chips at first launch, no account. A declared allergy is always stated in the Thai message. |
| D7 | History? | One thread per conversation, "New conversation" button. |
| D8 | How does the jury try it? | QR code at the end of the demo, works on their phones in the room. |

## Constraints

- Web app for the hackathon, mobile first (`prototype/`, Vite + React + TypeScript).
- API models for the demo, chosen to be cheap enough for a free app. Model choices per step: models workstream.
- Text-to-speech: browser speech synthesis first (free, Thai voices on most phones), to verify on the team's devices.
- Public repo: API keys only in `prototype/.env.local`, never committed.

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
2. **Live scene (2 min 30)**: brain dump at a "stall", show mode, the vendor taps a reply, dish card, follow-up question.
3. **Why it's different (45 s)**: designed for both sides, explains, local context.
4. **Try it now (30 s)**: QR code on screen.
5. **Next (30 s)**: Thai-initiated flow, more scenes, on-device models.
