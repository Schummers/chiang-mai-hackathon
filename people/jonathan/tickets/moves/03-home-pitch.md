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
