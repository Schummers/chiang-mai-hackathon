# 04 — Context card C2

**What to build:** the dish or word card is the only thing on screen framed by the weave at full strength: a 3px woven frame (`--weave-frame`), white inside, radius 16 outside / 13 inside, padding 14/16. Top label in small caps with an icon: "Special dish" (`soup`) for dishes, "Local word" (`book-open`) for Kham Mueang words. Then the name 17/800 with the Thai name 15/500 next to it, a one-line description, and the facts row (meat icon, heat meter, "Vendor: no peanuts" with `check` when the vendor said so). When the card conflicts with About you, the same card gets a 2px ink ring inside the frame and a flag row at the bottom: solid ink, white 13/800, `octagon-x` + "May contain peanuts" (generic: "May contain <allergen>"). The name is never struck through. No red, ever.

**Blocked by:** 01 — Kratip ground and tokens.

**Status:** ready-for-agent

- [ ] Card matches DESIGN.md §5 "Context card" and "Context card, conflict"
- [ ] Label reads "Special dish" or "Local word" depending on the card type; no "based on your info" text
- [ ] Conflict state: ink ring + bottom flag "May contain <allergen>", name intact, facts row still shown
- [ ] Non-conflict state: no ring, no flag
- [ ] Heat meter: 3 bars 6x11, on = ink, off = `--line-2`
- [ ] Card is full width in the thread, slides in after the vendor's reply as today
- [ ] `npm test` and `npm run build` green
