# 04 — Vision route on Gemini

**What to build:** `POST /api/photo` that reads the image with Gemini and returns a `PhotoCard`, and the real `readPhoto` in the Gemini turn service. Same shape as `/api/translate`: key server-side only, structured JSON output, fallback model, timeout inside the engine's limit.

- Input: FormData `image` (JPEG, max 4 MB), `language`, `myInfo` (JSON).
- Prompt: classify into the four kinds, answer in the visitor's language, keep Thai names, flag About you conflicts as "may contain", never as a guarantee. Use the Context Pack (`lib/context/`) to anchor dishes and local produce, like translate does.
- Output validated against the `PhotoCard` type; anything off falls back to `sign` with a plain description.

**Blocked by:** 01.

**Status:** done (the sign kind checked on a generated image only)

Real photos checked locally (2026-09-27, About you = peanuts + shellfish, `gemini-3.6-flash`):
- Menu (real Chiang Mai appetizers menu): 11 dishes, Thai names and prices, the 5 shellfish dishes flagged. 7.3 s: over the 6 s target, long menus are slow.
- Fruit (dragon fruit at a market): Produce card "Dragon fruit / แก้วมังกร", how to eat it. 2.5 s.
- Menu, handwritten Thai-only chalkboard (som tam stall): 6 dishes out of ~35, Thai names right, shellfish, peanut and pork (no-pork diet) flags right, one weak romanisation ("Plat Thot"). 6.2 s.
- Dish (pork and offal clear soup): Dish card, meat Pork, spice 0, diet conflict flagged. 2.5 s.
- Sign: only a generated Thai image so far ("Please remove shoes", 2.1 s).
- Production URL, real appetizers menu: 200 in 4.8 s (2026-09-27, after the merge to main).

- [x] Route returns a valid `PhotoCard` for a menu, a dish, a fruit and a sign (4 real test photos, not committed if they show people)
- [x] 413 over 4 MB, 502 on provider failure or missing key, same as the other routes
- [x] Answer lands in under ~6 s on the production URL for a menu photo
- [x] Image never stored or logged server-side
- [x] `docs/contract.md` lists the route, its errors and timeouts
- [x] `npm test` and `npm run build` green
