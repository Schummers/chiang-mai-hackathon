# Status

Updated 2026-09-27 (branch `max/claude-context`). Production: https://u-mueang.vercel.app (every push to `main` deploys).

## Works (checked locally)

- Browser speech-to-text, then Claude correction and translation, streamed. Checked by calling `/api/translate` with mangled Northern Thai transcripts and with a Thai-shopkeeper owner, and in the UI with an injected recognizer: bubble, heard line, context card, and a suggestion sent and read aloud in Thai.
- Context: About you (profile and notes), nearby places (`/api/places`, Google Places), local time with season and festivals, the Northern Thai guide. Each has a Settings switch.
- Tests: engine (streaming included), prompt, languages.

## Not verified

- Nothing on a real phone yet: real Chrome or Safari recognition of a Northern accent in market noise, Thai auto-play on iOS, geolocation prompt on iOS.
- Chrome for iOS speech recognition (WebKit, Apple's recognizer): expected to work, not tried.
- Thai UI strings (mic labels, errors) to be checked by a Thai teammate (`lib/language.ts`, `components/ErrorState.tsx`).

## Known limits

- No rate limit on `/api/*`: anyone with the URL spends the Anthropic and Google Maps quotas.
- Production needs `ANTHROPIC_API_KEY` and `GOOGLE_MAPS_API_KEY` in Vercel before this branch is merged.
- Only English and Thai UI strings for errors; other languages fall back to English.
- No typed input: a browser without speech recognition can't be used.
