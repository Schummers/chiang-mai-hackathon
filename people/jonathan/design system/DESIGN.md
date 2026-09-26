# DESIGN.md — อู้เมือง (U Mueang)

Source of truth for the look of the app. Agents building `prototype/`: read this before writing any UI.
Logo: `WhatsApp Image 2026-09-26 at 22.03.43.jpeg` (same folder). Light mode only for the demo.

## Name

- **อู้เมือง** (Kham Mueang, "to speak the local tongue"). Latin: **U Mueang**.
- The current logo render shows a garbled Latin line ("Uู Muang"): fix it to `U Mueang` before the demo.

## Concept

The logo is a **ก๋วย** (woven bamboo basket from Lanna market stalls) shaped into a speech bubble with an open tail.

| Element | Meaning | UI translation |
|---|---|---|
| Basket | Everyday commerce, the market stall | The app lives at the stall, not in a classroom |
| Weave | Shared conversation builds connection | Two voices interleaved: visitor (indigo) and vendor (clay) turns alternate |
| Open tail | Local knowledge opening up beyond the market walls | Explanations (dish cards) always point back to the conversation |

Palette logic: natural, functional tones, **no gold**. Mor Hom indigo (artisans' blue-dyed cotton shirts) + clay red (Lanna terracotta) on Sa paper.

## 1. Color palette (light mode)

Brand values sampled from the logo (`indigo-700` and `clay-500`).

### Scales

| Step | Indigo (Mor Hom) | Clay (terracotta) | Paper (Sa) |
|---|---|---|---|
| 50 | `#F0F1F6` | `#FBF1ED` | `#FDFCF8` |
| 100 | `#E1E3EE` | `#F5E4DD` | `#FAF8F2` |
| 200 | `#C3C7DC` | `#EBC6B8` | `#F4F0E6` |
| 300 | `#9CA2C3` | `#DDA08B` | `#EAE4D5` |
| 400 | `#6F77A0` | `#CB7A60` | `#D9D1BE` |
| 500 | `#4E5684` | **`#AA523A`** | `#B8AE97` |
| 600 | `#3A4172` | `#8F4330` | `#8C836E` |
| 700 | **`#2B3263`** | `#733627` | `#5F5849` |
| 800 | `#1F2549` | `#57291E` | `#3D392F` |
| 900 | `#141833` | `#3B1C14` | `#22201A` |

### Semantic tokens

```css
:root {
  /* Backgrounds */
  --bg-app: #FAF8F2;         /* paper-100, the page */
  --bg-sunken: #F4F0E6;      /* paper-200, input fields, wells */
  --bg-surface: #FDFCF8;     /* paper-50, cards level 1 */
  --bg-raised: #FFFFFF;      /* cards level 2 and sheets only */
  --bg-show: #FDFCF8;        /* full-screen show mode */
  --bg-visitor: #E1E3EE;     /* indigo-100, your bubbles */
  --bg-vendor: #F5E4DD;      /* clay-100, vendor bubbles, Thai output */
  --bg-overlay: rgb(20 24 51 / 0.40); /* indigo-900 scrim behind sheets */

  /* Text */
  --text-primary: #2B3263;   /* indigo-700, body is indigo, never black */
  --text-secondary: #4E5684; /* indigo-500 */
  --text-muted: #6F77A0;     /* indigo-400, meta and romanization, ≥ 16px only */
  --text-on-accent: #FFFFFF;
  --text-thai: #733627;      /* clay-700, Thai output on vendor bubbles */

  /* Actions */
  --accent: #AA523A;         /* clay-500, primary button, mic */
  --accent-hover: #8F4330;   /* clay-600 */
  --accent-pressed: #733627; /* clay-700 */
  --accent-soft: #F5E4DD;    /* clay-100 */
  --secondary: #2B3263;      /* indigo-700, secondary buttons, outlines */
  --focus-ring: #6F77A0;     /* indigo-400, 2px outline, 2px offset */

  /* Lines */
  --border: #EAE4D5;         /* paper-300, hairlines */
  --border-strong: #D9D1BE;  /* paper-400, card outlines */
  --border-brand: #2B3263;   /* indigo-700, logo-style 2px frame */

  /* Status */
  --spicy: #AA523A;          /* chili dots */
  --danger: #B3261E;         /* allergy only, never decorative */
  --danger-soft: #FBE9E7;
  --success: #3F6B4E;        /* "safe for you" */
  --success-soft: #E6EFE8;
  --warning: #9A6B12;        /* "ask to confirm" */
  --warning-soft: #F8EFD9;
}
```

Contrast on `--bg-app`: indigo-700 ≈ 12:1, indigo-500 ≈ 7:1, clay-500 ≈ 5:1, white on clay-500 ≈ 5:1. All AA.

**Rules**
- Indigo = the visitor (you). Clay = the vendor and everything Thai. Keep this mapping everywhere, it is the weave.
- One clay primary button per screen (usually the mic).
- Never pure black text, never pure white page background.

## 2. Backgrounds

| Layer | Token | Use |
|---|---|---|
| App | `--bg-app` + optional Sa grain | Every screen |
| Sunken | `--bg-sunken` | Text inputs, the transcript well while recording |
| Show mode | `--bg-show`, no texture | Vendor view: maximum legibility |
| Accent band | `--accent` full bleed | Splash / onboarding only |

- **Sa paper grain**: SVG noise, opacity ≤ 4%, on `--bg-app` only. Never behind Thai text in show mode.
- **Weave pattern**: the diagonal basket weave from the logo, clay-300 on paper. Accent only: splash, empty states, listening ring around the mic. Never full-screen behind content.

## 3. Elevation (card levels)

Flat and paper-like: elevation comes from tone + border first, shadow second.

| Level | Name | Background | Border | Shadow | Use |
|---|---|---|---|---|---|
| 0 | Flat | `--bg-app` | none | none | Page, lists, chat stream |
| 1 | Card | `--bg-surface` | `1px solid var(--border)` | `0 1px 2px rgb(43 50 99 / 0.06)` | Dish card, preference chips group, history items |
| 2 | Raised | `--bg-raised` | `1px solid var(--border-strong)` | `0 4px 12px rgb(43 50 99 / 0.10)` | Active/selected card, floating mic bar |
| 3 | Sheet | `--bg-raised` | none | `0 -8px 24px rgb(43 50 99 / 0.14)` | Bottom sheets, show-mode reply panel, over `--bg-overlay` |
| Brand | Bubble frame | `--bg-show` | `2px solid var(--border-brand)` + tail bottom-left | none | Show mode frame only (echo of the logo) |

Radius: `8px` chips and inputs, `12px` cards, `20px` chat bubbles and sheets (top corners), `999px` pills and mic.

## 4. Typography

| Script | Font | Load |
|---|---|---|
| Thai | **Anuphan** (400, 500, 600), fallback `'Noto Sans Thai', sans-serif` | Google Fonts |
| Latin | **Inter** (400, 500, 600), fallback `system-ui` | Google Fonts |

```css
--font-thai: 'Anuphan', 'Noto Sans Thai', sans-serif;
--font-latin: 'Inter', system-ui, sans-serif;
```

### Text styles (mobile first)

| Style | Size / line-height | Weight | Font | Use |
|---|---|---|---|---|
| `display-show` | 36 / 52 | 600 | Thai | Thai message in show mode (read at arm's length) |
| `title-lg` | 24 / 32 | 600 | Latin | Screen titles |
| `thai-lg` | 24 / 38 | 500 | Thai | Thai output in the conversation |
| `title-md` | 18 / 26 | 600 | Latin | Card titles, dish names |
| `body-lg` | 17 / 26 | 400 | Latin | Cleaned request, translated reply |
| `body` | 15 / 22 | 400 | Latin | Card descriptions |
| `thai-body` | 17 / 28 | 400 | Thai | Thai inside cards |
| `button` | 16 / 20 | 600 | Latin | Buttons |
| `reply-pill` | 22 / 32 | 500 | Thai | Vendor suggested replies |
| `label` | 13 / 18 | 500, +0.2px tracking | Latin | Meta, tags, romanization |

Thai line-height always ≥ 1.5 (tone marks and vowels above/below).

## 5. Icons

- **Library**: [Phosphor Icons](https://phosphoricons.com), `npm i @phosphor-icons/react`. Rounded, hand-made feel that fits bamboo weave better than geometric sets.
- **Weight**: `regular` by default, `fill` for the active state, `duotone` for empty states only (duotone color = clay-300).
- **Sizes**: 20px inline, 24px in buttons and nav, 40px in the mic button.
- **Color**: inherits text color (`currentColor`). White on the clay mic.

| Action | Phosphor icon |
|---|---|
| Speak / record | `Microphone` (listening: `MicrophoneStage`) |
| Play Thai audio | `SpeakerHigh` |
| Show to vendor | `HandTap` or `ArrowsOut` |
| Photo of menu / stall | `Camera` |
| Dish card | `BowlFood` |
| Spicy | `Pepper` (1 to 3) |
| Allergy | `WarningCircle` (in `--danger`) |
| Safe for you | `CheckCircle` (in `--success`) |
| Meat / no pork | `Cow`, `Fish`, `Egg`, `Leaf` (veg) |
| Follow-up question | `ChatCircleDots` |
| Preferences | `SlidersHorizontal` |
| Back / close | `CaretLeft`, `X` |

No emoji as UI icons.

## 6. Spacing and touch

- Spacing scale: 4, 8, 12, 16, 24, 32, 48. Screen gutter 16px.
- Touch targets ≥ 48px. Vendor reply pills ≥ 56px tall, full width.
- Mic button: 88px, fixed bottom center, 24px above safe area.

## 7. Key components (mapped to the PRD flow)

| Component | Spec |
|---|---|
| **Mic button** | 88px `--accent` circle, white `Microphone` 40px. Listening: clay-300 weave ring pulses around it |
| **Cleaned request** | `--bg-visitor` bubble, right-aligned, `body-lg`, indigo text |
| **Thai output** | `--bg-vendor` bubble, `thai-lg` in `--text-thai`, `SpeakerHigh` button (clay outline 1.5px) |
| **Show mode** | Brand frame (2px indigo, tail bottom-left), Thai in `display-show`, replies as level-3 sheet of `reply-pill` buttons (clay-50 bg, clay-500 1.5px border), mic fallback |
| **Vendor reply** | `--bg-vendor` bubble left-aligned, Thai original `thai-body`, translation under it in `body-lg` indigo |
| **Dish card** | Level 1 card: `BowlFood` + name (Thai `thai-body` + Latin `title-md`), what it is (`body`), meat icon, 1–3 `Pepper` in clay, allergy badge `--danger-soft` bg + `--danger` text when it matches your preferences |
| **Follow-up suggestion** | Pill, 1.5px dashed indigo-400 border, `ChatCircleDots`: "Ask: How long have you run this stall?" |
| **Primary button** | `--accent` bg, white `button` text, 48px, radius 999px |
| **Secondary button** | Transparent, 1.5px `--secondary` border, indigo text |

## Voice

- Warm, curious, market-level. "Ask the vendor", not "Submit query".
- Thai first on anything the vendor sees. Show mode has no English except a small "translated by อู้เมือง" label.

## Don't

- No gold, no temple clichés, no elephants.
- No purple/blue gradients (the Vite default accent `#aa3bff` in `prototype/src/index.css` must go).
- No emoji as UI icons, no pure black, no pure white page.
