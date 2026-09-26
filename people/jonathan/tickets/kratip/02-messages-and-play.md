# 02 — Messages M2 and Play P1

**What to build:** every message is a white card that says who speaks with a colored edge, and tapping it plays it aloud. Your messages: right, 3px indigo spine on the right edge, 1.5px indigo contour at ~30%. Vendor messages: left, clay spine and contour. No "You" / "Vendor" label. Big = translation, small = original, same list format in both halves, bullets on a shared grid so Thai and Latin markers align (marker in the speaker's color for the big text, hairline grey for the small). The separate speaker button outside the bubble disappears. At the bottom of each card, a play tool: idle = wash background, speaker color, `volume-2` icon + "Play" (or "Play again" on your own messages); playing = solid speaker color, white text, the same `volume-2` icon with its two arcs animating one after the other, and a soft ring breathing around the card. Tapping anywhere on the card toggles play.

**Blocked by:** 01 — Kratip ground and tokens.

**Status:** ready-for-agent

- [ ] Message card matches DESIGN.md §5 "Message" and "Message content" (padding 14/16/12, radius 18 with a 6px tail corner, sizes and weights per the typography table)
- [ ] Both halves render as the same list structure; single-item messages render as one bullet-less line in both halves
- [ ] Bullet markers align across Thai and Latin lines (shared `14px 1fr` grid, gap 6)
- [ ] No speaker labels anywhere in the thread
- [ ] Tap on the card plays; tap again stops; only one message plays at a time
- [ ] Play tool shows the idle and playing states; the `volume-2` arcs animate only while playing; the ring around the card breathes only while playing
- [ ] Animations off under `prefers-reduced-motion` (state still visible through the solid color)
- [ ] Thai auto-play after your message still works, and the card shows the playing state during it
- [ ] Listening and Working cards keep working inside the new card style (DESIGN.md §5 "Listening" / "Working")
- [ ] `npm test` and `npm run build` green
