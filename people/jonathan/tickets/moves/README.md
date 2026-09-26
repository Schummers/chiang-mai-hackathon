# Moves, tickets

Pitch: **TBD** (idea: "Don't just order. Make the vendor smile."). Home screen copy: "Say it however it comes." / "We make it clear Thai, and teach you a few words to say yourself." The app stops explaining things to the Visitor and starts giving them something to say. Six vertical slices, each demoable on the Vercel URL on a phone. Demo: 2026-09-27 after lunch.

Shared context for every ticket:

- Vocabulary: `people/jonathan/CONTEXT.md`, section "Moves". Move, Stage, Move card (Say it / Ask / Echo), Slot, Say it yourself, Postcard.
- Data: `people/jonathan/moves/moves.json` (45 Moves, sourced). Native review sheet: `people/jonathan/moves/REVIEW.md`. **Only Moves marked reviewed go on stage**: until the review is back, ship `high` confidence only.
- Grill that led here: `people/jonathan/handoff-cards-grill.md` plus the 2026-09-27 session.
- Rules: `application/CLAUDE.md`. `npm test` and `npm run build` green before every push. Commit after every meaningful step, add only the files you changed.
- Deploy: Vercel builds every push to `main`. Check on a phone at the production URL, the mic needs HTTPS.

Decisions this set applies:

| Decision | Detail |
|---|---|
| Informative cards retired | Dish, Word and Moment cards stop showing. The Allergy Flag stays, it is safety. |
| The model picks, the code writes | Gemini returns a Stage plus the existing Mention; code picks the Move and fills its Slot from the pack. No card text is generated. |
| Language on a card | Kham Mueang big when the Move has it, Central Thai small below as the fallback for vendors who don't speak it. |
| Ask tap | Plays the audio so the Visitor says it; a small "show the vendor" link shows the Thai full screen. |
| Thank you | A Say it Move at Stage leave; its tap also opens the Postcard. |
| No streaming, no live mode | Out of scope. |

Order: **01 → 02 → 03** are the demo core (03 can run in parallel with 01). Then 04, 05, 06 in that order if time allows.

| # | Ticket | Blocked by |
|---|---|---|
| 01 | Moves data and Stage detection | none |
| 02 | Move cards on the thread | 01 |
| 03 | Home screen carries the pitch | none |
| 04 | Say it yourself | none |
| 05 | Postcard | 02 |
| 06 | Photo on the Postcard | 05 |
