# DESIGN.md — อู้เมือง (U Mueang)

**Direction validated**: "Two Voices, One Paper" (proposal 1, 2026-09-26).
Visual reference: [`v2/proposal-1.html`](v2/proposal-1.html). Logo: `WhatsApp Image 2026-09-26 at 22.03.43.jpeg`.
Agents building `prototype/`: read this before writing any UI. Light mode only.

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
| Show XL | Thai 700 | 27 / 39 | Question in show mode |
| Reply pill | Thai 600 | 20 / 27 | Vendor quick replies |
| Thai in chat | Thai 600 | 19 / 28 | Thai output in your bubble |
| Dish name | Latin 800 | 17 / 22 | Dish card title (Thai name 15px, ink-2, after it) |
| Translation | Latin 500 | 16 / 24 | Translated vendor reply |
| Body | Latin 400 | 16 / 25 | Default |
| Secondary | Latin 400 | 14 / 20, ink-2 | Descriptions, source text |
| Speaker label | Latin 800 | 11, +0.09em, uppercase | "YOU" / "VENDOR", in identity color with a 7px dot |

## 3. Icons

- **Lucide**, pinned `0.460.0`. In React: `npm i lucide-react`. Stroke width **2.1** (holds up on a dim screen outdoors).
- Color: ink, or the speaker's color. Never a state color. No emoji as icons.
- Sizes: 16 inline, 20 in buttons and headers, 26 in the mic.

| Action | Lucide |
|---|---|
| Speak | `mic` |
| Play aloud | `volume-2` |
| Show vendor | `hand-helping` |
| Hand back | `arrow-left-right` |
| Read a menu | `camera` |
| Dish | `soup` |
| Spice | `flame` (or the 3-bar heat meter) |
| Allergy stop | `octagon-x` |
| Fits you | `check` |
| Ask next | `message-circle-question` |
| My needs | `sliders-horizontal` |
| Meat | `drumstick` |

## 4. Backgrounds and card levels

Only two backgrounds exist under content: paper (page) and white (lifted). Washes sit flat on paper: they carry identity, not depth. Depth is reserved for information you act on.

| Level | Name | Background | Shadow | Radius | Use |
|---|---|---|---|---|---|
| L0 | Ground | `--paper` | none | none | Screen, dock |
| L1 | Voice | `--you-wash` or `--them-wash` | none | 18, tail corner 6 | Messages (you right, them left) |
| L2 | Info card | `--white` | `--sh-2` | 14 | Dish cards |
| L3 | Sheet | `--white` or `--them-wash` | `--sh-3` | 22 top | Reply sheet, settings |

```css
--sh-2: 0 1px 2px rgb(30 34 56 / .06), 0 6px 16px -6px rgb(30 34 56 / .14);
--sh-3: 0 -10px 30px -8px rgb(30 34 56 / .20);
--r: 14px;
```

## 5. Components

| Component | Spec |
|---|---|
| **Your message** | L1 you-wash, right-aligned, max 90%. Source text (14, ink-2), hairline, Thai (19/600), then actions: "Play" ghost + "Show vendor" solid indigo |
| **Vendor message** | L1 them-wash, left-aligned. Thai original (17/500, ink-2), hairline, translation (16/500, ink) |
| **Dish card** | L2 white. Latin name 17/800 + Thai name 15/500 ink-2, one-line description 14 ink-2, facts row 13/700 with icons |
| **Heat meter** | 3 bars 7x12, radius 2. On = ink, off = `--line-2`. Label: Mild / Medium / Hot |
| **Allergy / conflict** | **Inversion, not red**: solid ink stamp on top of the card (`octagon-x` + "Contains pork" / "You avoid pork", white text 14/800), card gets a 2px ink ring, dish name struck through. The darkest thing on screen. |
| **Fits you** | Just `check` + "Fits you" in the facts row. No green. |
| **Follow-up suggestion** | Transparent, 1.5px dashed indigo border, radius 14, `message-circle-question` in indigo, English line + Thai line (13, ink-2) |
| **Buttons** | Height 38 to 48, radius 12, 700 14px. Solid = indigo bg, white text. Ghost = white bg, indigo text, inset 1.5px `--line-2` |
| **Mic** | 60x60, radius 20 (squircle, not a circle), white icon 26. Indigo for you, clay for the vendor in show mode |
| **Dock** | Paper, top hairline. Field (white, inset hairline, "Type or read a menu", `camera`) + mic |
| **Header** | Logo mark 34px, context title 16/800 ("Kad Luang market"), preferences line 12 ink-2 with `sliders-horizontal` |

### Show mode (vendor holds the phone)

- Screen background white. Top bar: "Hand back" ghost button, language tag `ไทย · English`.
- **Top: your question** in a you-wash block (radius 22, tail corner 6): label `ลูกค้าถามว่า`, Thai at Show XL, English gloss 13 ink-2, "ฟังอีกครั้ง" play button.
- **Bottom: the vendor's side**, an L3 sheet in them-wash: label `แตะเพื่อตอบ` / `หรือกดไมค์แล้วพูด` in clay, clay mic, then full-width white reply pills (min 47px tall, Thai 20/600, `chevron-right` in clay).
- The logic: indigo = what you asked, clay = everything the vendor can touch.

## 6. Spacing and touch

- Spacing: 4, 6, 8, 10, 12, 14, 16, 24. Screen gutter 14 to 16px, stream gap 12px.
- Touch targets ≥ 44px, reply pills ≥ 47px, mic 60px.
- Focus: `outline: 3px solid var(--you); outline-offset: 2px`.

## Voice

- Warm, curious, market-level. "Show vendor", "Hand back", "Ask: how long have you run this stall?".
- Thai first on everything the vendor sees.

## Don't

- No red, green or yellow status colors. No gold, no temple clichés.
- No colored text on washes (except speaker labels).
- No shadows on messages. No emoji icons.
- Remove the Vite defaults in `prototype/src/index.css` (purple `#aa3bff`, dark mode).
