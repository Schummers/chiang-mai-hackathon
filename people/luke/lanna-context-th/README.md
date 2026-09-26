# lanna-context-th — Thai-source context pack

Second research round for Contextual Translate, built mainly from **Thai-language sources** (312 of 349 sources are Thai; see `SOURCES.md`). It extends `../lanna-context/` (the English-source pack). Retrieved 2026-09-26.

**Status: partial, not yet verified.** The research was cut off by a usage limit. The verifier agents did not run, so treat everything as draft and use `EXPERT_REVIEW.md`. Still to come: Mae Hong Son, Uttaradit, Tak, a Lanna-wide overview and pronunciation guide.

## Cooking — Northern food for foreigners (`cooking/`)

Each recipe covers where to buy each ingredient in Chiang Mai, substitutes abroad, equipment, step-by-step method with sensory cues, taste profile, how Northerners eat it, food-safety notes, and Kham Mueang pronunciation of dish and ingredient names. Text is bilingual (Thai + English).

| File | Contents | Entries |
| --- | --- | --- |
| `pantry.json` | Northern pantry: ingredients, Kham Mueang names, where to buy, substitutes | 52 |
| `eating_customs.json` | Sticky rice, eating by hand, khantoke, taste words in Kham Mueang | — |
| `foundations_recipes.json` / `.md` | Sticky rice, nam phrik noom, nam phrik ong, nam phrik nam pu, khaep mu | 5 |
| `larb_yam_tam_namphrik.json` / `.md` | Larb, yam, tam, sa, chilli dips | 13 |
| `kaeng_curries_soups.json` / `.md` | Hang lay, kaeng khae, kaeng hoh, jor phak kad and more | 13 |
| `grilled_sausage_fermented_wrapped.json` / `.md` | Sai ua, naem/jin som, aep, ho nueng, khao kan jin and more | 12 |
| `noodles_snacks_desserts_drinks.json` / `.md` | Khao soi, khanom jeen nam ngiao, desserts, miang and more | 16 |

## Provinces (`provinces/`)

Per province: dialect and pronunciation features, local vocabulary (with Central Thai and English), phrases, sayings, ethnic communities, beliefs and rituals, way of life, festivals, food specialties, markets, etiquette, conversation starters.

| File | Entries (vocabulary) |
| --- | --- |
| `chiang-mai.json` / `.md` + `chiang-mai-communities.json` (23 old communities) | 76 |
| `lamphun.json` / `.md` | 79 |
| `lampang.json` / `.md` | 86 |
| `chiang-rai.json` / `.md` | 77 |
| `phayao.json` / `.md` | 73 |
| `phrae.json` / `.md` | 81 |
| `nan.json` / `.md` | 85 |

## How the app should use it

- **Place → province file:** match the user's location to a province and send only that province's pronunciation notes, top vocabulary and etiquette.
- **Dish or ingredient mentioned → recipe/pantry entry:** send just that entry (a single recipe is a few thousand tokens; whole files are 40k–55k, too big to send every call).
- **Pronunciation:** use the `pronunciation` fields for dish and ingredient names in the cultural note.

## Licence and sources

Facts are summarised from the sources listed in `SOURCES.md`, with a URL and confidence level on each entry. Check the licence of any source before copying text verbatim.
