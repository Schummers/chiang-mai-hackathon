# Kham Mueang (Northern Thai / Lanna): language overview and resources

For: Contextual Translate (Claude Impact Labs, Chiang Mai, 2026-09-26). Companion files: `kham_mueang_glossary.json` (187 entries) and `sound_correspondences.json`.
Confidence tags: [H] high, [M] medium, [L] low. Anything [M] or [L] should be checked by the team's Thai/Western culture reviewer.

## 1. Overview (facts to put in the context packet)

| Item | Fact | Source | Conf. |
|---|---|---|---|
| Names | Kham Mueang / Kam Mueang (คำเมือง, also written กำเมือง, "language of the mueang"), Northern Thai, Lanna, Tai Yuan. ISO 639-3 `nod` | [Wikipedia](https://en.wikipedia.org/wiki/Northern_Thai_language), [Glottolog nort2740](https://glottolog.org/resource/languoid/id/nort2740) | H |
| Family | Kra-Dai (Tai-Kadai) > Tai > Southwestern Tai, Chiang Saen branch with Central and Southern Thai | Wikipedia | H |
| Speakers | About 6 million (2015 figure), mainly in the 8 upper-northern provinces; about 29,500 more in Oudomxay and Xayaburi, Laos | Wikipedia; [Omniglot](https://www.omniglot.com/writing/northernthai.htm) | M (the figures are dated; Ethnologue returned 403 so we could not check it) |
| Status | Recognised minority language. Central Thai dominates school and media, and many younger urban people mix the two | Wikipedia | M |
| Scripts | Traditionally Tai Tham (Lanna script, ตัวเมือง *tua mueang* / ตัวธรรม *tua tham*). Today it is usually written in Thai script, informally, with extra tone marks (๋ ๊). Most native speakers cannot read Tai Tham | Wikipedia, Omniglot | H |
| Tai Tham in Unicode | Block U+1A20–U+1AAF. Font: Noto Sans Tai Tham (Google Fonts) | [Unicode chart](https://www.unicode.org/charts/nameslist/n_1A20.html), [Noto](https://fonts.google.com/noto/specimen/Noto+Sans+Tai+Tham) | H |
| Tones | Chiang Mai: 6 tones on smooth (live) syllables and 4 on checked syllables. Central Thai has 5. Thai-script spellings of Northern words therefore only approximate the tones | Wikipedia | H |
| Key consonant shifts | Central aspirated ค ช ท พ become unaspirated ก จ ต ป. Central ร becomes ฮ. ญ is a nasal /ɲ/. See `sound_correspondences.json` | Wikipedia | H |
| Politeness | Final particle **เจ้า jao** (female, and a polite "yes"), **คับ khap** (male). **ยินดี yindi = thank you** (in Central Thai it means "glad" or "you're welcome") | [siamdot](https://chiangmai.siamdot.com/thai-northern-language/), [fixconcern](https://www.fixconcern.com/greeting-and-asking-questions-in-northern-languages/) | H |
| Regional variation | Accents differ across Chiang Mai–Lamphun, Lampang, Chiang Rai–Phayao, Phrae and Nan. One source notes its phrases are a Chiang Rai accent. Nan and Phrae are commonly described as distinct. Some words differ by province (e.g. ก้วย "banana" is marked as Lampang) | [fixconcern sentences](https://www.fixconcern.com/northern-language-sentences/), [chiangrai108](https://www.chiangrai108.com/artsculture/10392/) | L (we found no authoritative dialect map; needs expert review) |
| Related languages in the North | Tai Lue, Tai Khün and Shan (Tai Yai) are related Tai languages. Hill-country groups speak Karen, Hmong, Mien, Akha, Lahu, Lisu and other languages | [Wikipedia Tai Lue](https://en.wikipedia.org/wiki/Tai_Lue_language), [Khün](https://en.wikipedia.org/wiki/Kh%C3%BCn_language) | M (covered in more depth by the ethnicity workstream) |

**Guidance for the prompt:** Vendors in Chiang Mai markets code-switch. Most will understand Central Thai and some English. For the nomad, output should be in **Central Thai with an optional Kham Mueang phrase** (e.g. ending with เจ้า/คับ, saying ลำขนาด or ยินดีเจ้า). Do not attempt full Kham Mueang generation: the web data is too thin and tone spellings are unstandardised.

## 2. Resources

| Resource | Type | Link | Licence / usability for a hackathon | Conf. |
|---|---|---|---|---|
| Wikipedia: Northern Thai language | Overview, tones, correspondences, small vocabulary table | https://en.wikipedia.org/wiki/Northern_Thai_language | CC BY-SA 4.0; OK to quote with attribution | H |
| Wiktionary: Category Northern Thai language | Community dictionary entries (Thai script + Tai Tham) | https://en.wiktionary.org/wiki/Category:Northern_Thai_language | CC BY-SA; could be scraped via Wiktextract dumps (not tested, our fetch was blocked) | M |
| พจนานุกรมล้านนา-ไทย ฉบับแม่ฟ้าหลวง (Lanna–Thai Dictionary, Mae Fah Luang ed.), Udom Rungruangsri, Chiang Mai: Ming Muang, 2004 | Print dictionary, the standard reference | cited in https://so03.tci-thaijo.org/index.php/liberalartsjournal/article/view/128511 | Copyrighted print; for human reference only | H |
| พจนานุกรมภาษาล้านนา / The Lanna Dictionary, Chiang Mai Rajabhat University, 2007, 649 pp., ISBN 9789747793567 | Print dictionary | https://library.tcdc.or.th/record/view/b00030033 ; flipbook copy: https://online.pubhtml5.com/wgtk/nrtf/ | Copyrighted. The flipbook is a third-party upload; do not ingest | H (record) / L (flipbook legitimacy) |
| Omniglot: Northern Thai | Tai Tham script charts, font download | https://www.omniglot.com/writing/northernthai.htm | Free to view; © Omniglot | H |
| OLAC: resources in/about nod | Catalogue of archival and academic resources | http://www.language-archives.org/language/nod | Index only; each item has its own licence | M |
| Glottolog nort2740 | Bibliography | https://glottolog.org/resource/languoid/id/nort2740 | CC BY 4.0 | H |
| **SLSCU Thai-Dialect corpus** (Chulalongkorn) | Speech + transcripts: 700 h Central, **40 h Khummuang**, plus Korat and Pattani. Some sentences are parallel across dialects | https://github.com/SLSCU/thai-dialect-corpus ; paper: https://ieeexplore.ieee.org/document/10389792/ | **CC BY-SA 4.0.** Usable. Download via Google Drive. Test sets withheld | H |
| SLSCU Khummuang ASR model | Pretrained baseline ASR | https://huggingface.co/SLSCU/thai-dialect_khummuang_model | Licence not verified on the model card; check it | M |
| **CMKL Porjai Thai voice dataset – Khummuang** | 24.5k rows: audio (mp3), colloquial transcript **plus a standard Thai version** | https://huggingface.co/datasets/CMKL/Porjai-Thai-voice-dataset-khummuang | **CC BY-NC-SA 4.0.** Fine for a non-commercial hackathon demo. The colloquial→standard pairs could be mined for extra glossary items | H |
| PaSCoNT: Parallel Speech Corpus of Northern-Central Thai (Taerungruang, Bootkrajang et al., CMU; *Computer Speech & Language*, 2024) | 100 h (50 h Northern + 50 h Central) from the same 200 speakers, 6,279-word vocabulary | https://www.sciencedirect.com/science/article/abs/pii/S0885230824000755 | Public availability not stated; contact the CMU authors | H (facts) / L (access) |
| **Taninpong et al. (2025/26), "The Development of Northern Thai Dialect Speech Recognition System", *Applied Sciences* 16(1):160 (MDPI)**, CMU + NECTEC | 50 h, 200 speakers, 20k utterances, IPA transcription with tones. Kaldi TDNN-HMM vs XLS-R (300M/1B). The XLS-R + 5-gram LM scored best (reported as "WER 0.94"; units unclear, possibly %). | https://www.mdpi.com/2076-3417/16/1/160 (doi:10.3390/app16010160) | The article is open access (CC BY). **The dataset and code are not stated as released** | H |
| MDPI Electronics 15(6):1271, CNN Thai dialect recognition from spectrograms | Dialect identification | https://www.mdpi.com/2079-9292/15/6/1271 | Open access paper; data not checked | M |
| Springer chapter: "Speech Recognition Model for Confused Thai Lanna Vocabulary Using Deep Learning" | ASR for confusable Lanna words | https://link.springer.com/content/pdf/10.1007/978-981-96-0695-5_8.pdf | Paywalled | M |
| Web vocabulary lists (Thai-language) | Kham Mueang → Central lists used for our glossary | sanook, tewfree, ssru, trueplookpanya, wongnai, gotoknow, fixconcern (several), chiangrai108, reviewchiangmai, siamdot (URLs are in each glossary entry) | Copyrighted web pages. We used them for facts and short word pairs only. Quality varies and spellings are inconsistent | M |
| Centara Hotels, "Know your Kam Mueang" | 15 tourist phrases, romanised only | https://www.centarahotelsresorts.com/journal/northern-thai-language-oo-kam-mueang | Copyrighted; romanisation is ad hoc | M |
| Northern food glossaries | Dish names in Thai script | https://blog.bangkokair.com/northern-thai-food/ , https://krua.co/food_story/northen-thai-popular-recipes , https://www.wongnai.com/food-tips/top-35-must-try-northern-thai-dishes | Copyrighted; facts only | H |

**Not found or not verified:** a public Kham Mueang dictionary API; a maintained mobile dictionary app (a search turned up only general Thai dictionaries); curated YouTube courses (none opened or checked); an open Northern↔Central text MT parallel corpus. The Porjai and SLSCU transcript pairs are the closest thing to one.

**Best hackathon path:** (1) Put our glossary plus the lexical map in the prompt. (2) Optionally mine the Porjai-khummuang colloquial/standard transcript pairs for more word pairs (it is non-commercial only). (3) For speech input, the SLSCU Khummuang model (check its licence) or Whisper-Thai with Central fallback.

## 3. Romanisation conventions used in the JSON
- `central_thai_roman`: RTGS, without tones (ช/จ = ch, ค/ข = kh, พ/ผ = ph).
- `kham_mueang_roman`: a practical Northern romanisation **without tones**. It writes จ as **j**, because Northern speakers turn Central ch- into j-/ch- unaspirated and English readers pronounce j closer to it. So jao, not chao. ฮ = h. Vowels follow RTGS.
- Where a source gave only romanisation (Centara), `kham_mueang_thai_script` is `null`.

## 4. Known caveats
- Web sources spell the same word in several ways (เต้าใด/เต๊าใด/เต่าใด; ปี่/ปี้; บ่/บ่อ/บ่ะ/หมะ). Normalise by stripping tone marks when matching.
- เปิ้น can mean "I" or "he/she" depending on context.
- คิง and ฮา are informal/intimate pronouns and ง่าว means "stupid". The app should never put these in a foreigner's mouth, and should flag them as rude when a local uses them.
- Some food items (ลาบดิบ raw larb, จิ๊นส้ม fermented pork, blood in ข้าวกั๊นจิ๊น and น้ำเงี้ยว) deserve a neutral "ingredients" note for visitors, not a judgement.
