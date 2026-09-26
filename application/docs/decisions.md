# Decisions

One line each, newest first. Status: **done** (settled) or **open** (to confirm, say with whom). Add a line when you decide something; do not rewrite old lines, add a new one that replaces them.

| Date | Decision | Why | Status |
|---|---|---|---|
| 2026-09-27 | Pitch: "Don't just order. Make the vendor smile." Jury tagline: "ChatGPT speaks for you. We make you speak their language." | Grill: "a translator that explains" is what ChatGPT already does | done |
| 2026-09-27 | Informative Dish, Word and Moment cards retired; Move cards (Say it, Ask, Echo) replace them. The Allergy Flag stays informative | Informative cards do not create an exchange; giving the Visitor something to say does | done, replaces the "Card kinds" line |
| 2026-09-27 | Moves are a hand-written, sourced, native-reviewed data layer (`people/jonathan/moves/moves.json`) next to the Context Pack; the model returns a Stage, code picks the Move and fills its Slot from the pack | The pack holds nouns, Moves hold what to do with them; 45 lines can be reviewed by a native in 15 min, 300 pack entries cannot | done, see [moves.md](moves.md) |
| 2026-09-27 | Only reviewed Moves on stage; `high` confidence only until the review is back | Nothing in the pack is native-reviewed yet | done |
| 2026-09-27 | Card language: Kham Mueang big when the Move has it, Central Thai small below; particle from a m/f chip in About you (default m) | Kham Mueang makes the vendor smile, Central Thai always works | done |
| 2026-09-27 | "Say it yourself" on the Visitor's bubbles (phonetics from the same Gemini call, browser voice normal and slow); Postcard saved to Photos, optional photo | The app makes you speak; the memory lives in the camera roll | done |
| 2026-09-27 | No live simultaneous mode, no streaming output | Reformulating needs the whole sentence; speed is Google's and ChatGPT's fight, not ours | done |
| 2026-09-27 | Gemini runs on one 13 s budget: 8 s for the main model, the rest for a flash-lite fallback (also on timeout) | The engine stops at 15 s; before, a fallback could take 24 s and never reach the UI | done |
| 2026-09-27 | Cards, back-end and value added reopened for a grill | Jonathan not convinced yet; see `people/jonathan/handoff-cards-grill.md` | done, closed by the Moves lines above |
| 2026-09-27 | Two Gemini calls (transcribe, then Turn), not one audio-to-JSON call | Keeps the raw transcript first (D4), keeps a path to on-device models, no contract change; costs ~1 s | done |
| 2026-09-27 | Our Gemini key server-side, not bring-your-own-key | "Usable right now" means scan the QR and it works | done |
| 2026-09-27 | Card order: model's Mention, then a false friend the Vendor said (code backstop, except เจ้า and ส้ม), then the Moment card on the first Turn | The model sometimes misses ยินดี, the demo's key word | done |
| 2026-09-27 | Back-end on Gemini (flash-lite to transcribe, 3.6-flash for the Turn), REST without SDK | Measured ~1.5 s and ~2 s per call; cheap enough to be free | done (was "OpenAI + Claude, TBD" in #12) |
| 2026-09-27 | The model names what it recognised (`mention`), the card is built from the pack | Cards cannot be hallucinated; allergy flags stay deterministic | done |
| 2026-09-27 | Card kinds: dish, word, moment. Off-guide dishes shown only with a warning | Silence beats a generic card | done |
| 2026-09-27 | Only Trusted pack entries (high/medium confidence) reach the app | Luke's data carries confidence per fact | done |
| 2026-09-27 | Kratip visual direction (weave ground, white cards, dock) | DESIGN.md v3 | done |
| 2026-09-26 | Two mics, Vendor left in Thai, Visitor right | Designed for both sides of the conversation (PRD) | done |
| 2026-09-26 | V1 = food only, market and restaurant | Narrow problem, demo in 30 s | done |
| 2026-09-26 | Browser text-to-speech, not a paid voice | Free; Thai voice built into iOS | done |
| 2026-09-26 | My info on the phone (localStorage), no accounts, no database | Works in 30 s, nothing to sign up | done |
| 2026-09-26 | Turn service swap by env var only (`NEXT_PUBLIC_TURN_SERVICE`) | UI never changes when the back-end does; mock kept for demo backup | done |
| 2026-09-26 | Contract = spec #1 + optional `reset()` + `localDetail`, `kind`, `offGuide` on cards | Needed by the UI | open, tech lead (#12) |
| 2026-09-26 | Recording thresholds: 1.5 s silence, 6 s no voice, 30 s cap | Spec says ~1.5 s | open, tune on real phones |
| 2026-09-26 | Languages: en, fr, de, es, it, zh. "Other allergy" without a text field | Keep the first version small | done |
| 2026-09-26 | `prototype/` frozen, not deleted | Tech lead decides | open, tech lead |
