# DESIGN.md — อู้เมือง (U Mueang)

**Direction validated**: "Two Voices, One Paper" (2026-09-26), refined into **Kratip** (2026-09-27).
Visual reference: [`explorations/kratip-v2.html`](explorations/kratip-v2.html) (picks: M2, P1, C2, S2, K1 + K3/K4/K5). Logo: `WhatsApp Image 2026-09-26 at 22.03.43.jpeg`.
Agents building `application/`: read this before writing any UI. Light mode only.

## Kratip, in one line

**The weave is the ground, white is what floats on it.** The logo's basket weave sits at 5% behind everything. Every card is white. Identity is a colored edge, not a wash. The weave at full strength appears in one place only: the frame of the context card, the one thing that belongs to both people.

## Logo

- Mark = the ก๋วย (woven bamboo market basket) shaped as a speech bubble. Weave = conversation builds connection, open tail = local knowledge leaving the market. Mor Hom indigo = artisans' dyed shirts, clay = Lanna terracotta, on Sa paper. No gold, ever.
- Header: mark 34px + wordmark **อู้เมือง** (Thai 700, 22px, indigo) with **U Mueang** under it (Latin 800, 10px, +0.14em, uppercase, clay). No location line.
- The SVG in the explorations is a placeholder. Get the source of the real mark or trace it cleanly (bamboo rim with knots, herringbone weave, tail bottom-left).

## Name

- **อู้เมือง** (Kham Mueang, "to speak the local tongue"). Latin: **U Mueang**.
- The logo render shows a garbled Latin line ("Uู Muang"): fix to `U Mueang` before the demo.

## Core principle

**Color means one thing only: who is speaking.**

- Indigo = you (the visitor). Clay = them (the vendor).
- Identity lives in the **background wash** of a card or bubble, not in the text.
- Text is always ink, for both voices, at full contrast in market sunlight.
- States (safe, spicy, allergy) never get their own color. No green, no red, no yellow.

## 1. Palette (7 colors, that is all)

```css
:root {
  --paper:     #FAF9F6; /* L0 ground, app background */
  --white:     #FFFFFF; /* raised surfaces: dish cards, sheets */
  --ink:       #1E2238; /* all text, both voices, allergy stamp */
  --you:       #2B3263; /* Mor Hom indigo: visitor label, mic, primary action */
  --you-wash:  #ECEEF5; /* everything the visitor says */
  --them:      #8A5A44; /* muted clay, leans brown: vendor label, vendor mic */
  --them-wash: #F3ECE6; /* everything the vendor says or can tap */

  /* derived by alpha, not new colors */
  --ink-2:  rgb(30 34 56 / .70); /* secondary text */
  --line:   rgb(30 34 56 / .10); /* hairlines */
  --line-2: rgb(30 34 56 / .18); /* stronger lines, inactive marks */
}
```

| Rule | Detail |
|---|---|
| You = indigo | Wash for what you said. Solid indigo only for what you tap: mic, "Show vendor". |
| Them = clay | Wash for what the vendor said or can tap. Solid clay only for the vendor's mic in show mode. |
| Text is always ink | Primary = `--ink`, secondary = `--ink-2`. Never indigo or clay text on a wash, except the small speaker label. |
| Clay is earth, not alarm | Hue pushed toward brown, low chroma. Never use the logo's brighter `#AA523A` in UI. |
| No new colors | Need a variant? Use ink alpha. Adding an 8th color needs the owner's OK. |

## 2. Typography

| Script | Font | Weights |
|---|---|---|
| Thai | **Noto Sans Thai Looped** (fallback Noto Sans Thai, Thonburi) | 400 to 700 |
| Latin | **Atkinson Hyperlegible Next** (fallback system-ui) | 400 to 800 |

```html
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@400;500;700;800&family=Noto+Sans+Thai+Looped:wght@400;500;600;700&display=swap" rel="stylesheet">
```

```css
--f-lat: 'Atkinson Hyperlegible Next', system-ui, sans-serif;
--f-th:  'Noto Sans Thai Looped', 'Noto Sans Thai', 'Thonburi', sans-serif;
```

Why: looped Thai is familiar from signage and school print (older vendors); Atkinson is built for low vision and glare.
Thai is always set one step larger than the Latin next to it.

| Style | Font / weight | Size / line-height | Use |
|---|---|---|---|
| Title | Latin 800 | 30 / 32, -0.02em | Session start |
| Thai in chat | Thai 600 | 19 / 28 | Big Thai in your message, small Thai in the vendor's |
| Dish name | Latin 800 | 17 / 22 | Dish card title (Thai name 15px, ink-2, after it) |
| Translation | Latin 500 | 16 / 24 | Translated vendor reply |
| Body | Latin 400 | 16 / 25 | Default |
| Secondary | Latin 400 | 14 / 20, ink-2 | Descriptions, source text |
| Small caps | Latin 800 | 11, +0.09em, uppercase | Card labels ("Special dish"), dock verbs |

## 3. Icons

- **Lucide**, pinned `0.460.0`. In React: `npm i lucide-react`. Stroke width **2.1** (holds up on a dim screen outdoors).
- Color: ink, or the speaker's color. Never a state color. No emoji as icons.
- Sizes: 16 inline, 20 in buttons and headers, 26 in the mic.

| Action | Lucide |
|---|---|
| Speak | `mic` |
| Play aloud | `volume-2` |
| Stop | `square` |
| Working | `languages` |
| Local word | `book-open` |
| Hand-off | `arrow-left` / `arrow-right` |
| About you | `user-round` |
| New conversation | `plus` |
| Dish | `soup` |
| Spice | `flame` (or the 3-bar heat meter) |
| Allergy stop | `octagon-x` |
| Fits you | `check` |
| My needs | `sliders-horizontal` |
| Meat | `drumstick` |

## 4. Backgrounds and card levels

Only two backgrounds exist under content: paper (page) and white (lifted). Washes sit flat on paper: they carry identity, not depth. Depth is reserved for information you act on.

| Level | Name | Background | Shadow | Radius | Use |
|---|---|---|---|---|---|
| L0 | Ground | `--paper` + weave at 5% | none | none | Screen |
| L1 | Voice | `--white`, spine 3px inset + contour 1.5px in the speaker's color at 30% | `--sh-2` | 18, tail corner 6 | Messages (you right, them left) |
| L2 | Info card | `--white`, hairline `--line` | `--sh-2` | 16 | About you, listening, working |
| L2w | Context | `--white` inside a 3px woven frame | none | 16 (13 inside) | Dish and word cards |
| L3 | Dock | `--white`, floating | `--sh-dock` | 26 | Bottom bar |

```css
--weave-bg: repeating-linear-gradient(45deg, var(--them) 0 6px, transparent 6px 12px),
            repeating-linear-gradient(-45deg, var(--you) 0 6px, transparent 6px 12px); /* opacity .05 on the ground */
--weave-frame: repeating-linear-gradient(45deg, var(--them) 0 5px, var(--paper) 5px 7px, var(--you) 7px 12px, var(--paper) 12px 14px);
--sh-dock: 0 10px 30px -10px rgb(30 34 56 / .30), 0 0 0 1px var(--line);
```

Washes (`--you-wash`, `--them-wash`) are no longer message backgrounds: they go grey on the weave. They remain for small controls (play tool idle, vendor mic idle).

```css
--sh-2: 0 1px 2px rgb(30 34 56 / .06), 0 6px 16px -6px rgb(30 34 56 / .14);
--sh-3: 0 -10px 30px -8px rgb(30 34 56 / .20);
--r: 14px;
```

## 5. Components

| Component | Spec |
|---|---|
| **Message (both voices)** | L1 white card, max 92%, padding 14/16/12. You: right, spine on the right edge (`inset -3px 0 0 var(--you)`), contour `0 0 0 1.5px rgb(43 50 99 / .28)`. Vendor: left, spine left (`inset 3px 0 0 var(--them)`), contour `rgb(138 90 68 / .32)`. **No speaker label.** |
| **Message content** | Big = translation, small = original, hairline between. **Same list format in both halves**: one bullet per question, on a shared grid (`grid-template-columns: 14px 1fr`, gap 6) so Thai and Latin markers align. Marker in the speaker's color for the big text, `--line-2` for the small. Thai big: 19/600 line-height 1.45. Latin big: 17/700 line-height 1.35. Small: 14, ink-2. |
| **Play** | Tapping anywhere on a message plays it. Tool at the bottom of the card, 34px, radius 10: idle = wash bg, speaker color, `volume-2` + "Play again" (or "Play"). Playing = solid speaker color, white text, same `volume-2` icon with its two arcs animated one after the other (opacity, ~0.8s loop), plus a soft ring breathing around the card. |
| **Listening** | Same message card, content = `mic` + "Listening" / `กำลังฟัง` + wave + timer, in the speaker's color, 15/700. |
| **Working** | Your raw transcript, italic ink-2, inside a card with an indigo light running around the edge (conic-gradient, 1.4s). Under it: `languages` + "Cleaning up and translating…" 12px ink-2. |
| **Context card** | L2w. Label 11/800 uppercase ink-2 with icon: **"Special dish"** (`soup`) or **"Local word"** (`book-open`). Name 17/800 + Thai 15/500 ink-2. One-line description 14 ink-2. Facts row 13/700 with icons and the heat meter. |
| **Context card, conflict** | Same card, **name not struck through**. 2px ink ring inside the woven frame, and a flag row at the bottom: solid ink, white 13/800, `octagon-x` + "May contain peanuts". Never "you avoid". Never red. |
| **About you** | L2 white card. Header `user-round` + "About you" 15/800, `x` to close. Chips: selected = solid indigo, white text, icon (`octagon-x` Peanuts, `flame` Mild); unselected = 1.5px `--line-2`. "+ Add" opens the full page. Language lives here too. |
| **Session start** | Centered: mark 56px, then "Say what's on your mind." 30/800 letter-spacing -.02em, then "We'll turn it into clear Thai." 15 ink-2. Starts 24px under the header. About you card below. |
| **Dock** | L3, floating: `left/right 12px, bottom 18px`, height 80, radius 26, padding 0 8. Two **64x64 squares, radius 18**: icon 24 on top, verb 11/800 uppercase under it (Thai verb 13/600, no uppercase). Vendor left: them-wash bg, clay icon and verb. You right: solid indigo, white. Same shape both sides. |
| **Dock, states** | Turn = pulse on the mic whose turn it is (box-shadow ring, 1.6s). Tap = that button becomes Stop (solid clay / solid ink, `square`, verb "หยุด" / "Stop"), the other dims to 35%. **Middle of the dock**: empty at rest; wave + timer in the speaker's color while listening (K3); `languages` + "Translating…" with both mics dimmed while working (K5); after your Thai has played, `arrow-left` + "ตาคุณ" in clay pointing at the vendor's button, gone when they tap (K4), mirrored in English after their reply. Never a logo in the middle. |
| **Header** | Mark 34 + wordmark, spacer, two 38px white squares (radius 12, `--sh-2`): `user-round` (About you), `plus` (new conversation). |
| **Heat meter** | 3 bars 6x11, radius 2. On = ink, off = `--line-2`. |
| **Buttons (elsewhere)** | Height 38 to 48, radius 12, 700 14px. Solid = indigo bg, white text. Ghost = white bg, indigo text, inset 1.5px `--line-2`. |

### Show mode

Dropped (PRD D2): one stable screen, the vendor uses their own mic in the dock.

## 6. Spacing and touch

- Spacing: 4, 6, 8, 10, 12, 14, 16, 24. Screen gutter 14 to 16px, stream gap 12px.
- Touch targets ≥ 44px, reply pills ≥ 47px, mic 60px.
- Focus: `outline: 3px solid var(--you); outline-offset: 2px`.

## Voice

- Warm, curious, market-level. "Show vendor", "Hand back", "Ask: how long have you run this stall?".
- Thai first on everything the vendor sees.

## Don't

- No red, green or yellow status colors. No gold, no temple clichés.
- No wash backgrounds on messages, no speaker labels, no strikethrough on dish names.
- No woven frame on anything but context cards. If everything is woven, nothing is.
- No "Your turn" text, no language label under the mic, no location line in the header.
- No emoji icons.
