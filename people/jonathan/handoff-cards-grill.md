# Handoff: Context Cards and back-end, to grill again (2026-09-27)

Session of 2026-09-26/27 night: from Luke's context pack to the cards shown in the app, then a first back-end. **Jonathan is not convinced yet** by the back-end, the use of the pack or the value for cultural exchange. This file is the input of the next grill session.

Read with it:
- [CONTEXT.md](CONTEXT.md): glossary (Visitor, Vendor, Turn, Context Pack, Mention, Context Card, Dish/Word/Moment card, Off-guide dish card, Local detail, Allergy Flag).
- [wireframes/cards-v1.html](wireframes/cards-v1.html): card counts and 3 formats per type.
- [application/docs/context-pack.md](../../application/docs/context-pack.md): the pipeline as built.
- Luke's pack: `people/luke/lanna-context/` (README, `EXPERT_REVIEW.md`).

## Decisions taken in the session

| # | Decision | Why | Status |
|---|---|---|---|
| 1 | Cards are **informative**, not question prompts | A first idea was cards that ask the Visitor to ask something; Jonathan chose information linked to what was just said | taken, to challenge |
| 2 | A card fires on a **Mention**: something named in a Turn, by either side, that matches a Trusted entry of the pack | Links the conversation to the data; no Mention, no card | built |
| 3 | At most 1 card per Turn. Precedence: dish with allergy flag > dish > word > moment | Keeps the chat readable | built |
| 4 | 3 Card Types: Dish, Word, Moment. Etiquette, beliefs and ethnic groups left out | Risk of clumsiness; the pack forbids guessing ethnicity | built |
| 5 | **The model names the Mention, the pack fills the card** (hybrid: model's meat and spice only as fallback) | No invention on stage, same card every time | built, doubted |
| 6 | Trusted entries only (high or medium confidence) | Nothing is native-reviewed yet | built |
| 7 | Off-guide dish: a minimal model-written card, shown only when it carries an allergy or diet flag | Safety beats the purity of rule 5 | built |
| 8 | Moment card on the first Turn, without waiting for a Mention | Nobody says "rainy season" at a stall | built |
| 9 | Format: Standard (B), to become **collapsible**: closed = type, name, 2 lines, allergen icons; open = details | Jonathan's feedback on cards-v1 | not built (the Kratip C2 card was built by another session) |
| 10 | Back-end on Gemini, **2 calls**: transcribe (3.5-flash-lite, ~1.6 s) then turn (3.6-flash, ~2-4 s) | Keeps the raw transcript first (D4), keeps a path to local models, no front change | built, live |
| 11 | The whole catalog goes in the prompt, no retrieval | Pack is small (~17k chars in the prompt); Gemini takes 1M tokens | built, doubted |
| 12 | Our key server-side, not bring-your-own-key | "Usable right now" = scan the QR and it works; BYOK is a developer pattern | taken |

## Numbers (from cards-v1)

~306 possible cards from Trusted entries: 86 dish (35 dishes + 51 produce), 192 word (186 glossary + 6 false friends), 28 moment (12 months + 16 festivals). ~220 possible today at Warorot. A user sees 3 to 5 per conversation.

## What Jonathan doubts (the grill agenda)

1. **Value added.** Why is this better than ChatGPT in voice mode? The session's answer: (a) designed for two people, the Vendor has their own mic, (b) verified local context (ยินดี = thank you, ซาว = 20, kaeng hang le may hold peanuts), (c) **make the Visitor answer in the Vendor's language** ("ChatGPT translates you; we make you speak their language"). Not yet convincing, and (c) exists only as a Word card.
2. **Cultural exchange.** Informative cards do not create an exchange by themselves. How does the app push a transaction (food at a stall) toward a real conversation? Open leads: the Word card as "say it back", the Local detail line, Memories (V2), cards that give the Visitor something to say rather than something to read.
3. **How the pack is used.** Everything in one prompt, the model picks an id, the code fills the card. Is that the right cut? Alternatives: model writes the card freely (richer, can invent), retrieval (search then inject), deterministic matching without the model.
4. **What goes on a card.** The pack lacks spice, main meat and allergens as fields; 10 demo dishes were filled by hand in `application/lib/context/overlay.ts`, from memory, unreviewed.
5. **Card format.** Collapsible B with allergen icons (decision 9) versus the Kratip C2 card now in the app.

## Known limits of what is built

- Tested with macOS synthetic voices only; no real Northern accent, no noise, no real phone.
- Cards are in English whatever the Visitor's language (the pack is English).
- No rate limit on `/api/*`: anyone with the URL spends the Gemini quota.
- The Visitor's first Turn can get a dish card from a description ("the brown curry" -> kaeng hang le): an inference, not a Mention.

## Code

`application/app/api/{transcribe,translate}/route.ts`, `application/lib/context/{cards,prompt,overlay,pack}.ts`, `application/lib/server/gemini.ts`, `application/scripts/build-pack.mjs`. Commits `5768425`, `a26cbb0`. Production: https://u-mueang.vercel.app (`NEXT_PUBLIC_TURN_SERVICE=api`).
