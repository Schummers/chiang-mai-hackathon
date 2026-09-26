# Lanna context pack for Contextual Translate

Compiled 2026-09-26 for Claude Impact Labs, Chiang Mai.

This folder holds the context data for **Contextual Translate**, a translation web app for conversations between foreign nomads and local Northern Thai people (market vendors first). For each translation call the app builds a *context packet* from these files: place, month and season, a Kham Mueang glossary subset, dialect notes, festivals, etiquette and both people's profile cards. Claude then returns a translation and a short cultural note.

Every fact entry has a `source` URL and a `confidence` of `high`, `medium` or `low`. The research was done from the web on one day and has **not yet been reviewed by a native speaker**. Start with `EXPERT_REVIEW.md` before the demo.

## Start here

- `context_packet_example.json` is a ready-made packet for the hero demo: a nomad at Warorot Market (Kad Luang) on Saturday 26 September 2026. It shows the shape the app should build at runtime, and it can be pasted straight into a system prompt.
- `EXPERT_REVIEW.md` is the reviewer checklist, with the items that matter most for the demo first. `EXPERT_REVIEW_culture_tones.md` is an earlier checklist from a verifier. It covers the tones, norms, highland customs and beliefs files.

## Files

| File | What it holds | Entries |
|---|---|---|
| `context_packet_example.json` | Assembled demo packet: Warorot, September climate, in-season produce, a 30-word glossary subset, dialect notes, 4 festivals, etiquette tips, example profile cards | 1 packet |
| `kham_mueang_glossary.json` | Kham Mueang words and phrases: Northern Thai script, Northern romanisation, Central Thai, English, category, usage note (greetings, particles, market, food, dishes, ingredients, kinship, numbers) | 187 |
| `sound_correspondences.json` | Rules for normalising Northern speech or spelling to Central Thai (ค/ช/ท/พ→ก/จ/ต/ป, ร→ฮ, มะ→บะ, tone-mark stripping), a lexical map and false friends (ยินดี = thank you) | 5 consonant, 3 vowel/tone rules, 6 false friends |
| `lanna_dict_full.json` | PyThaiNLP `lanna_dict` (from Thai Wiktionary): Tai Tham script, Thai-script spelling, IPA with tones, Thai glosses | 1,502 |
| `lanna_dict_index.json` | Lookup from a Thai-script spelling to entry IDs in `lanna_dict_full.json` | 1,935 keys |
| `regional_dialects.json` | 10 Northern provinces: varieties, minority languages, features, example words, app notes; plus cross-cutting normalisation and a list of Northern marker tokens | 10 provinces |
| `northern_thai_tones.json` | 6 Chiang Mai tones vs 5 Central Thai tones, Gedney box mapping, minimal pairs, ASR pitfalls, romanisation advice | 6 tones, 8 ASR pitfalls |
| `climate_by_month.json` | Chiang Mai 1991-2020 climate normals by month; season; air quality (haze); Lanna month (Central Thai month + 2); what locals talk about | 12 |
| `weather_apis.json` | Live weather and air-quality APIs (Open-Meteo recommended, needs no key), Thai AQI bands | 7 APIs |
| `seasonal_produce.json` | Northern produce calendar: months, peak months, Kham Mueang name, dishes, where sold | 68 |
| `northern_dishes.json` | Northern dishes with Thai script, ingredients and season | 37 |
| `festival_calendar.json` | Festivals Oct 2026 to Dec 2027 with ISO dates, an `estimated` flag, lunar rule, etiquette and an `alcohol_ban` flag | 19 |
| `etiquette.json` | Etiquette rules, Lanna concepts (khwan, phi, phit phi, khantoke, sin tin chok), good and avoid conversation topics | 13 rules, 5 concepts |
| `cultural_norms.json` | General Thai and Northern social norms, each with do/don't and a `translation_implication` | 32 |
| `beliefs_superstitions.json` | Spirits, taboos, lucky and unlucky things, and whether each is a good conversation topic | 23 |
| `ethnic_groups.json` | 17 groups (self-designation, exonyms to avoid, languages, greetings, foods, festivals) plus 9 Chiang Mai places | 17 + 9 |
| `highland_customs.json` | Customs of highland and Tai minority groups for respectful market and village interaction | 14 groups |
| `places.json` | 23 Chiang Mai markets: Thai name, lat/lon, hours, vendors, likely languages, signature foods (`dish_ref` points into `northern_dishes.json`), nomad tips | 23 |
| `*.md` (11 files) | A readable summary of each JSON file with sources and gaps | – |

## How the app should use each file

1. **Place.** Find the nearest entry in `places.json` with Haversine distance from the user's GPS position; the coordinates ship with the pack, so no geocoding API is needed at runtime. Copy its `likely_languages`, `signature_foods` and `nomad_tips` into the packet.
2. **Time.** Take the month from `climate_by_month.json` (season, `lanna_month`, small-talk topics). Optionally add live weather and PM2.5 from Open-Meteo (see `weather_apis.json`).
3. **Produce and food.** Filter `seasonal_produce.json` to entries where `9 in months` (the current month); list `peak_months` items first. Then add dishes from `northern_dishes.json` whose ingredients are in season, plus the place's `dish_ref` dishes.
4. **Glossary.** Always include the core set: greetings, เจ้า/คับ, ยินดี, เต้าใด, ซาว, บ่, ก่อ, ลำ and address terms. Add food and ingredient entries that match the produce and dishes above. Keep it to about 25-40 entries per call.
5. **Understanding the vendor.** Run the input through `sound_correspondences.json` and look up unknown tokens in `lanna_dict_index.json` → `lanna_dict_full.json`. Use the marker tokens in `regional_dialects.json` to detect Northern-mixed speech and tag it. Do not "correct" it.
6. **Festivals.** Include any festival whose date range covers today, plus the next one or two. If a festival has `alcohol_ban: true` and the user mentions alcohol, add a note.
7. **Etiquette and culture.** Pick 2-4 tips from `etiquette.json` and `cultural_norms.json` that fit the place type. Use `beliefs_superstitions.json` only when the conversation touches on it.
8. **People.** Inject a group entry from `ethnic_groups.json` or `highland_customs.json` **only if a profile card states that group**. Never infer anyone's ethnicity. Never output exonyms for people (แม้ว, เงี้ยว, อีก้อ, "hill tribe"). Dish names that contain เงี้ยว, such as ขนมจีนน้ำเงี้ยว, are fine.
9. **Output policy.** Reply to vendors in polite Central Thai, with Northern particles only if the user opts in. Echo every price in digits. Do not generate full Kham Mueang sentences.

## Licences and sources

- Most files are original compilations of facts, each with a cited URL. Facts are not copyrightable, but keep the source URLs if you publish.
- `lanna_dict_full.json` and `lanna_dict_index.json` come from PyThaiNLP `lanna_dict` (Hugging Face), which is derived from Thai Wiktionary and licensed **CC BY-SA 3.0**. Keep the attribution, and share derived data under the same licence.
- Speech datasets listed in `lanna-language.md` for possible future use: the SLSCU Thai-dialect corpus is CC BY-SA 4.0. CMKL Porjai-khummuang is **CC BY-NC-SA 4.0**, so it is non-commercial only. The MDPI and PaSCoNT datasets have no public release that we could confirm.
- Climate normals come from the Wikipedia tabulation of WMO/TMD 1991-2020 data. The TMD site itself was blocked from our environment.
- Festival dates come from myhora's Thai lunar calendar, Kapook, Chiang Mai News, MGR Online and Nation Thailand. Entries marked `estimated: true` are not official.
- Many vocabulary sources are Thai community or educational websites rather than academic dictionaries. The CMRU Lanna Dictionary and the Mae Fah Luang dictionary could not be accessed.
- Coordinates come from Wikipedia, Longdo Map, Mapcarta/OSM and Wongnai. None were checked live, and two places have `null` coordinates.

## Changes the compiler made on 2026-09-26

See the "Compiler fixes" section of `EXPERT_REVIEW.md`. There were four small edits:
- the alcohol-exemption wording in `cultural_norms.json`
- a removed unsourced spelling (`ดอกเงี้ยว`) in `seasonal_produce.json`
- the guava confidence in `kham_mueang_glossary.json`, lowered to medium
- a clarification in `regional_dialects.json` that dish names containing เงี้ยว are fine

## Sources

See SOURCES.md for every source used, grouped by type. Review checklists: EXPERT_REVIEW.md (main) and EXPERT_REVIEW_culture_tones.md (tones, etiquette, highland customs, beliefs).
