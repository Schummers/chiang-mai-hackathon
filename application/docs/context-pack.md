# Context Pack: local knowledge in the app

## Pipeline

```
people/luke/lanna-context/*.json      Luke's research, every fact with a source and a confidence
  -> scripts/build-pack.mjs            keeps Trusted entries only (high or medium confidence), app fields only
  -> lib/context/pack.json             generated, never edit by hand
  -> lib/context/pack.ts               typed import (PACK)
     + lib/context/overlay.ts          hand-written: meat, spice, allergens, local detail for demo dishes
  -> lib/context/prompt.ts             catalog sent to the model (dishes, in-season produce, food words, false friends)
  -> lib/context/cards.ts              builds the card from the model's "mention"
```

Current pack: 35 dishes, 51 produce, 182 Kham Mueang words, 6 false friends, 12 months of climate, 34 festival dates, one place (Warorot market). Royal days are left out on purpose (topic to avoid).

## How a card is chosen

The model returns one `mention` per Turn. Precedence (asked in the prompt, `prompt.ts`, not enforced by code): a dish that conflicts with My info, then any dish, then a Kham Mueang word the Vendor used, then an in-season product. `none` is better than a generic card.

Since Moves ticket 02, **the only card left on the thread is the Allergy Flag** (`flagCard`): a card is sent only when it carries an allergy or diet warning. Word, produce and Moment cards are retired (the Mention still fills Move Slots, and Echo Moves cover the Vendor's Northern words).

| mention.kind | Card | Built from |
|---|---|---|
| `dish` (id in pack) | Dish card, **only when it carries a flag** | pack + overlay; model's meat/spice only as fallback |
| `offguide` | Dish card flagged `offGuide`, **only when it carries a flag** | model text |
| `word`, `produce`, nothing | no card | |

Card text is English whatever the Visitor's language: the pack is English. The bubbles are translated into the Visitor's language.

Allergy and diet flags: first the overlay's allergens and a keyword check on ingredients (deterministic, `cards.ts` and `lib/cardFlag.ts`), then the model's reading. Always phrased as a risk to check with the Vendor.

## How a Move is chosen

Moves (`people/jonathan/moves/moves.json`, copied to `lib/context/moves.json` by `scripts/build-moves.mjs`, `moment` renamed `stage`) are phrases the Visitor says themselves. The model only returns `stage`; `pickMove` in `lib/context/moves.ts` does the rest:

1. The card carries an allergy or diet flag: no Move.
2. Vendor Turn whose raw transcript contains a Move's `trigger` word: that Echo (longest trigger wins; a trigger inside a dish or produce name, like ลำ in ลำไย, does not count).
3. Otherwise a Move of that Stage: Ask before Say it from explore to pay (at leave, Say it first so the thank you comes before any question), a Move whose Slot fills before one without, then file order. A Move with a `{dish}` or `{produce}` Slot is skipped when the Mention has no pack entry.
4. A Move already shown in the conversation (`Message.move`) never comes back. Nothing fits: null.

Only `reviewed` Moves go on stage, or `confidence: "high"` ones while no review is in: switch `USE_REVIEW` in `moves.ts` once `REVIEW.md` is back. The particle variant (`m`/`f`) comes from My info's `particle` (`particleOf` in `lib/myInfo.ts`).

## Changing it

- Luke updates his JSON -> run `node scripts/build-pack.mjs` in `application/`, commit `pack.json`.
- A demo dish needs a better card -> edit `overlay.ts` (keyed by pack id).
- Prompt rules -> `prompt.ts`. The system part is stable per month so it could be cached (no cache configured yet in `gemini.ts`); the per-Turn part is in `turnPrompt`.
- Moves change -> edit `people/jonathan/moves/moves.json` (set `"reviewed": true` per Move after review), run `node scripts/build-moves.mjs`, commit `moves.json`.
- Tests: `lib/context/cards.test.ts`, `lib/context/moves.test.ts`, `lib/cardFlag.test.ts`.
- `build-pack.mjs` does not validate Luke's JSON: a missing field ends up as `null` or crashes the script. Check `git diff lib/context/pack.json` after a rebuild.
