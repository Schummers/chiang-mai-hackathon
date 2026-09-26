# Moves

How the app gives the Visitor something to **say themselves**, instead of something to read. Words: [`people/jonathan/CONTEXT.md`](../../people/jonathan/CONTEXT.md), section "Moves". Why: [decisions.md](decisions.md), 2026-09-27 lines.

## The idea in one line

The Context Pack knows **what** we talk about (dishes, produce, Northern words). Moves know **what to do with it**: a phrase to say at the right moment of the conversation.

## Data

- Source: [`people/jonathan/moves/moves.json`](../../people/jonathan/moves/moves.json), 45 Moves written by hand from web sources and Luke's pack, owned by jonathan. Do not edit it from the app; the app copies it at build time (ticket 01).
- One Move: `id`, `type` (say | ask | echo), `stage`, `slot` (none | dish | produce | word), `english`, `centralThai` `{m, f}`, `khamMueang` `{m, f}` (empty when not sourced, never invented), `romanised`, `likelyReplies`, `trigger` (Echo only: the Vendor words that fire it), `tone` (`playful` for jokes), `sources`, `confidence`, `reviewerNote`.
- Review: [`people/jonathan/moves/REVIEW.md`](../../people/jonathan/moves/REVIEW.md) is the sheet for native speakers. A Move goes on stage only when reviewed (until then, `high` confidence only).

## How a Move card is chosen

1. The Visitor or the Vendor speaks; `/api/translate` returns the translation, the existing `mention` (dish, produce, word) and a **Stage**: start, explore, decide, receive, pay, leave, vendor-used-northern-word. The first Turn is always start.
2. Code, not the model, picks at most one Move: an **Echo** when the Vendor's raw transcript contains one of its `trigger` words; otherwise a Move of that Stage, **Ask** preferred over **Say it** from explore on; never the same Move twice in a conversation.
3. The Slot is filled from the Context Pack entry of the Mention (`{dish}` gets its Thai and romanised names). A Move whose Slot cannot be filled is skipped.
4. The particle variant (`m` or `f`) comes from My info.
5. An allergy conflict wins: that Turn shows the Allergy Flag card, not a Move.

The model never writes card text. It only reports the Stage and the Mention, as before.

## On screen

- **Say it**: what you say in any case (hello, delicious, thank you). **Ask**: a question that deepens the exchange, the strongest card. **Echo**: the Vendor used a Northern word, here is what it means, say it back.
- Kham Mueang big when present, Central Thai small below, romanised, then English. One tap plays the Thai (browser voice, `lib/speech.ts`) so the Visitor says it; "show the vendor" shows the Thai full screen.
- The "thank you" Move at Stage leave also opens the **Postcard** (ticket 05).
- **Say it yourself** is separate: a control on any Visitor bubble that teaches that sentence (phonetics, listen, slowly), ticket 04.

## Status

Live state is the Status line of each ticket in [`people/jonathan/tickets/moves/`](../../people/jonathan/tickets/moves/). This page describes the target; if the code disagrees, the code wins and this page gets fixed.
