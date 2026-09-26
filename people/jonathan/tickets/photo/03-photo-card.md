# 03 — Photo card, four kinds

**What to build:** the card that answers a photo. Same L2w woven frame as the context card (the app's voice), content adapted to what was recognised. Runs on the mock from 01, add a mock fixture per kind.

| Kind | Kicker (icon + label, 11/800 uppercase) | Body |
|---|---|---|
| Menu | `clipboard-list` "Menu · N dishes" | Up to 5 rows: name 13/800 + Thai 12 ink-2, right side a pill: About you conflict = solid ink `octagon-x` "Peanuts" (never red), else a `--you-wash` note ("Mild ok", "Local"). "+ N more" row when cut. Conflicts first. |
| Dish | `soup` "Dish" | Same as today's dish context card (name, Thai, description, facts, heat meter, conflict flag). |
| Fruit / ingredient | `apple` "Fruit / ingredient" | Name + Thai, one line on what it is and how it is eaten, season if known. |
| Sign / other | `signpost` "Sign" | What it says, in quotes, then what it means for you. |

Bottom of every card: an "Ask about this photo" tool, same style as Play (34px, radius 10, `--you-wash`, `--you`, `mic` + label). Ticket 05 wires it; here it can be inert.

**Blocked by:** 01.

**Status:** done

- [x] Four kinds render per the table and `explorations/photo-flow-v2.html`
- [x] Menu conflicts come from About you and sit at the top; never red, never struck through
- [x] A read with nothing useful shows a Sign / other card saying so, never an empty card
- [x] Card slides in like the context card (0.4s, reduced motion off)
- [x] `npm test` and `npm run build` green
