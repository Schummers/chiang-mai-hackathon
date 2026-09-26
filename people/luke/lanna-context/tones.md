# Northern Thai (Kham Mueang) tones vs Central Thai

Context data for **Contextual Translate**. Machine-readable version: `northern_thai_tones.json`.
Confidence tags: **[H]** high, **[M]** medium, **[L]** low. **[REVIEW]** marks items a native speaker should check.

## 1. The short version

- Chiang Mai Kham Mueang has **6 tones** on live (smooth) syllables. Standard/Central Thai has **5**. Checked (dead) syllables have 4 realisations. [H]
  Sources: Wikipedia *Northern Thai language* (citing Gedney 1999 and the 2007 Lanna Dictionary); Taninpong et al. 2026 (*Applied Sciences* 16:160), who write "Northern Thai has six tones while Standard Thai has only five tones"; Khaorian & Liamprawat 2020 (Ko Kha, Lampang: 6 tones).
- Both languages come from the same proto-Tai tone categories (A, B, C, D), and the Thai/Tai Tham tone marks still follow those categories (mai ek ่ = B, mai tho ้ = C). What differs is **how each category split by initial consonant**, and so what pitch it has today. [H]
- Most of the difference comes from three places [H]:
  1. **A-tone words with ก จ ต ป** (mid class in Thai script, no tone mark): mid tone in Bangkok, **low-rising** in Chiang Mai (ตา "eye", กิน "eat").
  2. **Mai tho ้ on high/mid letters** (ป้า, บ้า, เหล้า): falling in Bangkok, **high and glottal ("clipped")** in Chiang Mai. This tone does not exist in Central Thai.
  3. **Short checked syllables with high/mid letters** (ตก, ขุด, หลัก): low in Bangkok, **low-rising** in Chiang Mai.
- Consonants change too, and this matters as much as tone for recognising speech: in many words ร→ฮ (รัก→ฮัก), and many ค ช ท พ lose aspiration (คิด→กึ๊ด, ช้อน→จ๊อน, ทาง→ตาง), but not all: ฅ, คร, ฆ, ฒ, พร, ภ stay aspirated (e.g. คน). Clusters of unaspirated stop + ร become aspirated (ประเทศ→ผะเต้ศ, กราบ→ขาบ). [M] *(Exceptions added by verifier.)*

## 2. The six tones (Chiang Mai)

Contours are Chao numbers (1 = lowest, 5 = highest). Two sources disagree, so both are shown. Gedney's figures come from **one speaker recorded in 1964**. The Lanna Dictionary (2007) is more recent. Tones shift across generations, so treat both as approximate. [M]

| # | Tone | Proto category | Lanna Dict. 2007 | Gedney (1964 data) | Example (six-way /law/ set) |
|---|------|----------------|------------------|--------------------|------------------------------|
| T1 | low-rising | A1-2 | 24 | 14 | เหลา ᩉᩮᩖᩢᩣ *sharpen* |
| T2 | low-falling / mid-low | B1-3 | 21 | 22 | เหล่า ᩉᩮᩖᩢ᩵ᩣ *forest; group* |
| T3 | high-level + glottal closure | C1-3 | 44ʔ | 53ʔ (high-falling, glottalized) | เหล้า ᩉᩮᩖᩢ᩶ᩣ *liquor* |
| T4 | mid-level | A3-4 | 33 | 44 (sometimes rises at end) | เลา ᩃᩮᩢᩣ *beautiful; reed* |
| T5 | high-falling | B4 | 42 | 41 | เล่า ᩃᩮᩢ᩵ᩣ *tell* |
| T6 | high-rising | C4 | 45 | 454ʔ (rising-falling, glottalized) | เล้า ᩃᩮᩢ᩶ᩣ *coop, pen* |

Source: https://en.wikipedia.org/wiki/Lanna_language and https://en.wikipedia.org/wiki/Northern_Thai_language [H for the categories, M for the exact contours]

For comparison, the Central Thai tones (Wikipedia *Thai language*) are: mid 33, low 21, falling 41, high 45 (younger speakers increasingly 334), rising 214.

### Checked (dead) syllables, Chiang Mai [M]

| Category | Northern | Central | Example |
|----------|----------|---------|---------|
| DS1-3 (short vowel; high/mid letter) | low-rising (= T1) | low | หลัก *post* (often spelled หลั๋ก), ตก, ขุด |
| DS4 (short vowel; low letter) | high (contour disputed) **[REVIEW]** | high | ลัก *steal*, นก *bird* |
| DL1-3 (long vowel; high/mid letter) | low-falling (= T2) | low | หลาก *differ*, ปาก, ดอก |
| DL4 (long vowel; low letter) | high-falling (= T5) | falling | ลาก *drag*, มีด *knife* |

DS4 is marked for review because the sources disagree. Wikipedia's checked-syllable table calls it "high-rising", but its comparison table gives นก as "high-falling". Thanajirawat's formula (B4 = DL4 = DS4) also implies high-falling.

## 3. The Gedney tone box: how the split differs

Gedney's box crosses the proto-Tai tones (columns A, B, C, DS, DL) with four kinds of initial consonant (rows):
1. "friction" sounds (aspirated stops, voiceless fricatives, voiceless sonorants): today's **high-class** letters ข ฉ ถ ผ ฝ ส ห หน หม…
2. plain voiceless unaspirated stops: ก จ ต ป
3. glottal/pre-glottalized: อ บ ด อย
4. originally voiced: today's **low-class** letters ค ช ท พ ง น ม ย ร ล ว…

Standard Thai groups rows 2 and 3 together as "mid class". **Northern Thai does not.** In the A column, row 2 (ก จ ต ป) goes with row 1. This is the most important structural difference.

| Proto | Row | Thai-script class | **Northern (CM)** | **Central** | Example | Differs? |
|-------|-----|-------------------|-------------------|-------------|---------|----------|
| A | 1 | High | low-rising 24 | rising 214 | หู *ear* | contour only |
| A | 2 | Mid (ก จ ต ป) | **low-rising 24** | mid 33 | ตา *eye*, กิน *eat* | **YES** |
| A | 3 | Mid (อ บ ด) | mid 33 | mid 33 | ดี *good* | no |
| A | 4 | Low | mid 33 | mid 33 | นา, ทาง/ตาง | no |
| B (่) | 1-3 | High + Mid | low-falling 21 | low 21 | สี่, เต่า, ด่า | no |
| B (่) | 4 | Low | high-falling 42 | falling 41 | แม่, เล่า | no |
| C (้) | 1-3 | High + Mid | **high-level glottal 44ʔ** | falling 41 | เหล้า, ป้า, บ้า | **YES** |
| C (้) | 4 | Low | high-rising 45 | high 45 | ม้า, เล้า | contour [M] |
| DS | 1-3 | High + Mid | **low-rising** | low | ตก, ขุด | **YES** |
| DS | 4 | Low | high (disputed) | high | นก | [REVIEW] |
| DL | 1-3 | High + Mid | low-falling | low | ปาก, ดอก | no |
| DL | 4 | Low | high-falling | falling | มีด, ลาก | no |

Split formulae [M]:
- **Northern (most Tai Yuan varieties):** A12-34, BCD123-4 (B4 = DL4 = DS4). Source: Thanajirawat 2018, as cited on Wikipedia *Lanna language*.
- **Central Thai:** A1-234, B123-4, C123-4, DS123-4, DL123-4. Only five surface tones result because several boxes share the same pitch.

Sources: https://en.wikipedia.org/wiki/Northern_Thai_language , https://en.wikipedia.org/wiki/Proto-Tai_language , https://www.sciencedirect.com/org/science/article/pii/S0859992023000052 (Pornpottanamas 2023, explains the tone-box method)

## 4. Regional variation

| Area | Notes | Conf. |
|------|-------|-------|
| Chiang Mai, Chiang Rai, Phayao, Nan, Phrae, as far as Tak | Same Northern-vs-Standard tone relationships ("typical of Northern Thai"). Phonetic contours may still differ town to town. | M |
| Mae Chaem (Chiang Mai prov.), Laplae (Uttaradit) | Extra merger A34 = B123 = DL123, so fewer contrasts than Chiang Mai city (Thanajirawat 2018) | M |
| Tha Pla (Uttaradit), Xayaburi (Laos) | A12-34, BDL1234, CDS123-4: a different B/D split | M |
| Ratchaburi (Tai Yuan community in central Thailand) | Mergers A34 = B123 = DL123 and B4 = C4 = DL4 | M |
| Ko Kha, Lampang | 6 tones, split pattern like Tai Lue of Chiang Kham; only the phonetic realisation differs (Khaorian & Liamprawat 2020) | H |
| Nan / Chiang Rai / Phrae contours | **Gap.** I found no accessible per-province contour data. Don't make province-specific tone claims. | L [REVIEW] |
| Generations | Gedney (1964) and the Lanna Dictionary (2007) disagree, and younger urban speakers code-switch heavily with Central Thai. | M |

Wikipedia reports that Thanajirawat (2018) proposed five tonal dialect groups; only four were visible in the source I could read.

## 5. Writing tones: Tai Tham vs Thai script

- **Tai Tham (Tua Mueang)** mainly uses two tone marks. Mai yo ᩵ (U+1A75) corresponds to Thai mai ek ่, and mai kho jang ᩶ (U+1A76) to mai tho ้. High- and low-class letters come in pairs, so two marks plus "no mark" on a pair give all six tones (see the /law/ row above). The mid-class letters (ʔ, b, d, j) have no pair, so one mark can stand for more than one tone. Tai Khuen writing added the extra marks ᩷ ᩸ ᩹ to fix this. [M] Source: https://en.wikipedia.org/wiki/Tai_Tham_script
- **Kham Mueang written in Thai script** (on social media, signs, and in ASR output) usually keeps the etymological spelling. Writers then add **๋ (mai jattawa)** or **๊ (mai tri)** to show Northern pronunciation, especially where a consonant lost its aspiration: กิ๋น (กิน), หลั๋ก (หลัก), จ๊อน (ช้อน), กึ๊ด (คิด). This spelling is **not standardised**. [M]
- Many phones have poor Tai Tham font support. The app should show Thai script first and Tai Tham as an optional extra.

## 6. Speech recognition (ASR) pitfalls, and how an LLM can recover the intended word

Evidence:
- Taninpong et al. 2026 (50 h of Chiang Mai speech, 200 speakers): for XLS-R models the largest error types were **"tone misrecognitions and character confusions" (40.29% and 32.58%)**. For TDNN-HMM they were word misrecognitions (38.01%) and vowel confusions (25.98%). [H] https://www.mdpi.com/2076-3417/16/1/160
- PaSCoNT (Taerungruang et al., *Computer Speech & Language* 89): a parallel Northern/Central corpus from 200 Chiang Mai speakers. Training on both dialects lowered WER for each. [H] https://www.sciencedirect.com/science/article/abs/pii/S0885230824000755
- Nuankaew et al. 2025 (LNCS, MIWAI 2024): confusable Kham Mueang vocabulary and accent variants remain hard for HuBERT and wav2vec2 models. [H]

Expected failure modes when a general Thai ASR hears Kham Mueang. These are **inferred from the tone and consonant tables, not an observed confusion list**. [M/L, REVIEW]
1. **De-aspiration.** You get ก จ ต ป where the Central spelling has ค ช ท พ (ตาง/ทาง, จ๊อน/ช้อน, กึ๊ด/คิด), or the ASR picks a different real word.
2. **ร→ฮ.** You get ฮัก or ฮ้อน, which are not Central words, or a wrong ฮ-word.
3. **ก จ ต ป + A words** (กิน, ตา, ใจ) are low-rising. The ASR may add ๋ or choose a rising-tone near-homophone.
4. **Mai tho on high/mid letters** (ป้า, เหล้า, ข้าว) sounds high and glottal. The ASR may choose a high-tone near-homophone. [L]
5. **Northern-only words** (อู้ *speak*, ลำ *delicious*, ม่วน *fun*, ซาว *twenty*, the particle เจ้า) are missing from the ASR vocabulary or get their Central meaning. ลำ in Central Thai is a classifier or "stalk".
6. **Code-switching** within a single sentence.

Suggested normalisation step for the translation prompt [M, design suggestion]:
1. Treat the ASR text as a noisy phonetic transcription.
2. For words that are odd in context, generate candidates:
   - ฮ→ร
   - ก→ค, จ→ช, ต→ท, ป→พ
   - drop ๋ and ๊, then look up the Standard spelling
   - map the heard tone back through the tone box (for example, heard low-rising on ก จ ต ป → Standard mid; heard high-glottal → Standard falling with ้)
3. Rank the candidates with the Kham Mueang glossary and the scene (market, prices, food).
4. If still unsure, show the literal text plus the best guess and ask the user to confirm.

## 7. Romanization in the app

- **RTGS**, the official system on road signs, "does not record tones" and does not mark vowel length. It is useless for tone. [H] https://en.wikipedia.org/wiki/Royal_Thai_General_System_of_Transcription
- Recommendation [M]:
  - Store **Chao numbers** in the data (kin²⁴, law⁴⁴ʔ).
  - For display, use the familiar diacritics: mid unmarked, low `, falling ^, high ´, rising ˇ.
  - Add a distinct marker for the Northern high-glottal tone T3, which has no Central equivalent. A superscript number or a trailing ʔ works.
  - Always show Thai script alongside.

## 8. Tips for foreigners trying Northern phrases

- In many words, soften consonants: ช→จ, ค→ก, ท→ต, พ→ป, and ร→ฮ (ฮัก for รัก). Not every word changes (คน stays aspirated). [M]
- กิ๋น *eat* starts low and rises. Think of the Thai rising tone, not mid. [M]
- Central Thai is understood everywhere, and people usually appreciate a few Northern words (เจ้า, ลำ). Tones differ between towns and generations, so copy the person you're talking to. [L, REVIEW]
- Don't put on a Northern accent as a joke. Keep it sincere.

## Sources

| Source | Kind | Used for |
|--------|------|----------|
| [Northern Thai language, Wikipedia](https://en.wikipedia.org/wiki/Northern_Thai_language) (cites Gedney 1999; Lanna Dictionary 2007; Thanajirawat 2018; Li 1977) | reference | tone inventory, contours, tone-box table, consonant correspondences, examples |
| [Lanna language, Wikipedia](https://en.wikipedia.org/wiki/Lanna_language) | reference | Gedney vs Lanna Dictionary values; Thanajirawat dialect groups |
| [Tai Tham script, Wikipedia](https://en.wikipedia.org/wiki/Tai_Tham_script) | reference | tone marks |
| [Proto-Tai language, Wikipedia](https://en.wikipedia.org/wiki/Proto-Tai_language) | reference | Gedney box, mai ek/mai tho = B/C |
| [Thai language, Wikipedia](https://en.wikipedia.org/wiki/Thai_language) | reference | Central Thai tone values |
| [Taninpong et al. 2026, Applied Sciences](https://www.mdpi.com/2076-3417/16/1/160) | academic | 6 vs 5 tones; ASR error breakdown |
| [Taerungruang et al., PaSCoNT, CSL](https://www.sciencedirect.com/science/article/abs/pii/S0885230824000755) | academic | Northern/Central parallel corpus, ASR |
| [Khaorian & Liamprawat 2020, Wiwitwannasan](https://so06.tci-thaijo.org/index.php/wiwitwannasan/article/view/242012) | academic | Lampang 6-tone system |
| [Pornpottanamas 2023, Manusya](https://www.sciencedirect.com/org/science/article/pii/S0859992023000052) | academic | tone-box method |
| [Nuankaew et al. 2025, LNCS](https://link.springer.com/content/pdf/10.1007/978-981-96-0695-5_8.pdf) | academic | Lanna ASR confusable vocabulary |
| [RTGS, Wikipedia](https://en.wikipedia.org/wiki/Royal_Thai_General_System_of_Transcription) | reference | romanization lacks tone |
| [Ada House blog](https://adahouse-cnx.com/th/blog/kham-mueang-northern-thai), [SSRU vocab list](https://skm.ssru.ac.th/news/view/1392241) | blog (low) | example words (ลำ, ม่วน, ซาว, เจ้า, กิ๋น), code-switching |
