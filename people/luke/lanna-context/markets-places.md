# Chiang Mai markets and food places: the "places" layer

Data: `places.json` (23 places, schema `places.v1`). Each place has `id, name_en, name_th, name_rtgs, lat, lon, coord_source, type, area, open_days, hours, known_for[], typical_vendors[], likely_languages[], signature_foods[] {th, rtgs, en, dish_ref}, nomad_tips[], source, sources_extra[], confidence, review[]`. `dish_ref` points to an id in `northern_dishes.json`.

## How to use it in the context packet
- Pick the place from GPS (nearest within ~150 m) or a picker. Put `name_en/name_th`, `type`, `known_for`, `typical_vendors`, `likely_languages`, `signature_foods` and 1–2 `nomad_tips` into the packet.
- `likely_languages` is an **inference**, not a survey. Use it as a hint, e.g. "an older vendor at a local fresh market may answer in Kham Mueang". Don't present it as fact.
- Combine it with the month from `climate_by_month.json` / `seasonal_produce.json`. At the wholesale markets (Muang Mai, Ton Lamyai) the seasonal fruit is the main topic.
- Show hours as "typical". Sources disagree on several of them (see the `review` field).

## Quick table

| id | Thai | Type | Days / hours (typical) | Conf. |
|---|---|---|---|---|
| warorot | ตลาดวโรรส (กาดหลวง) | general / Chinatown | daily ~05:00–18:00, food stalls to ~22:00 | high |
| ton-lamyai | ตลาดต้นลำไย | wet market | outdoor 24h, indoor ~05:00–sunset | high |
| ton-lamyai-flower | – | flowers | 24h | medium |
| hmong-lane-warorot | – | Hmong textiles | daily ~07:00–17:00 | medium |
| muang-mai | ตลาดเมืองใหม่ | wholesale produce | 24h, peak pre-dawn | high |
| somphet | – | small Old City market | daily, morning–evening | medium |
| jing-jai | ตลาดจริงใจ | weekend farmers/craft | Sat–Sun 06:30–13:00 (to 15:00?) | high |
| one-nimman | วันนิมมาน | lifestyle mall | daily 11:00–21:00/22:00 | medium |
| chang-phueak-market | ตลาดช้างเผือก | day market + night food | night food ~17:00–24:00 | medium |
| thanin | ตลาดธานินทร์ (ศิริวัฒนา) | general, bagged curries | daily 04:30–21:00 | medium |
| sunday-walking-street | ถนนคนเดินท่าแพ | walking street | Sun ~16:00–23:00 | high |
| wualai-saturday | ถนนคนเดินวัวลาย | walking street, silver | Sat ~16:00–22:30 | high |
| night-bazaar | ไนท์บาซาร์ | tourist night market | daily ~17:00–24:00 | high |
| kad-na-mor | กาดหน้ามอ | student night market | daily ~17:00–22:00 | high |
| ton-payom | ตลาดต้นพยอม (ตลาดสุเทพ) | general, near CMU | daily (hours unverified) | medium |
| chiang-mai-gate | ตลาดประตูเชียงใหม่ | morning + evening food | ~04:00–12:00 and ~17:00–24:00 (conflict) | medium |
| nong-hoi | ตลาดหนองหอย | general + organic zone | daily 05:00–20:00 | medium |
| san-pa-khoi | ตลาดสันป่าข่อย | general, east bank | unverified | medium |
| mae-hia | ตลาดสดแม่เหียะ | suburban fresh + prepared food | ~04:00–12:00 (one source: 24h) | high |
| kad-mae-jo-2477 | กาดแม่โจ้ 2477 | university farmers' market | Fri–Sat 07:00–15:00 (or Thu–Fri) | medium |
| yunnan-friday-market | ตลาดนัดจีนยูนาน | Chin Haw / halal / Shan food | Fri ~05:00–12:00 | medium |
| santitham | – | neighbourhood morning market | from ~05:30 | low (no coords) |
| chamcha-market | ตลาดฉำฉามาร์เก็ต | weekend crafts, San Kamphaeng | Sat–Sun 09:00–14:30 | medium (no coords) |

## Conversation points for the app
- **Kad vs talat.** Kham Mueang *kad* (กาด) and Central Thai *talat* (ตลาด) both mean "market". Locals say Kad Luang for Warorot and Kad Na Mor for the CMU market.
- **Take-home foods at Warorot:** sai ua (ไส้อั่ว), nam phrik num (น้ำพริกหนุ่ม), khaep mu (แคบหมู), mu yo (หมูยอ). Travellers often ask for vacuum packs.
- **Ethnic markets.** Use self-designations:
  - **Hmong**, not "Meo" (แม้ว), which is derogatory.
  - **Chin Haw / Yunnanese (จีนฮ่อ)**.
  - **Tai Yai (Shan)**.

  The Friday Yunnan market grew out of Chin Haw Muslims gathering for Friday prayers at Ban Ho mosque. The area is halal, so don't bring pork. Vendors switch between Chinese and Thai.
- **Wua Lai (Saturday)** is the traditional silversmith quarter (Haiya). Wat Sri Suphan has a silver ordination hall.
- **Local markets with little English** are where the app adds the most value: Muang Mai, Mae Hia, Nong Hoi, Ton Payom, San Pa Khoi, Thanin, and early-morning Warorot. **Most English-friendly:** One Nimman, the Night Bazaar and the walking streets.

## API / geodata notes for the hackathon
- **Nominatim (public OSM geocoder)** usage policy:
  - Absolute maximum of 1 request/second.
  - Send a valid identifying User-Agent or Referer; default library user agents are not accepted.
  - Cache results, because repeated identical queries can get you blocked.
  - Client-side **autocomplete is forbidden**.
  - Bulk geocoding is discouraged.
  - Attribution is required: "© OpenStreetMap contributors", ODbL.

  Recommendation: don't geocode at runtime. Ship `places.json` with fixed coordinates and use Haversine for "nearest place". Source: https://operations.osmfoundation.org/policies/nominatim/
- **Overpass (overpass-api.de):** fine below ~10,000 queries and 1 GB per day. For apps and websites, divide by 100 (under ~100 queries and 10 MB per day). No parallel scripts. On a 429 or 406, wait 30 s. Commercial use should self-host. The server is described as overloaded. For the hackathon, run one Overpass query once at build time (e.g. `amenity=marketplace` in the Chiang Mai bbox) and cache it. Source: https://wiki.openstreetmap.org/wiki/Overpass_API
- **what3words** lists Thai ("Thai – ไทย") among its 61 languages, so stalls could in principle get Thai 3-word labels. Caveats:
  - It needs an API key, and the API is commercial with a limited free tier (plan terms not verified).
  - The addresses are proprietary.
  - Stalls move, and a 3 m square is too fine for them. The market-level label is what matters.

  Suggestion: skip it and use lat/lon plus a place id. Source: https://support.what3words.com/en/articles/1520194
- **Longdo Map** (Thai map service) was the best source here for Thai-script market names and coordinates. It has an API (https://map.longdo.com/docs/); terms not checked.
- The Bash sandbox had no outbound network, so no coordinate was checked live against OSM. The coordinates come from the pages listed in `coord_source`.

## Gaps / needs review
- **Not found / unidentified:** "Kad Chiang Mai", "Khuang Singh market" (only the monument was found: 18.81356, 98.98209), "Kad Gao Mai". Santitham market has no coordinates, and its source gives an odd road name.
- **Conflicting hours or days:** Warorot, Jing Jai, Chiang Mai Gate, Mae Hia, Kad Mae Jo 2477, Yunnan market. The Yunnan market's location may also have moved (Charoen Prathet Soi 1 vs Chang Khlan Rd / Plearn).
- **Missing or unconfirmed Thai names:**
  - Missing: Somphet, Ton Lamyai flower market, Hmong lane / Trok Lao Jo, Santitham.
  - Rounded coordinates: One Nimman.
  - Approximate coordinates: the Hmong lane uses Warorot's; Wua Lai uses Wat Sri Suphan's.
- The task brief called Jing Jai a "Chiang Mai University JJ market". Jing Jai is on Assadathon Rd. The CMU market is Kad Na Mor.
