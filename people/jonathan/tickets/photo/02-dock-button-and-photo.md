# 02 — Dock button and photo in the thread

**What to build:** the photo button in the middle of the dock, the photo landing in the thread, and the reading state. Runs on the mock from 01.

- **Button (variant 3):** 44px high, padding 0 14, radius 12, `--you-wash` bg, no stroke, `camera` 20 + "Photo" 14/700 in `--you`. Shown only when the middle is empty (at rest). Hidden while listening, reading, translating, or showing "ตาคุณ" / hand-off.
- **Capture:** `<input type="file" accept="image/*" capture="environment">` behind the button: the phone's own camera, no custom viewfinder. Downscale to ~1280px long side (JPEG ~0.8) before handing it to the engine.
- **Photo in the thread:** right side, width like your messages (`calc(100% - 70px)`), radius 16 with the bottom-right corner at 6, `--sh-2`, no frame, no stroke, `object-fit: cover`. Badge bottom-left: 24px pill, solid `--you`, white `camera` 14 + "Photo" 11/800. Full height (~180px) while reading, shrinks to a 70px strip when the card arrives (height transition, no layout jump).
- **Reading:** dock middle shows `scan-search` + "Reading the photo…" (13/700 ink-2), both mics muted like while translating.
- **DESIGN.md:** add "Photo button", "Photo in the thread" and "Dock, reading" rows to §5 in the same commit.

**Blocked by:** 01.

**Status:** ready-for-agent

- [ ] Button matches `explorations/photo-button.html` variant 3, 44px touch target
- [ ] Button never shows while the middle is narrating something else
- [ ] Cancelling the camera leaves the app exactly as it was
- [ ] Photo appears at once (before the read ends), full height, then shrinks when the card lands
- [ ] Both mics muted and not tappable while reading
- [ ] Works on iPhone Safari at the production URL
- [ ] `npm test` and `npm run build` green
