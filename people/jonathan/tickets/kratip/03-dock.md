# 03 — Dock K1 with a narrating middle

**What to build:** the bottom bar becomes a floating white dock, 80px tall, 12px from the sides and 18px from the bottom (plus safe area), radius 26. Two 64x64 squares (radius 18): icon 24 on top, verb under it inside the button. Vendor on the left: them-wash background, clay icon, verb "พูด" (Thai 13/600). You on the right: solid indigo, white, verb "SPEAK" (11/800 uppercase, localized to the visitor language). Same shape both sides. The middle of the dock narrates the state and is empty at rest: while someone speaks, a wave + timer in that speaker's color; while translating, `languages` + "Translating…" with both mics dimmed; after your Thai has played, `arrow-left` + "ตาคุณ" in clay pointing at the vendor's button, until they tap; mirrored in English (`arrow-right` + "Your turn") after the vendor's reply. The mic whose turn it is pulses. Tapping a mic turns it into Stop (solid clay / solid ink, `square` icon, verb "หยุด" / "Stop") and dims the other to 35%. The language picker leaves the dock entirely (no label, no menu; ticket 05 brings it back in About you).

**Blocked by:** 01 — Kratip ground and tokens.

**Status:** ready-for-agent

- [ ] Dock matches DESIGN.md §5 "Dock" and "Dock, states"; the chat scrolls behind it with enough bottom padding that the last message is never hidden
- [ ] Both buttons are the same size and shape; touch target ≥ 64px
- [ ] Middle shows exactly one of: nothing, listening (wave + timer), translating, hand-off hint; never a logo
- [ ] Hand-off hint appears after auto-play ends (or after the message is ready if audio is blocked) and disappears on the vendor's tap
- [ ] Pulse only on the mic whose turn it is; no pulse while listening or translating
- [ ] Stop state and dimming behave as described; auto-stop after a pause still returns the dock to rest
- [ ] Language label and picker removed from the dock; the saved language is still applied to the verb and to requests
- [ ] `npm test` and `npm run build` green
