# Expert review checklist: Lanna context pack

For the team member who knows Thai and Western culture. Compiled 2026-09-26.

Tick an item when you have confirmed it, or write the correction next to it. Section 1 comes first because it directly affects the Warorot demo, where a nomad buys food in late September. The later sections are grouped by file. `EXPERT_REVIEW_culture_tones.md` holds a separate, more detailed checklist for the tones, cultural norms, highland customs and beliefs files. Its top items (whether men say เจ้า, and the contour of the high-glottal tone) are repeated here.

## 0. Already checked by the compiler (no action needed; shown for transparency)

These were spot-checked with WebFetch against the page each fact came from.

- ✅ **ยินดี = thank you in Kham Mueang.** fixconcern.com gives "ยินดีจ๊าดนักเจ้า/ยินดีจ๊าดนักคับ ..แปลว่า..ขอบคุณมากค่ะ/ครับ". Source: https://www.fixconcern.com/greeting-and-asking-questions-in-northern-languages/
- ✅ **Yi Peng 2026 runs 23-25 Nov, and sky lanterns are banned inside Chiang Mai city.** The page says "จัดขึ้นระหว่างวันที่ 23 – 25 พฤศจิกายน 2569". Source: https://www.chiangmainews.co.th/news/chiangmai/4138857/
- ✅ **Salak Yom in Lamphun runs 20-26 Sep 2026.** The grand parade is today, 26 Sep, at 09:30. Source: https://mgronline.com/travel/detail/9690000091382
- ✅ **Ok Phansa is 26 Oct 2026 and Loy Krathong is 24 Nov 2026.** Source: https://myhora.com/calendar/thai-2569.aspx
- ✅ **Alcohol exemptions on Buddhist holy days are in force.** Nation Thailand (25 Feb 2026) cites the Office of the Prime Minister announcement of 2025 as binding. The exempt venues are international airport terminals, hotels, entertainment venues, tourist-zone pubs, bars and karaoke, and special events. `cultural_norms.json` called the exemptions an unconfirmed proposal, so I updated it to match. Source: https://www.nationthailand.com/blogs/news/general/40062977

## 1. Highest impact for the demo

- [ ] **Do men say เจ้า, or only คับ?** The packet tells male users to use คับ. The glossary says เจ้า is "female, also ...", and community sources disagree. *Why it matters:* the particle goes into almost every output. Source: https://en.wikipedia.org/wiki/Northern_Thai_language
- [ ] **Is ยินดีเจ้า the everyday "thank you" at Chiang Mai markets, or do vendors now mostly say ขอบคุณเจ้า?** The meaning is verified (see section 0). What is not verified is how often it is actually used, and the app's false-friend rule depends on it. Source: https://www.fixconcern.com/greeting-and-asking-questions-in-northern-languages/
- [ ] **Which "how much" spelling should be canonical: เต้าใด, เต๊าใด or เต่าใด? And which particle: เจ้า or จ้าว?** The glossary mixes them, for example "อันนี้เต้าใดเจ้า" alongside "ตึงหมดนี่เต่าใดจ้าว". *Why it matters:* ASR output and lookups need one canonical form plus a list of variants. Sources: fixconcern / siamdot pages in `kham_mueang_glossary.json`
- [ ] **ซาว = 20 (ซาวห้า = 25).** Confirm that older vendors at Warorot still count prices this way, and that the "echo the price in digits" rule reads naturally. Source: https://www.sanook.com/campus/1392241/ and the `regional_dialects.json` Chiang Mai app_notes
- [ ] **Guava in Chiang Mai: บะหมั้น, บะก้วย or บะแก๋ว?** Two sources conflict. krunuttaya gives Chiang Mai บะก้วย and "other provinces" บะแก๋ว/บะมั้น. trueplookpanya gives บะหมั้น with no province. บะก้วย also looks close to ก้วย ("banana"), so it may be a truncation. I lowered the glossary entry from high to medium confidence. Sources: https://krunuttaya.wordpress.com/2012/04/05/ (the Northern dialect post) and https://www.trueplookpanya.com/learning/detail/25164
- [ ] **ปี่ vs ปี้ and อ้าย.** The glossary gives ปี่/ปี้ as "older sibling / older sister", but krunuttaya treats ปี้ as the non-Chiang Mai word for older brother (Chiang Mai: อ้าย). Which address term should a nomad use for a vendor who looks about 40? Source: `regional_dialects.json` → krunuttaya
- [ ] **ผักหละ (phak la) as the Northern name for cha-om.** CMU romanises it as "phak la", but the Thai spelling is unverified. This is the "acacia omelette" story case. Also: is ไข่เจียวชะอม seen as local or as Central Thai? Source: https://lannainfo.library.cmu.ac.th/en_lannafood/detail_lannafood.php?id_food=33
- [ ] **Phak kut (fern) season.** The file lists months 5-10, peak 6-9, but these are derived only from "rainy season"; the source gives no months. Is it on sale at Warorot in late September? Source: https://www.khaosod.co.th/technologychaoban/techno-news/article_146330
- [ ] **In-season list for late September** (`context_packet_example.json`): avocado, persimmon, mangosteen, langsat, custard apple, pomelo, dragon fruit, bamboo shoots, het khon / het lom / het daeng / het kamin. Is anything missing or wrong for a Chiang Mai market this week? Sources: FAO, Changpuak, Sansaket, Thailand Foundation (see `seasonal_produce.json`)
- [ ] **Warorot opening hours: 05:00 or 09:00?** Sources conflict. The file says the market runs about 05:00-18:00 and the indoor shops about 09:00-18:00. Source: https://en.wikipedia.org/wiki/Warorot_Market vs https://migrationology.com/warorot-market-chiang-mai/
- [ ] **Tan Kuay Salak is "in season now" (about 15 Sep-26 Oct).** Each temple sets its own date, and the season is estimated from the Lanna month 12-2 rule. Source: https://www.silpa-mag.com/culture/article_38356
- [ ] **Wording of the exonym rule.** The app never uses เงี้ยว, แม้ว, อีก้อ or "hill tribe" for people, but allows dish names such as ขนมจีนน้ำเงี้ยว and ข้าวเงี้ยว. Is that the right line? Should the app also avoid "Chin Haw", "Yang/Kariang" and "Musoe"? Sources: `ethnic_groups.json`, https://en.wikipedia.org/wiki/Shan_language

## 2. kham_mueang_glossary.json / sound_correspondences.json

- [ ] Romanisation convention: no tone marks, and j for จ. Is it readable, and should tones be added? (`northern_thai_tones.json` recommends Chao numbers in the data layer.)
- [ ] Spelling variants of the negative particle: บ่ / บ่อ / บ่ะ (for example บ่ะได้เจ้า next to บ่เผ็ด). Pick a canonical form.
- [ ] Pronoun registers: ข้า (male, formal?), ฮา and คิง (informal or rude), and เจ้า as "you".
- [ ] Particles แล่ (authoritative imperative) and จิ่ม (polite request). Their Central Thai equivalents are approximate.
- [ ] Phrases with no Thai script (Centara romanisation only): bo pen yang jao, an ni a-yang jao, pai tang dai jao, khop-khun jao.
- [ ] ส้ม as a standalone word for "sour", and the script of บ่เผ็ด (put together from a romanisation).
- [ ] Cooking-method glosses: จอ, ส้า, ป่าม (low confidence), หมก, อั่ว.
- [ ] มะแขว่น is glossed as Zanthoxylum prickly ash. One summary called it grains of paradise, which is probably wrong.
- [ ] กาดมั่ว / กาดแลง (morning and evening market). The only source is a Facebook post.
- [ ] ป้าก = ladle or rice paddle. The source's gloss was misspelled.
- [ ] ร→ฮ and de-aspiration apply "in many words", not all. Exceptions: ฅ, คร, ฆ, ฒ, พร, ภ; for example คน does not change. Check the normaliser does not over-apply the rules.
- [ ] **Cross-file spelling: ผักกาดจอ (glossary) vs จอผักกาด (`northern_dishes.json`).** Which order do locals use? Should both be kept as aliases?
- [ ] **Cross-file spelling: ตำบ่าหนุน (glossary dish) vs บะหนุน (glossary ingredient).** Is the prefix บ่า or บะ? Probably both occur.

## 3. regional_dialects.json

- [ ] Which provinces actually use the "other provinces" forms (ปี้, เย้ย, อาว, บะแก๋ว/บะมั้น, หอมน้อย, บะเตด)? The source lumps all of them together.
- [ ] บ่ะฮู้ vs บ่ะฮู่ ("don't know"): which one is the Chiang Mai form and which the eastern form?
- [ ] Eastern tone-spelling pattern (น่ำ, ร่อย): how widely does it hold?
- [ ] The Yong vowel rule: the source says เอือ→เอ, but its own example (เมือง→เมิง) implies เออ.
- [ ] Nantaram Tai Khuen migration date: the SAC source is inconsistent (1907 vs the King Kawila era).
- [ ] Chiang Mai neighbourhood variants "mua huan" vs "pik baan" need Thai script.
- [ ] Tai Yai dish romanisations (Tua Pu Oon, Ok Gai, A-la-wa, Peng-Mong) need Thai script.

## 4. climate_by_month.json / weather_apis.json

- [ ] Lanna months = Central Thai months + 2 (เดือนเกี๋ยง ≈ October, เดือนยี่ ≈ November). Do locals still count this way? The app flags "เดือนยี่" as ambiguous: to a Northern speaker it means November, to a Central speaker about January. Is that right?
- [ ] ฮ้อนใบ้ฮ้อนง่าว vs ฮ้อนไบ้ฮ้อนง่าว. Are there Northern words for cold, rain and haze?
- [ ] Hed thop price: `climate-seasons.md` says 100-500 THB per litre (2025), `seasonal_produce.json` says about 150-300 THB per litre (2015). Both may be right, since they are different years.
- [ ] Wording of the haze-season note on burning and the het thop belief. Keep it neutral and do not blame hill farmers or minorities.
- [ ] The Air4Thai station ID (35t) and the TMD API parameters are unverified. Nothing was tested live.

## 5. seasonal_produce.json / northern_dishes.json

- [ ] **Compiler fix:** I removed the unsourced Northern spelling "ดอกเงี้ยว / dok ngiao" for the kapok flower (ดอกงิ้ว), because it mixed up งิ้ว with the Shan exonym. Confirm whether the Northern name is simply ดอกงิ้ว.
- [ ] Northern spellings: จิ๊นส้ม, แกงโฮะ vs แกงโฮ, หลู้, ไข่ป่าม, แอ็บ, ขั่วผำ, แก๋งเห็ดถอบ.
- [ ] The river weed ไก vs ไค (the Mekong weed from Chiang Khong), and whether Chiang Mai vendors use the word. It is a different thing from ผำ (Wolffia).
- [ ] Mushroom species: het lom, het khai (Russula or Amanita?). Also the identity of "phak khae".
- [ ] "Ma kor", a savoury fruit eaten in Aug-Sep, has no Thai script and no confirmed botanical ID (the source says Lithocarpus ceriferus).
- [ ] Pomelo season: one source says a July peak, another says Sep-Nov.
- [ ] Bamboo shoot months (Jun-Sep, low confidence) and the tangerine label ("Som Fang" / Sai Nam Phueng).
- [ ] Tone of the health note for raw larb / lu aimed at visitors.

## 6. festival_calendar.json / etiquette.json

- [ ] Pi Mai Mueang day mapping: MJU says 13-16 Apr, Bangkok Biz says 14-16 Apr. Is Wan Nao spelled เนา or เน่า?
- [ ] The Inthakhin rule "begins in the waning half of Lanna month 8" and the resulting 2027 estimate of about 1-8 June.
- [ ] **Salak Yom tree height:** the calendar says 3-12 m, but the MGR page fetched today says 3-8 m. Minor.
- [ ] Salak Yom origin: the Lamphun page ties it to the Yong people. A translation step had misread this as Lisu; check that the correction is right.
- [ ] "หมูหนึ่ง" in the Silpa basket list: is it หมูนึ่ง (steamed pork)?
- [ ] Hmong New Year: the calendar estimates 15 Dec-15 Jan, `ethnic_groups.json` says around Nov-Dec, and the Hmong calendar says late Dec-Jan. Dates are village-specific.
- [ ] Lanna lantern terms (khom khwaen, khom fai, phang prathip) need Thai script from a Lanna source.
- [ ] Unsourced customs that are widely repeated: the national anthem at 08:00/18:00, monks not eating after noon, not stepping on banknotes, locals asking your age or salary, wrist strings at su khwan.
- [ ] Phit phi: how to word it for foreigners who date locals.
- [ ] Kaeng khanun as a "support" pun at New Year and weddings. The pun is not in the fetched source.
- [ ] The women-restricted areas at Inthakhin and Wat Sri Suphan. The Wat Sri Suphan rule was not in the cited pages.

## 7. ethnic_groups.json / highland_customs.json

- [ ] Whether Ngiao, Musoe/Musser, Lisaw, Yang/Kariang and Chin Haw are felt as offensive in everyday Chiang Mai speech.
- [ ] Thai-script exonyms added without a fetched source: แม้ว, อีก้อ, ข่า, อาข่า, ลาหู่, ลีซู.
- [ ] The Karen greetings come from a US diaspora guide (Sgaw). Are they right for Thai Karen speakers?
- [ ] Lahu phrases come from a learner's PDF. The Shan "Mai Soong" has no Shan script. Mingalaba is low confidence.
- [ ] Chin Haw self-designation: Chin Haw, Yunnanese or Hui?
- [ ] Ban Haw Mosque date (19th century vs 1916) and soi (1 vs 6).
- [ ] "About 90% of the 100k+ migrant workers in Chiang Mai Province are Shan" (Citylife). Check the wording so it is not used to guess anyone's ethnicity.

## 8. places.json

- [ ] The likely languages per market are inferred, not surveyed. How much Kham Mueang do older vendors speak at Muang Mai, Mae Hia, Nong Hoi, Ton Payom and Thanin?
- [ ] Unconfirmed Thai names: Somphet (ตลาดสมเพชร?), the Ton Lamyai flower market, the Trok Lao Jo / Hmong lane, Santitham, and Thanin (ธานินทร์ vs ธานินท์).
- [ ] Yunnan Friday market: current location (Charoen Prathet Soi 1 or Chang Khlan / Plearn) and whether it runs Friday only.
- [ ] Hours conflicts: Jing Jai (closes 13:00 or 15:00), Chiang Mai Gate, Mae Hia, Kad Mae Jo 2477 (Fri-Sat or Thu-Fri).
- [ ] Santitham and Chamcha markets have `null` coordinates. The Hmong lane, Wua Lai and Yunnan market coordinates are approximate, borrowed from a nearby landmark. All 21 coordinates that are present fall inside the Chiang Mai box (18.6-19.0 N, 98.8-99.1 E).

## Compiler fixes (2026-09-26)

1. `cultural_norms.json` / buddhist_holidays_alcohol: replaced "exemptions only proposed, not confirmed" with the enacted 2025 PM Office announcement as reported by Nation Thailand on 25 Feb 2026, and added that source. This makes it consistent with `festival_calendar.json` and `etiquette.json`.
2. `seasonal_produce.json` / dok-ngiu: set `kham_mueang_thai` to null (it had been an unsourced "ดอกเงี้ยว") and `kham_mueang` to "dok ngiu", and added a note.
3. `kham_mueang_glossary.json` / บะหมั้น: lowered confidence from high to medium and added a note on the regional conflict.
4. `regional_dialects.json` cross_cutting: made clear that the "never output เงี้ยว" rule applies to people, not to dish names.
