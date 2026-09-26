# Status

Updated 2026-09-27. Production: https://u-mueang.vercel.app (every push to `main` deploys; preview URLs need a Vercel login).

## Works

- Full front-end on the mock: two mics, recording with auto-stop, bubbles, context card, speech, My info, language picker, errors and Retry (issues #2 to #11, closed).
- Kratip design: tickets 01 to 05 applied ([`people/jonathan/tickets/kratip/`](../../people/jonathan/tickets/kratip/)). The logo mark is still the placeholder SVG (`components/Logo.tsx`).

## In progress

- **Real back-end (#12)**: `app/api/transcribe`, `app/api/translate`, `lib/server/gemini.ts`, `lib/context/` are written by jonathan and being tested. To switch on: `GEMINI_API_KEY` in Vercel, then `NEXT_PUBLIC_TURN_SERVICE=api`.
- **Demo readiness (#13)**: QR done ([`people/jonathan/demo/`](../../people/jonathan/demo/)). Missing: real iPhone and Android run, mock switch by URL flag, backup video.

## Not verified

- Nothing tested on a real phone yet (mic, Thai auto-play on iOS, Thai voice on Android).
- Vendor-side Thai texts to be checked by a Thai teammate (see `components/ErrorState.tsx`).
- Real back-end latency end to end (target ~5 s per Turn).
