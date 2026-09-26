# 04 — Vision route on Gemini

**What to build:** `POST /api/photo` that reads the image with Gemini and returns a `PhotoCard`, and the real `readPhoto` in the Gemini turn service. Same shape as `/api/translate`: key server-side only, structured JSON output, fallback model, timeout inside the engine's limit.

- Input: FormData `image` (JPEG, max 4 MB), `language`, `myInfo` (JSON).
- Prompt: classify into the four kinds, answer in the visitor's language, keep Thai names, flag About you conflicts as "may contain", never as a guarantee. Use the Context Pack (`lib/context/`) to anchor dishes and local produce, like translate does.
- Output validated against the `PhotoCard` type; anything off falls back to `sign` with a plain description.

**Blocked by:** 01.

**Status:** in progress: waiting for 4 real photos and a production check

- [ ] Route returns a valid `PhotoCard` for a menu, a dish, a fruit and a sign (4 real test photos, not committed if they show people)
- [x] 413 over 4 MB, 502 on provider failure or missing key, same as the other routes
- [ ] Answer lands in under ~6 s on the production URL for a menu photo
- [x] Image never stored or logged server-side
- [x] `docs/contract.md` lists the route, its errors and timeouts
- [x] `npm test` and `npm run build` green
