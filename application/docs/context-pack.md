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

The model returns one `mention` per Turn. Precedence: a dish that conflicts with My info, then any dish, then a Kham Mueang word the Vendor used, then an in-season product. `none` is better than a generic card.

| mention.kind | Card | Built from |
|---|---|---|
| `dish` (id in pack) | Dish card | pack + overlay; model's meat/spice only as fallback |
| `offguide` | Dish card flagged `offGuide` | model text, **only shown if it carries an allergy or diet warning** |
| `word` | Word card ("say it back") | glossary + false friends |
| `produce` | Card with Northern name and season | pack |
| nothing, Vendor Turn with a false friend | Word card (code backstop, `falseFriendCard`; เจ้า and ส้ม ignored) | false friends |
| nothing, first Turn | Moment card (season, weather, next festival) | pack months + festivals, Chiang Mai date |

Card text is English whatever the Visitor's language: the pack is English. The bubbles are translated into the Visitor's language.

Allergy and diet flags: first the overlay's allergens and a keyword check on ingredients (deterministic), then the model's reading. Always phrased as a risk to check with the Vendor.

## Changing it

- Luke updates his JSON -> run `node scripts/build-pack.mjs` in `application/`, commit `pack.json`.
- A demo dish needs a better card -> edit `overlay.ts` (keyed by pack id).
- Prompt rules -> `prompt.ts`. The system part is stable per month so it can be cached; the per-Turn part is in `turnPrompt`.
- Tests: `lib/context/cards.test.ts`.
