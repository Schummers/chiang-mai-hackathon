# Status

Updated 2026-09-27. Production: https://u-mueang.vercel.app (every push to `main` deploys; preview URLs need a Vercel login).

## Works

- Full front-end on the mock: two mics, recording with auto-stop, bubbles, context card, speech, My info, language picker, errors and Retry (issues #2 to #11, closed).
- Kratip design: tickets 01 to 05 applied ([`people/jonathan/tickets/kratip/`](../../people/jonathan/tickets/kratip/)). The logo mark is still the placeholder SVG (`components/Logo.tsx`).

- **Real back-end, live in production** (`NEXT_PUBLIC_TURN_SERVICE=api`, `GEMINI_API_KEY` in Vercel): `app/api/transcribe` (~1.6 s), `app/api/translate` (~2 to 4 s), cards from the Context Pack. Checked by calling the production routes: Thai transcription, French and German translation, dish card with peanut flag, Word card for ยินดีเจ้า, off-guide card with shellfish flag.

## In progress

- **Cards and back-end under review**: Jonathan is not convinced yet by the value added, the use of the pack and the cultural exchange. Grill input: [`people/jonathan/handoff-cards-grill.md`](../../people/jonathan/handoff-cards-grill.md). Before the demo only small changes.
- **Demo readiness (#13)**: QR done ([`people/jonathan/demo/`](../../people/jonathan/demo/)). Missing: real iPhone and Android run, mock switch by URL flag, backup video.

## Not verified

- Nothing tested on a real phone yet (mic, Thai auto-play on iOS, Thai voice on Android).
- Vendor-side Thai texts to be checked by a Thai teammate (see `components/ErrorState.tsx`).
- Real back-end end to end in the UI, on a real phone, with a real Northern accent and market noise (only macOS synthetic voices so far).
- `lib/context/overlay.ts`: meat, spice and allergens of 10 demo dishes written from memory, to review with a Thai teammate.

## Known limits

- No rate limit on `/api/*`: anyone with the URL spends the Gemini free quota, and the app stops (429) when it runs out. The fallback model uses the same key.
- Cards are in English whatever the Visitor's language (the pack is English).
- Gemini free tier: Google may use the requests to improve its models.
- Timeout mismatch: Gemini fallback can take up to 24 s, the engine stops at 15 s (see [contract.md](contract.md)).
- Falling back to the mock needs a Vercel env change and a redeploy (see [contract.md](contract.md)).
