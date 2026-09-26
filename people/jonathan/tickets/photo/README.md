# Photo, tickets

The visitor takes a photo (menu, dish, fruit, sign), the app reads it at once and fills a card, then the visitor can ask about it by voice. Five vertical slices, each demoable on the Vercel URL on a phone.

Shared context for every ticket:

- Visual reference: `people/jonathan/design system/explorations/photo-flow-v2.html` (flow, 4 screens + card kinds) and `photo-button.html` (dock button, **variant 3** validated).
- Spec: `people/jonathan/design system/DESIGN.md`. Ticket 02 adds the photo rules to it. DESIGN.md wins over these tickets once updated.
- Rules: `application/CLAUDE.md`. The UI only talks to the engine, never to a provider. `npm test` and `npm run build` green before every push. Commit after every meaningful step, add only the files you changed.
- Deploy: Vercel builds every push to `main`. Test on a phone at the production URL (camera and mic need HTTPS).

## Decisions (2026-09-27, validated by jonathan)

| Question | Decision |
|---|---|
| Photo alone or with a question? | Read at once, no question needed (A). Asking is an optional follow-up (B). |
| Where is the photo button? | Middle of the dock, at rest only. Variant 3: 44px pill, radius 12, `--you-wash` bg, indigo `camera` icon + "Photo". |
| What does "Ask about this photo" do? | Exactly what Speak does: normal Listening card, wave + timer in the middle, Speak becomes Stop. Nothing listens inside the photo. |
| Who answers the question? | The app, in a woven card, in the visitor's language. Not the vendor. |
| Photo in the thread | Bare image, your corner shape (radius 16, bottom-right 6), indigo "Photo" badge, no frame, no stroke. Full width while reading, shrinks to a 70px strip when the card arrives. |
| Card kinds | Menu, Dish, Fruit / ingredient, Sign / other. |
| Dock middle while reading | `scan-search` + "Reading the photo…", both mics muted, same shape as "Translating…". |
| Vendor side | No photo. The vendor answers by voice. |

## Order

01 first. Then 02, 03 and 04 in any order. 05 last.

| # | Ticket | Blocked by |
|---|---|---|
| 01 | [Engine: photo turn and contract](01-engine-photo-turn.md) | none |
| 02 | [Dock button and photo in the thread](02-dock-button-and-photo.md) | 01 |
| 03 | [Photo card, four kinds](03-photo-card.md) | 01 |
| 04 | [Vision route on Gemini](04-vision-route.md) | 01 |
| 05 | [Ask about this photo](05-ask-about-photo.md) | 02, 03, 04 |
