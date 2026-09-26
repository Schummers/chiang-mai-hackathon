# 03: Home screen carries the pitch

**What to build:** someone who scans the QR code understands in 3 seconds what the app does and why it is not Google Translate. The empty conversation (`components/ChatThread.tsx`) keeps "Say what's on your mind. We'll turn it into clear Thai." as the promise (ramble freely, we organise and translate), and adds the product line **"Don't just order. Make the vendor smile."**

**Blocked by:** None, can start immediately.

**Status:** done

- [x] Empty state: brand line "Don't just order. Make the vendor smile." above the existing two lines
- [x] One short hint under them, e.g. "Ramble, hesitate, change your mind. We keep what you mean." (final wording to Jonathan)
- [x] `app/layout.tsx` description and Open Graph text use the same line, so the shared link says it too
- [x] Nothing else on the screen moves; fits a 375 px wide phone without scrolling
- [x] `npm run build` green

**Note:** the hint shipped as "Ramble, hesitate, change your mind. We keep what you mean." as a draft; the final wording is Jonathan's call (one string in `components/ChatThread.tsx`). Checked at 375x812: no scroll.

**Update 2026-09-27:** home copy replaced by two lines, "Say it however it comes." / "We make it clear Thai, and teach you a few words to say yourself." (`HOME` in `lib/pitch.ts`, also the page description and Open Graph/Twitter text). The brand line and the hint are gone; "Don't just order. Make the vendor smile." is no longer in the app, the pitch is TBD. Re-checked in the browser at 375x812 with the mock service: empty state with the About you card fits, no scroll (document and chat both at 812 px). The About you page also fits at 375x812, Done pinned at the bottom.
