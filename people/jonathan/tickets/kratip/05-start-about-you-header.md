# 05 — Session start S2, About you, header with logo

**What to build:** opening the app shows, centered and starting 24px under the header: the logo mark at 56px, "Say what's on your mind." at 30/800 (letter-spacing -0.02em), then "We'll turn it into clear Thai." at 15 in ink-2. Under it, the "About you" card (white, hairline, radius 16): header `user-round` + "About you" with an `x` to close for this session; chips where the **first chip is the visitor language** (`languages` icon + "English ▾", always in the selected style), tap opens the language list; then the allergy and spice chips (selected = solid indigo with icon, unselected = 1.5px outline), then "+ Add" opening the full page. Thai is fixed and never offered as a choice. The header gets the logo mark at 34px with the wordmark "อู้เมือง" (Thai 700, 22px, indigo) and "U Mueang" under it (Latin 800, 10px, +0.14em, uppercase, clay); no location line; on the right, two 38px white squares: `user-round` (opens About you) and `plus` (new conversation). The saved language drives the dock verb and every request, exactly as before ticket 03 removed the dock picker.

**Blocked by:** 03 — Dock K1 (the language picker must have left the dock first).

**Status:** ready-for-agent

- [ ] Empty screen matches DESIGN.md §5 "Session start" and "About you"; no "My info" wording anywhere
- [ ] Language chip is first, opens the same language list as before, and the choice persists on the phone
- [ ] Closing About you hides it for the session; the header `user-round` reopens it; `plus` starts a new conversation
- [ ] Header matches DESIGN.md "Logo" and §5 "Header"
- [ ] Logo mark is an inline SVG component (placeholder shape is acceptable, see note), colored with `--you` / `--them`, crisp at 34 and 56px
- [ ] Note in the component that the mark is a placeholder pending the real logo source (bamboo rim with knots, herringbone weave, tail bottom-left)
- [ ] `npm test` and `npm run build` green

Note: a placeholder SVG of the mark exists in `people/jonathan/design system/explorations/kratip-v2.html` (`<symbol id="mark">`), reuse it rather than drawing a new one.
