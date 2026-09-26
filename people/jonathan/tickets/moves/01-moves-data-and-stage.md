# 01: Moves data and Stage detection

**What to build:** the engine knows where the conversation is and which Move fits. `people/jonathan/moves/moves.json` is copied into the app as data, each Turn from `/api/translate` returns a `stage` next to the existing `mention`, and a pure function picks at most one Move for that Turn and fills its Slot from the Context Pack. No UI change yet: the picked Move is visible in the API response and in tests.

**Blocked by:** None, can start immediately.

**Status:** ready-for-agent

- [ ] `application/lib/context/moves.json` built from `people/jonathan/moves/moves.json` by a script next to `scripts/build-pack.mjs` (rename the field `moment` to `stage`; keep `centralThai`, `khamMueang`, `romanised` as `{m, f}` objects; keep `trigger` on Echo Moves; keep `tone`)
- [ ] A `reviewed` flag per Move, false by default; the picker only uses `reviewed` Moves, or `confidence: "high"` ones while no review is in. One constant switches between the two
- [ ] System prompt (`lib/context/prompt.ts`) asks for `stage`: one of start, explore, decide, receive, pay, leave, vendor-used-northern-word. The first Turn of a conversation is always start
- [ ] `pickMove(stage, mention, history)` in `lib/context/moves.ts`: Echo when the Vendor's raw transcript contains one of the Move's `trigger` words; otherwise a Move of that Stage, Ask preferred over Say it from explore onward; a Move already shown in this conversation is never shown again; returns null when nothing fits
- [ ] Slot filling: `{dish}` and `{produce}` take the Thai and romanised names from the pack entry of the Mention; a Move with a Slot is skipped when the Mention has no matching entry
- [ ] Particle: My info gets `speaker: "m" | "f"` (chip in About you, default "m"); the picker returns the matching variant
- [ ] The Allergy Flag keeps its current precedence: when a dish conflicts with My info, the Turn carries the allergy card, not a Move
- [ ] Unit tests: one per Stage, Echo trigger, no repeat, Slot skip, allergy precedence
- [ ] `npm test` and `npm run build` green
