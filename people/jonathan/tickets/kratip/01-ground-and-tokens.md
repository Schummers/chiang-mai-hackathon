# 01 — Kratip ground and tokens

**What to build:** the app stands on paper with the logo's basket weave at 5% behind everything, and the new tokens exist for the other tickets. Message washes are gone from bubbles (they turn grey on the weave); bubbles are plain white for now. Nothing else moves. Opening the app on a phone, the ground is visibly textured and every screen still works.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Global tokens added exactly as DESIGN.md §4: `--weave-bg`, `--weave-frame`, `--sh-dock`
- [ ] Ground = paper + weave at 5% opacity, on a layer that never intercepts taps and never scrolls with the chat
- [ ] Messages use white backgrounds, no wash; `--you-wash` / `--them-wash` remain defined for small controls
- [ ] Weave renders on iOS Safari and Android Chrome without banding or performance drop when the chat scrolls
- [ ] `prefers-reduced-motion` unaffected (the weave is static)
- [ ] `npm test` and `npm run build` green
