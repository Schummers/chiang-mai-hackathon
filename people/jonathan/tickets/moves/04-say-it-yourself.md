# 04: Say it yourself

**What to build:** next to Play on any of the Visitor's translated bubbles, a "Say it yourself" control opens a sheet that teaches the Visitor to say that Thai sentence: the Thai, the syllable phonetics, and two buttons, listen and listen slowly. The Visitor stops being translated and starts speaking.

**Blocked by:** None, can start immediately.

**Status:** done

- [x] `/api/translate` returns, for each Visitor item, a `romanised` string: simple syllables a Western tourist can read, separated by spaces or hyphens (e.g. "a-ròi mâak kráp"). Same Gemini call, no extra request
- [x] Control on the Visitor bubble, right of Play, label "Say it yourself"
- [x] Sheet: Thai big, romanised under it, English meaning; buttons "Listen" and "Slowly" (`lib/speech.ts` with a lower rate, around 0.6)
- [x] Closes with a tap outside or a swipe down; does not interrupt a recording in progress
- [x] No pronunciation scoring (V2)
- [x] Unit test for the schema change; `npm test` and `npm run build` green
