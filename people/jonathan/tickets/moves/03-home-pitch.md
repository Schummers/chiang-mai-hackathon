# 03: Home screen carries the pitch

**What to build:** someone who scans the QR code understands in 3 seconds what the app does and why it is not Google Translate. The empty conversation (`components/ChatThread.tsx`) keeps "Say what's on your mind. We'll turn it into clear Thai." as the promise (ramble freely, we organise and translate), and adds the product line **"Don't just order. Make the vendor smile."**

**Blocked by:** None, can start immediately.

**Status:** ready-for-agent

- [ ] Empty state: brand line "Don't just order. Make the vendor smile." above the existing two lines
- [ ] One short hint under them, e.g. "Ramble, hesitate, change your mind. We keep what you mean." (final wording to Jonathan)
- [ ] `app/layout.tsx` description and Open Graph text use the same line, so the shared link says it too
- [ ] Nothing else on the screen moves; fits a 375 px wide phone without scrolling
- [ ] `npm run build` green
