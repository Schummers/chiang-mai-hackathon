# Expert review checklist: tones, cultural norms, highland customs, beliefs

Written by the verifier on 2026-09-26. Covers `northern_thai_tones.json`/`tones.md`, `cultural_norms.json`/`cultural-norms.md`, `highland_customs.json`/`highland-customs.md` and `beliefs_superstitions.json`/`beliefs-superstitions.md`. All four JSON files parse in python3.

The items most likely to affect the demo come first in each group. Tick each one when a native speaker or local expert has confirmed or corrected it.

## Corrections the verifier already made

- **Alcohol hours (legal).** The files said the 14:00-17:00 afternoon ban "still applies". That is out of date. Since the Royal Gazette notice of late May 2026, alcohol can generally be sold 11:00-24:00. The 2025 holy-day exemptions were only a committee proposal in the Khaosod source. The entry is now medium confidence. Sources: https://www.tatnews.org/2026/05/alcohol-sales-and-consumption-rules-updated-in-thailand-what-tourists-need-to-know/ and https://www.khaosodenglish.com/tourism/2025/03/04/thailand-keeps-buddhist-holiday-alcohol-ban-adds-tourism-exemptions/
- **De-aspiration and ร→ฮ.** The files stated these as universal. They now say "in many words" and list Wikipedia's exceptions: ฅ, คร, ฆ, ฒ, พร and ภ stay aspirated, so for example คน does not change. I also added the cluster rule (ประเทศ→ผะเต้ศ, กราบ→ขาบ). This settles the old review item "cluster aspiration has no example". Source: https://en.wikipedia.org/wiki/Northern_Thai_language
- **"Chao khao / hill tribe" as a contested term.** This is now sourced: IWGIA regards "hill tribe" as derogatory. Source: https://en.wikipedia.org/wiki/Hill_tribe_(Thailand)
- **The "y/ny" wording in the cultural-norms tones entry was wrong.** Northern Thai keeps /ɲ/ for ญ, while Central Thai merges it with ย. The entry now says this.
- **Jao for male users.** The app now defaults male users to khap/khrap until a native speaker rules on whether men say jao.
- **Neutral wording.** I removed the statelessness figure from highland small-talk guidance, changed "very colourful" to "brightly coloured", and changed "wear traditional dress mainly for tourists" to neutral wording.
- **Wednesday haircuts.** Downgraded from high to medium confidence, because the only source is a blog. "Many" is now "some".

## 1. northern_thai_tones.json / tones.md

- [ ] **Which contour the C1-3 high-glottal tone (ป้า, เหล้า) has in modern Chiang Mai speech: 44ʔ (Lanna Dictionary 2007) or 53ʔ (Gedney)?** This is the most "Northern-sounding" tone, so the demo's audio and ASR claims rest on it. Why it's uncertain: the two sources disagree, and Gedney's data is 1964 fieldwork. Source: https://en.wikipedia.org/wiki/Northern_Thai_language
- [ ] **The A-column split: do ก จ ต ป words (ตา, กิน) take low-rising?** The only source is Wikipedia, which cites Gedney and the Lanna Dictionary. Taninpong 2026 and Khaorian 2020 confirm there are 6 tones but don't show the box. I believe the split is right. Source: https://en.wikipedia.org/wiki/Northern_Thai_language
- [ ] **What tone do DS4 words (นก, ลัก) take: high-rising or high-falling?** Wikipedia contradicts itself: it transcribes ลัก as /la᷇k/, the same mark as the high-glottal tone. The entry is low confidence. Source: https://en.wikipedia.org/wiki/Lanna_language
- [ ] **C4 (ม้า, เล้า): is it 45 or 454ʔ?** Same problem as above: the two sources disagree.
- [ ] **Do Thai-script Northern spellings (กิ๋น, หลั๋ก, จ๊อน, กึ๊ด) look natural to local readers?** These spellings are not standardised. กึ๊ด for คิด also involves a vowel change that no source confirms.
- [ ] **Does ช always become จ?** Some Central ช words may correspond to ซ in Northern Thai. This was not checked.
- [ ] **The ASR error list is the author's inference, not observed data.** The error-rate figures themselves are verified: tone misrecognition 40.29% and character confusion 32.58% for XLS-R. Source: https://www.mdpi.com/2076-3417/16/1/160
- [ ] **Tip: "Central Thai is understood everywhere".** This comes from a low-confidence blog.

## 2. cultural_norms.json / cultural-norms.md

- [ ] **Do men use jao (เจ้า)?** This matters for the demo because the particle appears in almost every output. Wikipedia says jao is used by women and khap by men. Community sources disagree, and Pantip threads on the question could not be opened. Source: https://en.wikipedia.org/wiki/Northern_Thai_language
- [ ] **Holy-day alcohol exemptions.** Were they gazetted, and what are the 2026 dates (Ok Phansa falls in October)? Source: https://www.khaosodenglish.com/tourism/2025/03/04/thailand-keeps-buddhist-holiday-alcohol-ban-adds-tourism-exemptions/
- [ ] **Lèse-majesté.** Verified against Wikipedia: 3-15 years per count, anyone can file a complaint, and foreigners have been prosecuted for statements made abroad (Joe Gordon) and for defacing royal images (Oliver Jufer). The banknote-stepping point is not in the source. Source: https://en.wikipedia.org/wiki/L%C3%A8se-majest%C3%A9_in_Thailand
- [ ] **Kham Mueang phrase forms.** Check "bo pen yang", and whether it's "khop jai jao" or "khob khun jao". The source is a Centara hotel blog. Source: https://www.centarahotelsresorts.com/journal/northern-thai-language-oo-kam-mueang
- [ ] **Kinship terms ป้ออุ๊ย/แม่อุ๊ย.** Check the spelling, the tones, and at what age people switch from lung/pa to u-i.
- [ ] **Which Lanna temples currently restrict women, and where** (Wat Sri Suphan ubosot, the Inthakhin shrine). Source: https://www.chiangraitimes.com/chiang-mai/chiang-mai-temple-sign-sparks-debate/
- [ ] **Bargaining and tipping norms.** These are low confidence and should not be presented as rules.
- [ ] **Lanna vs Bangkok generalisations** ("softer/slower", female authority in households). Check that the wording doesn't stereotype.

## 3. highland_customs.json / highland-customs.md

- [ ] **Exonyms.** Checked against Wikipedia:
  - Akha regard "Gaw/Ekaw" as derogatory. Source: https://en.wikipedia.org/wiki/Akha_people
  - "Meo" is considered derogatory by Hmong. Source: https://en.wikipedia.org/wiki/Hmong_people
  - Iu Mien don't call themselves "Yao", and Thai government usage has moved to "Iu Mien". Source: https://en.wikipedia.org/wiki/Iu_Mien_people
  - Kayan in Mae Hong Son object to "Padaung", though some Kayan use it themselves. Source: https://en.wikipedia.org/wiki/Kayan_people_(Myanmar)

  Still unsettled: whether Yang/Kariang, Muser, Lisaw, Ngiao and Haw are felt as offensive.
- [ ] **Sgaw Karen phrases** (*Ta bluh doh mah* = "thank you very much"). These come from a US diaspora guide, not from Thai Sgaw speakers. Source: https://mnkaren.org/wp-content/uploads/2017/01/Basic-Karen-Language-Phrases.pdf
- [ ] **Do-not-enter signs.** The taleo (a Lao source) and the Hmong leaf sign (EthnoMed, US) have not been confirmed for Thai villages. Sources: https://www.taeclaos.org/featured_item/taleo/ and https://ethnomed.org/culture/hmong/
- [ ] **Akha gate "a touch defiles it".** Wikipedia describes the gate but says nothing about touching it. The claim comes from a blog. Source: https://www.greenshinto.com/2018/09/17/the-akha-spirit-gate/
- [ ] **Kayan movement and citizenship situation in 2026.** The UNHCR concern dates from 2008. Keep this out of conversation.
- [ ] **The Mien Spirit Day date, Mal/Prai basketry, Khmu metalwork, Tai Khuen communities, and the Lawa founding legends** are unverified.

## 4. beliefs_superstitions.json / beliefs-superstitions.md

- [ ] **ลองหมาน ("first sale" term).** Only one SME article uses it. Check the meaning and romanisation before it's shown in the demo. Source: https://cheechongruay.smartsme.co.th/content/25749/
- [ ] **Pu Sae Ya Sae date.** Wikipedia says it's around the full moon of the 9th Northern lunar month, usually in June, and has faced opposition since 2023. Source: https://en.wikipedia.org/wiki/Pu_Sae_and_Ya_Sae
- [ ] **Inthakhin festival calendar.** Wikipedia says "12th waning day of the 6th lunar month" without naming which calendar; locally it's usually given as the 8th Northern month. Women are barred from the shrine (confirmed). Source: https://en.wikipedia.org/wiki/Inthakhin_(pillar)
- [ ] **Birth-year relic temples.** The Thailand Foundation page confirms only that the elephant replaces the pig and the naga replaces the dragon. The relic-temple pilgrimage claim needs its own source. Source: https://www.thailandfoundation.or.th/culture_heritage/astrology-in-thailand-life-guidance-from-the-stars/
- [ ] **Lanna good and bad days** (wan sia, wan chom, wan fu). These rest on a single Matichon column. Source: https://www.matichon.co.th/weekly/column/article_109027
- [ ] **Wrist string: keep it at least 3 days and don't cut it.** This comes from a general Thai/Lao source.
- [ ] **Everyday taboos** (rainbow, gecko, eye twitch, babies). These come from a blog and are low confidence. Present them as light and optional.
- [ ] **"phi pu nya" and "ho phi"** are Northern forms the author inferred, not taken from a source.
